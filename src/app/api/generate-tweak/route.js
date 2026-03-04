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

    // 1. ZKUSÍME PCGAMINGWIKI (Nejlepší na configy)
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

    // 2. KDYŽ PCGW NESTAČÍ, JDEME NA GOOGLE PRO REDDIT TWEAKY A POŽADAVKY
    if (!rawText || rawText.length < 500) {
      try {
        const serperRes = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: {
            'X-API-KEY': process.env.SERPER_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            q: `${title} PC optimization stuttering fix config ini system requirements steam reddit`,
            gl: 'us',
            hl: 'en'
          })
        });
        const serperData = await serperRes.json();
        
        if (serperData.organic) {
          rawText += '\n\n' + serperData.organic.map(res => `${res.title}: ${res.snippet}`).join('\n\n');
          sourceUsed = sourceUsed ? 'PCGamingWiki + Google Serper' : 'Google Serper API';
        }
      } catch (e) {
        console.error('Serper selhal:', e);
      }
    }

    if (!rawText || rawText.length < 50) {
      return NextResponse.json({ error: 'Nenašel jsem k tomu žádná data. Zkontroluj název hry.' }, { status: 404 });
    }

    // 3. BRUTÁLNÍ GURU PROMPT PRO GPT (Nutí ho psát detaily a tabulky)
    const shortText = rawText.substring(0, 4000); 
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo", 
      messages: [
        { 
          role: "system", 
          content: "Jsi 'The Hardware Guru', nekompromisní expert na PC hardware a optimalizaci her. Píšeš drsně, technicky a bez omáčky. Tvým úkolem je vytvořit EXTRÉMNĚ detailní návod. PŘÍSNĚ ZAKAZUJI psát obecné rady jako 'aktualizujte ovladače', 'zavřete programy na pozadí' nebo 'snižte detaily'. Pokud to uděláš, selhal jsi." 
        },
        { 
          role: "user", 
          content: `Hra: ${title}
Zdroj dat k analýze: ${sourceUsed}
Data z internetu:
${shortText}

POKYN: Vytvoř ultimátní optimalizační článek v HTML. Pokud data z internetu nejsou dost detailní, POUŽIJ SVOU VLASTNÍ BÁZI ZNALOSTÍ o této hře, jejím enginu a systémových požadavcích. Článek musí být dlouhý, formátovaný pomocí <h2>, <ul>, <li>, a pro cesty k souborům používej <code>.

Vygeneruj JSON s těmito klíči:
1. "seo_description": SEO popis (max 150 znaků). MUSÍ začínat "Optimalizace ${title} - ".
2. "image_prompt": Bezpečný prompt pro DALL-E 3 podle žánru hry (bez názvu hry), přesně jak jsme se dohodli dříve (dark, high-tech, neon accents).
3. "html_content": Vygeneruj kód, který MUSÍ MÍT TUTO STRUKTURU:
   - <h2>Guru Analýza</h2>: Drsně zhodnoť technický stav hry. Je to odfláknutý port? Jaký to má engine (Unreal 5, REDengine)? Kde to drhne?
   - <h2>Systémové požadavky (Steam)</h2>: Vypiš Minimální a Doporučené požadavky v přehledném seznamu.
   - <h2>Hardcore Úpravy a Fixy</h2>: Tohle musí být maso. Úpravy v .ini souborech (přesné cesty např. v %LOCALAPPDATA%), parametry spouštění ve Steamu (např. -dx12, -high), fixy na VRAM memory leaky nebo komunitní mody (DLSS Unlocker). Vymysli to na základě reálných technických možností enginu.
   - <h2>Nastavení ve hře: Co zabíjí FPS</h2>: Vyjmenuj 2-3 konkrétní grafická nastavení v menu této hry (např. volumetrická mlha, ray-tracing odrazy) a poraď, na co je stáhnout, aby grafika netrpěla, ale FPS vyletěly.` 
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5 // Dělá AI více analytickou a přesnou
    });

    const aiContent = JSON.parse(completion.choices[0].message.content.trim());
    let aiHtmlContent = aiContent.html_content.replace(/^```html/i, '').replace(/```$/i, '').trim();
    const safeImagePrompt = aiContent.image_prompt || "A dark, high-tech, cinematic gaming PC hardware illustration. Neon yellow and dark grey accents. Cyberpunk aesthetic, glassmorphism, glowing PC components.";

    // 4. OBRÁZEK Z DALL-E DO SUPABASE
    let finalImageUrl = 'EMPTY';
    try {
      const imageRes = await openai.images.generate({
        model: "dall-e-3",
        prompt: safeImagePrompt,
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
      console.error("DALL-E Chyba obrázku:", e);
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
