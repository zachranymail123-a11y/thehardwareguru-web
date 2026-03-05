import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { title, slug, pin } = await req.json();
    // GURU POJISTKA: Používáme tvůj GURU_PIN z .env
    if (pin !== process.env.GURU_PIN) return NextResponse.json({ error: 'Špatný PIN, kámo!' }, { status: 401 });

    // 1. GURU REŠERŠE (Serper.dev)
    let rawText = '';
    try {
      const serperRes = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: `${title} PC optimization steam reddit config settings stuttering fix engine.ini`,
          gl: 'us', hl: 'en'
        })
      });
      const data = await serperRes.json();
      rawText = data.organic?.map(res => `${res.title}: ${res.snippet}`).join('\n\n') || '';
    } catch (e) { console.error('Serper fail'); }

    // 2. PARALELNÍ GIGANT: Text (CZ+EN+SEO) + DALL-E 3
    console.log(`🚀 Generuji kompletní SEO balík (CZ+EN) pro: ${title}`);
    
    const [completion, imageResult] = await Promise.all([
      // A. BILINGVÁLNÍ SEO TEXTY
      openai.chat.completions.create({
        model: "gpt-4-turbo", // Pro precizní bilingvální texty je turbo jistota
        messages: [
          { 
            role: "system", 
            content: "Jsi 'The Hardware Guru'. Píšeš technicky, úderně a bez vaty. Tvým úkolem je vytvořit bilingvální optimalizační příručku založenou na dodaných datech. V HTML nepoužívej tag <html> ani <body>, jen čistou strukturu <h2>, <p>, <ul>." 
          },
          { 
            role: "user", 
            content: `Hra: ${title}\nRešerše: ${rawText}\n\nVYGENERUJ STRIKTNÍ JSON:\n{
              "meta_title": "CZ SEO Titulek (vábnička pro Google)",
              "seo_description": "CZ meta description (max 160 znaků)",
              "seo_keywords": "česká, klíčová, slova, oddělená, čárkou",
              "html_content": "Kompletní CZ návod (Analýza, Požadavky, Fixy, Nastavení v HTML)",
              
              "title_en": "${title} PC Optimization Guide",
              "slug_en": "${slug}-optimization-guide",
              "meta_title_en": "EN SEO Title",
              "description_en": "EN meta description",
              "seo_keywords_en": "en, keywords, tweak",
              "content_en": "Full EN guide (Analysis, Requirements, Fixes, Settings in HTML)"
            }\n\nNa konec CZ i EN obsahu přidej odkazy na Kick (https://kick.com/thehardwareguru) a YouTube (@TheHardwareGuru_Czech).` 
          }
        ],
        response_format: { type: "json_object" }
      }),

      // B. CINEMATIC HARDWARE IMAGE
      openai.images.generate({
        model: "dall-e-3",
        prompt: `Cinematic high-tech gaming PC internal components, focus on GPU and liquid cooling, neon glowing yellow and purple aesthetic, hardware enthusiast style, professional photography, 8k resolution. NO TEXT.`,
        n: 1, size: "1024x1024"
      }).catch(e => { console.error("DALL-E fail", e); return null; })
    ]);

    const ai = JSON.parse(completion.choices[0].message.content);
    let finalImg = 'EMPTY';

    // 3. STORAGE UPLOAD (Zpracování obrázku)
    if (imageResult && imageResult.data[0]?.url) {
      try {
        const fetchImg = await fetch(imageResult.data[0].url);
        const blob = await fetchImg.blob();
        const fileName = `tweaky/${slug}-${Date.now()}.png`;
        const { error: upErr } = await supabaseAdmin.storage.from('images').upload(fileName, blob, { contentType: 'image/png' });
        
        if (!upErr) {
          const { data: pUrl } = supabaseAdmin.storage.from('images').getPublicUrl(fileName);
          finalImg = pUrl.publicUrl;
        }
      } catch (e) { console.error("Supabase Storage fail", e); }
    }

    // 4. FINÁLNÍ ODPOVĚĎ PRO FRONTEND
    return NextResponse.json({ 
      ...ai, // Rozbalíme vše z AI (meta_title, content_en, atd.)
      image_url: finalImg, 
      source: 'Guru Multilingual Engine V3' 
    });

  } catch (err) { 
    console.error('Kritická chyba API:', err);
    return NextResponse.json({ error: err.message }, { status: 500 }); 
  }
}
