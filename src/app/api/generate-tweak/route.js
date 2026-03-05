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

    // 1. REŠERŠE (Serper.dev)
    let rawText = '';
    try {
      const serperRes = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: `${title} PC optimization steam system requirements engine.ini registry editor config tweak stuttering fix`,
          gl: 'us', hl: 'en'
        })
      });
      const data = await serperRes.json();
      rawText = data.organic?.map(res => `${res.title}: ${res.snippet}`).join('\n\n') || '';
    } catch (e) { console.error('Serper fail'); }

    // 2. PARALELNÍ GENEROVÁNÍ (GURU HARDCORE MODE)
    const [completion, imageResult] = await Promise.all([
      openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          { 
            role: "system", 
            content: `Jsi 'The Hardware Guru'. Píšeš pro hardcore komunitu. 
            STRIKTNĚ ZAKAZUJI obecné rady typu 'aktualizujte ovladače' nebo 'snižte detaily'. 
            TVÉ INSTRUKCE:
            1. Vypiš přesné cesty k souborům (např. %LOCALAPPDATA%\\${title}\\Saved\\Config\\WindowsNoEditor\\Engine.ini).
            2. Pro úpravy souborů VŽDY použij Markdown code blocks s konkrétními parametry (např. [SystemSettings] r.Streaming.PoolSize=...).
            3. V EXPERT ZÓNĚ vypiš přesné cesty v registrech (HKEY_CURRENT_USER\\Software\\...) a konkrétní názvy klíčů (DWORD) s hodnotami.
            4. U systémových požadavků vypiš reálné komponenty (CPU, GPU, RAM).
            5. Pokud v rešerši nenajdeš konkrétní data, použij své hluboké znalosti herních enginů (UE4, UE5, Unity) a navrhni funkční fixy pro danou technologii.` 
          },
          { 
            role: "user", 
            content: `Hra: ${title}\nData: ${rawText}\n\nVYGENERUJ JSON STRIKTNĚ S TĚMITO KLÍČI:\n{
  "meta_title": "Optimalizace ${title} - Expert Guru Guide",
  "seo_description": "Brutální optimalizace ${title}. Registry fixy, Engine.ini tweaky a hardcore nastavení pro maximální FPS.",
  "seo_keywords": "${title}, optimalizace, registry tweak, expert zona, hardware guru",
  "html_content": "HTML kód se strukturou: <h2>Guru Analýza</h2>, <h2>Systémové požadavky (Steam)</h2> (vypiš konkrétní HW), <h2>Hardcore Fixy a Optimalizace</h2>, <h2>Nastavení ve hře: Co zabíjí FPS</h2> (vypiš konkrétní položky a hodnoty), <h2>EXPERT ZÓNA: Registry a modifikace souborů</h2> (zde dej PŘESNÉ CESTY A KÓDY). Na konec přidej tvůj Kick a YouTube odkaz.",
  
  "title_en": "${title} Hardcore Optimization Guide",
  "slug_en": "${slug}-optimization-guide",
  "meta_title_en": "${title} FPS Boost & Registry Surgery",
  "description_en": "No generic advice. Exact registry keys, file paths and engine.ini tweaks for ${title}.",
  "seo_keywords_en": "${title} tweak, registry edit, pc guide, graphics settings",
  "content_en": "English version with SAME hardcore structure. Provide exact file paths and code blocks for tweaks. <h2>EXPERT ZONE: Registry and File Modifications</h2> must contain technical data."
}\n\nOdkazy: https://kick.com/thehardwareguru a YouTube @TheHardwareGuru_Czech.` 
          }
        ],
        response_format: { type: "json_object" }
      }),

      openai.images.generate({
        model: "dall-e-3",
        prompt: `Detailed high-tech hardware visualization, glowing circuits, extreme gaming PC components, cinematic yellow and purple neon lighting, 8k.`,
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
        const { error: upErr } = await supabaseAdmin.storage.from('images').upload(fileName, blob, { contentType: 'image/png' });
        if (!upErr) {
          const { data: pUrl } = supabaseAdmin.storage.from('images').getPublicUrl(fileName);
          finalImg = pUrl.publicUrl;
        }
      } catch (e) { console.error("Supabase Storage fail", e); }
    }

    return NextResponse.json({ ...ai, image_url: finalImg });

  } catch (err) { 
    return NextResponse.json({ error: err.message }, { status: 500 }); 
  }
}
