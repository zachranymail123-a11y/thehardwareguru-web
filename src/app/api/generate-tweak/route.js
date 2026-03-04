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
            q: `${title} PC optimization config ini file stuttering fix FOV`,
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

    // 3. HARDCORE GURU PROMPT PRO GPT
    const shortText = rawText.substring(0, 4000); 
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo", 
      messages: [
        { 
          role: "system", 
          content: "Jsi 'The Hardware Guru', expert na PC hardware a úpravu herních configů. Tvůj styl je drsný a technický. ZAKAZUJI TI psát obecné rady jako 'aktualizujte ovladače', 'snižte rozlišení', 'vypněte V-Sync' nebo 'zavřete programy na pozadí'. To všichni ví." 
        },
        { 
          role: "user", 
          content: `Hra: ${title}\nZdroj dat: ${sourceUsed}\nData:\n\n${shortText}\n\nVYGENERUJ JSON S KLÍČI:\n1. "seo_description": Krátký popis začínající "Optimalizace ${title} - " (max 150 znaků).\n2. "html_content": Napiš technický HTML návod (použij <h2>, <p>, <ul>, <li>, <code>, <strong>). ZAMĚŘ SE VÝHRADNĚ NA: Úpravy v .ini/.cfg souborech (cesty a proměnné), parametry spouštění (Steam launch options), fixy na stuttering (engine tweaky), komunitní módy nebo úpravy v registrech. Pokud k této hře nejsou v datech žádné hluboké technické fixy, napiš konkrétní hardwarové zhodnocení (např. 'Hra je CPU limitovaná kvůli špatnému Enginu, nepomůže vám ani RTX 4090, jediná záchrana je Frame Gen...'). BUĎ KONKRÉTNÍ.` 
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.4 // Nižší teplota = více se drží faktů a nevymýšlí si blbosti
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
