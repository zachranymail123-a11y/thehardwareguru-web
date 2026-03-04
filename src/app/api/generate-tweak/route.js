import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Admin Supabase klient pro nahrávání souborů
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { title, slug } = await req.json();

    if (!title) {
      return NextResponse.json({ error: 'Nezadal jsi název hry.' }, { status: 400 });
    }

    // 1. Získáme data z PCGamingWiki
    const searchRes = await fetch(`https://www.pcgamingwiki.com/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(title)}&utf8=&format=json`);
    const searchData = await searchRes.json();
    
    if (!searchData.query.search.length) {
      return NextResponse.json({ error: 'Hra nebyla na PCGamingWiki nalezena.' }, { status: 404 });
    }
    
    const exactTitle = searchData.query.search[0].title;
    const pageRes = await fetch(`https://www.pcgamingwiki.com/w/api.php?action=query&prop=extracts&titles=${encodeURIComponent(exactTitle)}&explaintext=1&format=json`);
    const pageData = await pageRes.json();
    const pages = pageData.query.pages;
    const pageId = Object.keys(pages)[0];
    const rawText = pages[pageId].extract || '';
    const shortText = rawText.substring(0, 3000); 

    // 2. Vygenerujeme Text přes GPT
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "Jsi 'The Hardware Guru'. Píšeš drsně, bez servítků, používáš občas sprostá slova, když vývojáři něco odfláknou. Tvým úkolem je vytvořit krátký SEO popis a HTML článek s fixy na základě dat z PCGamingWiki. Obaluj herní termíny do tagu <strong>." },
        { role: "user", content: `Data z PCGW pro ${exactTitle}:\n\n${shortText}\n\nVygeneruj JSON:\n{\n  "seo_description": "Krátký úderný popis do 150 znaků.",\n  "html_content": "HTML článek s <h2> a <p>."\n}` }
      ],
      response_format: { type: "json_object" }
    });

    const aiContent = JSON.parse(completion.choices[0].message.content);

    // 3. Vygenerujeme Obrázek přes DALL-E
    const imageRes = await openai.images.generate({
      model: "dall-e-3",
      prompt: `A dark, high-tech, cinematic gaming PC hardware illustration related to the video game ${title}. Neon yellow and dark grey accents. Cyberpunk aesthetic, glassmorphism, no text, glowing PC components.`,
      n: 1,
      size: "1024x1024",
    });

    const tempImageUrl = imageRes.data[0].url;

    // 4. Stáhneme DALL-E obrázek k nám a nahrajeme ho trvale do Supabase
    let finalImageUrl = tempImageUrl; // Záloha
    
    try {
        const fetchImg = await fetch(tempImageUrl);
        const imgBlob = await fetchImg.blob();
        
        // Vytvoříme unikátní název souboru
        const fileName = `tweaky/${slug || 'auto'}-${Date.now()}.png`;

        // Nahrajeme do bucketu 'images' (změň název bucketu, pokud máš jiný)
        const { data: uploadData, error: uploadError } = await supabaseAdmin
            .storage
            .from('images') 
            .upload(fileName, imgBlob, {
                contentType: 'image/png',
                upsert: true
            });

        if (!uploadError) {
            // Získáme veřejnou URL pro ten náš nahraný obrázek
            const { data: publicUrlData } = supabaseAdmin.storage.from('images').getPublicUrl(fileName);
            finalImageUrl = publicUrlData.publicUrl;
        } else {
            console.error("Chyba nahrávání do Supabase:", uploadError);
        }
    } catch(imgError) {
        console.error("Chyba při stahování/nahrávání obrázku:", imgError);
    }

    // 5. Vrátíme výsledek s už trvalou URL
    return NextResponse.json({
      seo_description: aiContent.seo_description,
      html_content: aiContent.html_content,
      image_url: finalImageUrl
    });

  } catch (error) {
    console.error('AI Generování selhalo:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
