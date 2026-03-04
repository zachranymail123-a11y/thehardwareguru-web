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
    if (pin !== process.env.GURU_PIN) return NextResponse.json({ error: 'Špatný PIN, kámo!' }, { status: 401 });

    let rawText = '';
    let sourceUsed = 'Google Serper + Guru Knowledge Base';

    // 1. Rešerše přes Serper (Hledáme požadavky a hardcore fixy)
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

    // 2. Brutální Guru Prompt se všemi tvými požadavky
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { 
          role: "system", 
          content: "Jsi 'The Hardware Guru'. Píšeš drsně, technicky a bez zbytečných keců. Tvým úkolem je vytvořit EXTRÉMNĚ detailní návod. PŘÍSNĚ ZAKAZUJI obecné rady. Musíš zahrnout přesné systémové požadavky ze Steamu a hardcore technické úpravy." 
        },
        { 
          role: "user", 
          content: `Hra: ${title}
Data k analýze: ${rawText}

VYGENERUJ JSON S TĚMITO KLÍČI:
1. "seo_description": Začíná "Optimalizace ${title} - " (max 150 znaků).
2. "image_prompt": Anglický prompt pro DALL-E 3: styl high-tech cinematic hardware, barvy podle žánru hry, neonové akcenty. NESMÍŠ použít název hry.
3. "html_content": HTML kód s touto strukturou:
   - <h2>Guru Analýza</h2>: Technický stav, engine, co vývojáři podělali.
   - <h2>Systémové požadavky (Steam)</h2>: PŘESNÁ tabulka nebo seznam (Minimální vs Doporučené).
   - <h2>Hardcore Fixy a Optimalizace</h2>: Konkrétní cesty k .ini souborům (např. %LOCALAPPDATA%), launch parametry (-dx12, -high), úpravy registrů nebo fixy pro VRAM.
   - <h2>Nastavení ve hře: Co zabíjí FPS</h2>: Konkrétní položky z menu (např. Volumetric Clouds) a doporučené hodnoty.
   - <div class="guru-footer">Na konci článku VŽDY přidej: 'Sleduj mě na https://kick.com/thehardwareguru pro live optimalizace a checkuj můj YouTube https://www.youtube.com/@TheHardwareGuru_Czech.'</div>` 
        }
      ],
      response_format: { type: "json_object" }
    });

    const ai = JSON.parse(completion.choices[0].message.content);

    // 3. Generování obrázku (Žánrový prompt bez copyright banu)
    let finalImg = 'EMPTY';
    try {
      const imgRes = await openai.images.generate({
        model: "dall-e-3",
        prompt: ai.image_prompt,
        n: 1, size: "1024x1024"
      });
      const fetchImg = await fetch(imgRes.data[0].url);
      const blob = await fetchImg.blob();
      const fileName = `tweaky/${slug}-${Date.now()}.png`;
      const { error: upErr } = await supabaseAdmin.storage.from('images').upload(fileName, blob, { contentType: 'image/png' });
      if (!upErr) {
        const { data: pUrl } = supabaseAdmin.storage.from('images').getPublicUrl(fileName);
        finalImg = pUrl.publicUrl;
      }
    } catch (e) { console.error('DALL-E fail'); }

    return NextResponse.json({ 
      seo_description: ai.seo_description, 
      html_content: ai.html_content, 
      image_url: finalImg, 
      source: sourceUsed 
    });
  } catch (err) { 
    return NextResponse.json({ error: err.message }, { status: 500 }); 
  }
}
