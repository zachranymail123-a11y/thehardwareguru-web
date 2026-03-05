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

    // 1. DVOJITÁ GURU REŠERŠE (Rozdělujeme HW a Tweaky)
    let rawSteam = '';
    let rawTweaks = '';
    try {
      const [steamReq, tweakReq] = await Promise.all([
        // Hledáme POUZE systémové požadavky na Steamu/oficiálních webech
        fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: `${title} minimum recommended system requirements pc Steam`, gl: 'us', hl: 'en', num: 4 })
        }),
        // Hledáme POUZE hardcore fixy (Engine.ini, Registry)
        fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: `"${title}" PC performance "Engine.ini" OR "Registry" OR "Config" Reddit Steam Community`, gl: 'us', hl: 'en', num: 8 })
        })
      ]);
      
      const steamData = await steamReq.json();
      const tweakData = await tweakReq.json();
      
      rawSteam = steamData.organic?.map(res => res.snippet).join('\n') || '';
      rawTweaks = tweakData.organic?.map(res => `SOURCE: ${res.title}\nCONTENT: ${res.snippet}`).join('\n\n') || '';
    } catch (e) { console.error('Serper fail'); }

    // 2. PARALELNÍ GENEROVÁNÍ
    const [completion, imageResult] = await Promise.all([
      openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          { 
            role: "system", 
            content: `Jsi 'The Hardware Guru'. Píšeš pro hardcore komunitu.
            ZAKAZUJI: obecné rady (např. 'aktualizujte ovladače') a vymýšlení si hardwaru.
            
            TVÁ PRAVIDLA PRO GENEROVÁNÍ OBSAHU:
            1. 'Systémové požadavky': Vypiš reálné CPU, GPU a RAM VÝHRADNĚ z dat označených jako [STEAM DATA]. Pokud tam HW není, napiš: 'Pro tuto hru zatím nejsou k dispozici oficiální požadavky.' NEVYMÝŠLEJ SI JE!
            2. 'Hardcore Fixy': Z [TWEAK DATA] vytáhni cesty a .ini úpravy. Kódy dej do Markdown code blocků.
            3. 'Nastavení ve hře': Napiš 3-5 konkrétních položek a jak je nastavit.
            4. 'EXPERT ZÓNA': Napiš přesné cesty v registrech (HKEY_...) a názvy klíčů (DWORD) s hodnotami.
            5. Pokud v [TWEAK DATA] chybí data pro registry, využij své znalosti daného herního enginu k poskytnutí relevantního technického zásahu.` 
          },
          { 
            role: "user", 
            content: `Hra: ${title}

[STEAM DATA]:
${rawSteam}

[TWEAK DATA]:
${rawTweaks}

VYGENERUJ JSON. Zástupný text "..." NAHRAĎ plnohodnotným, dlouhým a technickým HTML obsahem.

{
  "meta_title": "Optimalizace ${title} - Expert Guru Guide",
  "seo_description": "Brutální optimalizace ${title}. Registry fixy, Engine.ini tweaky a hardcore nastavení pro maximální FPS.",
  "seo_keywords": "${title}, optimalizace, registry tweak, expert zona, hardware guru",
  "html_content": "<h2>Guru Analýza</h2>\\n<p>...</p>\\n<h2>Systémové požadavky (Steam)</h2>\\n<ul>...</ul>\\n<h2>Hardcore Fixy a Optimalizace</h2>\\n<p>...</p>\\n<h2>Nastavení ve hře: Co zabíjí FPS</h2>\\n<p>...</p>\\n<h2>EXPERT ZÓNA: Registry a modifikace souborů</h2>\\n<p>...</p>\\n<p>Sleduj mě na <a href='https://kick.com/TheHardwareGuru'>Kicku</a>, <a href='https://discord.com/invite/n7xThr8'>Discordu</a> a <a href='https://www.youtube.com/@TheHardwareGuru_Czech'>YouTube</a>.</p>",
  
  "title_en": "${title} Hardcore Optimization Guide",
  "slug_en": "${slug}-optimization-guide",
  "meta_title_en": "${title} FPS Boost & Registry Surgery",
  "description_en": "No generic advice. Exact registry keys, file paths and technical engine tweaks for ${title}.",
  "seo_keywords_en": "${title}, tweak, registry edit, pc guide",
  "content_en": "<h2>Guru Analysis</h2>\\n<p>...</p>\\n<h2>System Requirements (Steam)</h2>\\n<ul>...</ul>\\n<h2>Hardcore Fixes and Optimization</h2>\\n<p>...</p>\\n<h2>In-game Settings: What Kills FPS</h2>\\n<p>...</p>\\n<h2>EXPERT ZONE: Registry and File Modifications</h2>\\n<p>...</p>\\n<p>Watch live on <a href='https://kick.com/TheHardwareGuru'>Kick</a>.</p>"
}` 
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
