import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { title, slug, pin } = await req.json();

    // Kontrola PINu přímo z Vercel proměnné
    if (pin !== process.env.GURU_PIN) {
      return NextResponse.json({ error: 'Špatný PIN, kámo. Sem nemáš přístup.' }, { status: 401 });
    }

    if (!title) {
      return NextResponse.json({ error: 'Nezadal jsi název hry.' }, { status: 400 });
    }

    let rawText = '';
    let sourceUsed = '';

    // 1. ZKUSÍME PCGAMINGWIKI
    try {
      const searchRes = await fetch(`https://www.pcgamingwiki.com/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(title)}&utf8=&format=json`);
      const searchData = await searchRes.json();
      
      if (searchData.query && searchData.query.search.length > 0) {
        const exactTitle = searchData.query.search[0].title;
        const pageRes = await fetch(`https://www.pcgamingwiki.com/w/api.php?action=query&prop=extracts&titles=${encodeURIComponent(exactTitle)}&explaintext=1&format=json`);
        const pageData = await pageRes.json();
        const pages = pageData.query.pages;
        const pageId = Object.keys(pages)[0];
        rawText = pages[pageId].extract || '';
        sourceUsed = 'PCGamingWiki';
      }
    } catch (e) {
      console.log('PCGamingWiki selhalo, jdeme na Serper.');
    }

    // 2. KDYŽ PCGW NIC NENAJDE, ZAPOJÍME SERPER
    if (!rawText || rawText.length < 100) {
      try {
        const serperRes = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: {
            'X-API-KEY': process.env.SERPER_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            q: `${title} PC optimization FPS boost max fps settings guide`,
            gl: 'us',
            hl: 'en'
          })
        });
        const serperData = await serperRes.json();
        
        if (serperData.organic) {
          rawText = serperData.organic.map(res => `${res.title}: ${res.snippet}`).join('\n\n');
          sourceUsed = 'Google Serper API';
        }
      } catch (e) {
        console.error('Serper selhal:', e);
      }
    }

    if (!rawText || rawText.length < 50) {
      return NextResponse.json({ error: 'Nenašel jsem k tomu žádné návody ani na PCGW, ani na Googlu.' }, { status: 404 });
    }

    // 3. VYGENERUJEME HTML A SEO POPIS PŘES GPT
    const shortText = rawText.substring(0, 3000); 
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo", 
      messages: [
        { role: "system", content: "Jsi 'The Hardware Guru'. Píšeš drsně, no bullshit. Vygeneruj JSON." },
        { role: "user", content: `Hra: ${title}\nZdroj dat: ${sourceUsed}\nData:\n\n${shortText}\n\nVygeneruj JSON:\n1. "seo_description": Krátký SEO popis (max 150 znaků). TENTO POPIS MUSÍ VŽDY ZAČÍNAT SLOVY "Optimalizace ${title} - ".\n2. "html_content": Napiš HTML návod na zvýšení FPS (použij <h2>, <p>, <ul>, <li>, <strong>).` }
      ],
      response_format: { type: "json_object" }
    });

    const aiContent = JSON.parse(completion.choices[0].message.content.trim());
    let aiHtmlContent = aiContent.html_content.replace(/^```html/i, '').replace(/```$/i, '').trim();

    // 4. OBRÁZEK Z DALL-E DO SUPABASE
    let finalImageUrl = '';
    try {
      const imageRes = await openai.images.generate({
        model: "dall-e-3",
        prompt: `A dark, high-tech, cinematic gaming PC hardware illustration related to optimizing the video game ${title} for max FPS. Neon yellow and dark grey accents. Cyberpunk aesthetic, glassmorphism, no text, glowing PC components.`,
        n: 1,
        size: "1024x1024",
      });

      const tempImageUrl = imageRes.data[0].url;
      const fetchImg = await fetch(tempImageUrl);
      const imgBlob = await fetchImg.blob();
      const fileName = `tweaky/${slug || 'auto'}-${Date.now()}.png`;

      const { error: uploadError } = await supabaseAdmin.storage.from('images').upload(fileName, imgBlob, { contentType: 'image/png', upsert: true });
      if (!uploadError) {
        const { data: publicUrlData } = supabaseAdmin.storage.from('images').getPublicUrl(fileName);
        finalImageUrl = publicUrlData.publicUrl;
      }
    } catch (e) {
      console.error("Chyba obrázku:", e);
    }

    return NextResponse.json({
      seo_description: aiContent.seo_description,
      html_content: aiHtmlContent,
      image_url: finalImageUrl,
      source: sourceUsed
    });

  } catch (error) {
    console.error('Kritická chyba backendu:', error);
    return NextResponse.json({ error: error.message || 'Neznámá chyba serveru.' }, { status: 500 });
  }
}
