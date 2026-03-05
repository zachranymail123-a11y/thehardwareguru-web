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
    if (pin !== process.env.GURU_PIN) return NextResponse.json({ error: 'Špatný PIN!' }, { status: 401 });

    // 1. GURU REŠERŠE
    let rawText = '';
    try {
      const serperRes = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: `${title} PC optimization steam system requirements reddit config ini stuttering fix`,
          gl: 'us', hl: 'en'
        })
      });
      const data = await serperRes.json();
      rawText = data.organic?.map(res => `${res.title}: ${res.snippet}`).join('\n\n') || '';
    } catch (e) { console.error('Serper fail'); }

    // 2. PARALELNÍ GENEROVÁNÍ (Tvá struktura + Fix klíčů pro DB)
    const [completion, imageResult] = await Promise.all([
      openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          { 
            role: "system", 
            content: "Jsi 'The Hardware Guru'. Píšeš drsně, technicky a bez zbytečných keců. ZAKAZUJI obecné rady. Musíš zahrnout systémové požadavky a hardcore fixy." 
          },
          { 
            role: "user", 
            content: `Hra: ${title}\nData: ${rawText}\n\nVYGENERUJ JSON STRIKTNĚ S TĚMITO KLÍČI:\n{
  "meta_title": "Optimalizace ${title} - Guru Tweak Guide",
  "seo_description": "Optimalizace ${title} - Kompletní návod pro zvýšení FPS a odstranění stutteringu.",
  "seo_keywords": "${title}, optimalizace, fps fix, hardware guru",
  "html_content": "Použij strukturu: <h2>Guru Analýza</h2>, <h2>Systémové požadavky (Steam)</h2>, <h2>Hardcore Fixy a Optimalizace</h2>, <h2>Nastavení ve hře: Co zabíjí FPS</h2>. Na konec dej odkazy na Kick a YouTube.",
  
  "title_en": "${title} Optimization Guide",
  "slug_en": "${slug}-optimization-guide",
  "meta_title_en": "${title} FPS Boost & PC Optimization Guide",
  "description_en": "Best settings and hardcore fixes for ${title} to maximize performance and fix lag.",
  "seo_keywords_en": "${title} tweak, fps fix, pc guide, graphics settings",
  "content_en": "Same structure in English: <h2>Guru Analysis</h2>, <h2>System Requirements (Steam)</h2>, <h2>Hardcore Fixes and Optimization</h2>, <h2>In-game Settings: What Kills FPS</h2>. Add Kick and YouTube links."
}\n\nOdkazy: https://kick.com/thehardwareguru a YouTube @TheHardwareGuru_Czech.` 
          }
        ],
        response_format: { type: "json_object" }
      }),

      openai.images.generate({
        model: "dall-e-3",
        prompt: `High-tech cinematic close-up of high-end gaming PC components, liquid cooling, glowing neon purple and yellow lighting, extreme detail, hardware enthusiast aesthetic, 8k resolution.`,
        n: 1, size: "1024x1024"
      }).catch(e => { console.error("DALL-E fail", e); return null; })
    ]);

    const ai = JSON.parse(completion.choices[0].message.content);
    let finalImg = 'EMPTY';

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

    // VRACÍME PŘESNÉ KLÍČE, KTERÉ FRONTEND OČEKÁVÁ
    return NextResponse.json({ 
      ...ai,
      image_url: finalImg
    });

  } catch (err) { 
    return NextResponse.json({ error: err.message }, { status: 500 }); 
  }
}
