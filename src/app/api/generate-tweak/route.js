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

    let rawText = '';
    let sourceUsed = 'Google AI Search';

    // 1. Rešerše přes Serper (Hledáme požadavky a hardcore fixy)
    try {
      const serperRes = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: `${title} PC optimization stuttering fix steam system requirements reddit config ini`,
          gl: 'us', hl: 'en'
        })
      });
      const data = await serperRes.json();
      rawText = data.organic?.map(res => `${res.title}: ${res.snippet}`).join('\n\n') || '';
    } catch (e) { console.error('Serper fail'); }

    // 2. Brutální Guru Prompt
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "Jsi 'The Hardware Guru'. ZAKAZUJI TI psát obecné rady. Piš drsně a technicky. Musíš zahrnout systémové požadavky." },
        { role: "user", content: `Hra: ${title}\nData: ${rawText}\n\nVygeneruj JSON:\n1. "seo_description": Začíná "Optimalizace ${title} - "\n2. "image_prompt": Urči žánr hry a napiš anglický prompt pro DALL-E 3 na téma 'cinematic gaming hardware' v barvách toho žánru. NESMÍŠ použít název hry v promptu!\n3. "html_content": HTML kód se strukturou: <h2>Guru Analýza</h2> (stav portu/engine), <h2>Systémové požadavky</h2> (Steam tabulka/seznam), <h2>Hardcore Fixy</h2> (cesty k .ini, launch options), <h2>Co žere FPS</h2> (konkrétní položky v menu).` }
      ],
      response_format: { type: "json_object" }
    });

    const ai = JSON.parse(completion.choices[0].message.content);

    // 3. Generování obrázku bez copyright banu
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
    } catch (e) { console.error('Obrázek fail'); }

    return NextResponse.json({ seo_description: ai.seo_description, html_content: ai.html_content, image_url: finalImg, source: sourceUsed });
  } catch (err) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
