export const maxDuration = 60; // GURU FIX: Pojistka proti timeoutu pro dlouhé texty

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 🚀 GURU CHYTRÝ FORMÁTOVAČ NÁZVU (Vyřeší 'of', 'the' i zkratky bez zdržování AI)
function formatGameTitle(str) {
  if (!str) return '';
  const exceptions = { 'gta v': 'GTA V', 'gta 5': 'GTA V', 'csgo': 'CS:GO', 'pubg': 'PUBG' };
  const lowerStr = str.toLowerCase().trim();
  if (exceptions[lowerStr]) return exceptions[lowerStr];
  
  const smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|v|vs|via)$/i;
  return lowerStr.split(' ').map((word, index, arr) => {
    // Malá slova uprostřed názvu zůstanou malá
    if (index !== 0 && index !== arr.length - 1 && smallWords.test(word)) {
      return word;
    }
    // Ostatní slova začnou velkým písmenem
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}

export async function POST(req) {
  try {
    const { title: rawTitle, slug, pin } = await req.json();
    if (pin !== process.env.GURU_PIN) return NextResponse.json({ error: 'Špatný PIN!' }, { status: 401 });

    // Aplikujeme chytrý formátovač (např. 'the legend of khiimori' -> 'The Legend of Khiimori')
    const title = formatGameTitle(rawTitle);

    // 1. DVOJITÁ GURU REŠERŠE (HW a Tweaky) - PŮVODNÍ SUPER VERZE
    let rawSteam = '';
    let rawTweaks = '';
    try {
      const [steamReq, tweakReq] = await Promise.all([
        fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: `${title} minimum recommended system requirements pc Steam`, gl: 'us', hl: 'en', num: 4 })
        }),
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

    // 2. PARALELNÍ GENEROVÁNÍ - PŮVODNÍ SUPER VERZE
    const [completion, imageResult] = await Promise.all([
      openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          { 
            role: "system", 
            content: `Jsi 'The Hardware Guru'. Píšeš pro hardcore PC komunitu.
            STRIKTNĚ ZAKAZUJI: obecné rady (např. 'aktualizujte ovladače'), vymýšlení si HW a používání zástupných znaků (žádné '...', žádné 'atd.').
            
            TVÁ PRAVIDLA PRO OBSAH:
            1. 'Systémové požadavky': Vypiš reálné komponenty POUZE z [STEAM DATA].
            2. 'Hardcore Fixy': Kódy musí být KOMPLETNÍ. Vypiš přesnou cestu k souboru (např. C:\\Users\\User\\AppData\\Local\\...) a minimálně 4 reálné technické parametry do Markdown bloku.
            3. 'Nastavení ve hře': Napiš 3-5 konkrétních položek s největším dopadem na VRAM a přesně jak je nastavit (např. Volumetric Fog -> Low).
            4. 'EXPERT ZÓNA': NIKDY NEPIŠ NEÚPLNÉ CESTY V REGISTRECH! Musíš vypsat PLNOU cestu (např. HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile) a PLATNÝ klíč (DWORD) s hodnotou. Pokud v rešerši chybí registry fix přímo pro hru, VŽDY vypiš reálný univerzální Windows gaming tweak (např. zakázání FSO nebo SystemResponsiveness tweak).` 
          },
          { 
            role: "user", 
            content: `Hra: ${title}

[STEAM DATA]:
${rawSteam}

[TWEAK DATA]:
${rawTweaks}

VYGENERUJ JSON. Zástupné texty v závorkách [...] NAHRAĎ plnohodnotným technickým obsahem. Žádné tečky a zkracování!

{
  "meta_title": "Optimalizace ${title} - Expert Guru Guide",
  "seo_description": "Brutální optimalizace ${title}. Registry fixy, Engine.ini tweaky a hardcore nastavení pro maximální FPS.",
  "seo_keywords": "${title}, optimalizace, registry tweak, expert zona, hardware guru",
  "html_content": "<h2>Guru Analýza</h2>\\n<p>[ZDE NAPIŠ OBSÁHLOU ANALÝZU]</p>\\n<h2>Systémové požadavky (Steam)</h2>\\n<ul>[ZDE VYPIS HW Z DAT]</ul>\\n<h2>Hardcore Fixy a Optimalizace</h2>\\n<p>[ZDE NAPIŠ CELÉ CESTY A MINIMÁLNĚ 4 ŘÁDKY KÓDU DO BLOKU]</p>\\n<h2>Nastavení ve hře: Co zabíjí FPS</h2>\\n<p>[ZDE NAPIŠ KONKRETNI POLOZKY A HODNOTY]</p>\\n<h2>EXPERT ZÓNA: Registry a modifikace souborů</h2>\\n<p>[ZDE NAPIŠ CELOU CESTU V REGISTRECH A HODNOTU, ŽÁDNÉ ZKRACENÍ]</p>\\n<p>Sleduj mě na <a href='https://kick.com/TheHardwareGuru'>Kicku</a>, <a href='https://discord.com/invite/n7xThr8'>Discordu</a> a <a href='https://www.youtube.com/@TheHardwareGuru_Czech'>YouTube</a>.</p>",
  
  "title_en": "${title} Hardcore Optimization Guide",
  "slug_en": "${slug}-optimization-guide",
  "meta_title_en": "${title} FPS Boost & Registry Surgery",
  "description_en": "No generic advice. Exact registry keys, full file paths and technical engine tweaks for ${title}.",
  "seo_keywords_en": "${title}, tweak, registry edit, pc guide",
  "content_en": "<h2>Guru Analysis</h2>\\n<p>[WRITE FULL ANALYSIS]</p>\\n<h2>System Requirements (Steam)</h2>\\n<ul>[WRITE HW REQUIREMENTS]</ul>\\n<h2>Hardcore Fixes and Optimization</h2>\\n<p>[WRITE FULL PATHS AND CODE BLOCKS WITHOUT SHORTENING]</p>\\n<h2>In-game Settings: What Kills FPS</h2>\\n<p>[SPECIFIC SETTINGS]</p>\\n<h2>EXPERT ZONE: Registry and File Modifications</h2>\\n<p>[WRITE FULL REGISTRY PATH AND EXACT KEYS]</p>\\n<p>Watch live on <a href='https://kick.com/TheHardwareGuru'>Kick</a>.</p>"
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

    // Vracíme naformátovaný název rovnou do frontendu!
    return NextResponse.json({ ...ai, image_url: finalImg, title });

  } catch (err) { 
    return NextResponse.json({ error: err.message }, { status: 500 }); 
  }
}
