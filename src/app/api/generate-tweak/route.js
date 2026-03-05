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

    // 1. GURU DEEP SEARCH (Serper.dev) - Hledáme vyloženě technické parametry
    let rawText = '';
    try {
      const serperRes = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // GURU QUERY: Hledáme konkrétní technické výrazy v uvozovkách
          q: `"${title}" PC performance "Engine.ini" OR "Registry" OR "Config" OR "stuttering fix" Reddit Steam Community`,
          gl: 'us', hl: 'en', num: 8
        })
      });
      const data = await serperRes.json();
      // Taháme title i snippet, abychom měli co nejvíc dat k analýze
      rawText = data.organic?.map(res => `SOURCE: ${res.title}\nCONTENT: ${res.snippet}`).join('\n\n') || '';
    } catch (e) { console.error('Serper fail'); }

    // 2. PARALELNÍ GENEROVÁNÍ (GURU HARDCORE ENGINE)
    const [completion, imageResult] = await Promise.all([
      openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          { 
            role: "system", 
            content: `Jsi 'The Hardware Guru'. Tvým úkolem je analyzovat technická data z rešerše a vypreparovat z nich KONKRÉTNÍ hodnoty. 
            STRIKTNĚ ZAKAZUJI: obecné rady (ovladače, detaily).
            TVÉ POVINNOSTI:
            1. Analyzuj "Technická data" ze Serperu a najdi v nich reálné cesty (Registry, %LOCALAPPDATA%).
            2. Pokud data obsahují konkrétní Engine.ini tweaky (r.Streaming.PoolSize atd.), vypiš je v Markdown code blocks.
            3. V kategorii "EXPERT ZÓNA" musí být konkrétní cesta v registrech a název klíče s hodnotou. 
            4. Pokud v rešerši data chybí, využij své expertní znalosti enginu dané hry (UE4/5, Unity, atd.) a doplň technicky správné parametry, které skutečně fungují.` 
          },
          { 
            role: "user", 
            content: `Hra: ${title}\nTechnická data z rešerše:\n${rawText}\n\nVYGENERUJ JSON STRIKTNĚ S TĚMITO KLÍČI:\n{
  "meta_title": "Optimalizace ${title} - Expert Guru Guide",
  "seo_description": "Brutální optimalizace ${title}. Registry fixy, Engine.ini tweaky a hardcore nastavení pro maximální FPS.",
  "seo_keywords": "${title}, optimalizace, registry tweak, expert zona, hardware guru",
  "html_content": "HTML struktura: <h2>Guru Analýza</h2>, <h2>Systémové požadavky (Steam)</h2> (vypiš reálné CPU/GPU), <h2>Hardcore Fixy a Optimalizace</h2> (zde dej kódové bloky pro soubory), <h2>Nastavení ve hře: Co zabíjí FPS</h2> (vypiš konkrétní položky), <h2>EXPERT ZÓNA: Registry a modifikace souborů</h2> (ZDE MUSÍ BÝT PŘESNÉ CESTY A HODNOTY).",
  
  "title_en": "${title} Hardcore Optimization Guide",
  "slug_en": "${slug}-optimization-guide",
  "meta_title_en": "${title} FPS Boost & Registry Surgery",
  "description_en": "No generic advice. Exact registry keys, file paths and technical engine tweaks for ${title}.",
  "seo_keywords_en": "${title}, tweak, registry edit, pc guide",
  "content_en": "Same technical content in English. Use exact paths and code blocks as in the Czech version."
}\n\nOdkazy: https://kick.com/thehardwareguru a YouTube @TheHardwareGuru_Czech.` 
          }
        ],
        response_format: { type: "json_object" }
      }),

      openai.images.generate({
        model: "dall-e-3",
        prompt: `High-tech cinematic close-up of high-end gaming PC components, liquid cooling, glowing neon purple and yellow lighting, hardware enthusiast aesthetic, 8k resolution.`,
        n: 1, size: "1024x1024"
      }).catch(e => null)
    ]);

    const ai = JSON.parse(completion.choices[0].message.content);
    let finalImg = 'EMPTY';

    if (imageResult && imageResult.data[0]?.url) {
      try {
        const fetchImg = await fetch(imageResult.data[0].url);
        const blob = await fetchImg.blob();
        const fileName = `tweaky/${slug}-${Date.now()}.png`;
        await supabaseAdmin.storage.from('images').upload(fileName, blob, { contentType: 'image/png' });
        const { data: pUrl } = supabaseAdmin.storage.from('images').getPublicUrl(fileName);
        finalImg = pUrl.publicUrl;
      } catch (e) { console.error("Storage fail", e); }
    }

    return NextResponse.json({ ...ai, image_url: finalImg });

  } catch (err) { 
    return NextResponse.json({ error: err.message }, { status: 500 }); 
  }
}
