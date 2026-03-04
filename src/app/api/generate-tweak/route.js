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

    // --- PARALELNÍ START: Serper Rešerše + GPT Analýza (příprava promptu) ---
    // Nejdřív musíme mít data ze Serperu, abychom je dali GPT.
    // Ale DALL-E může běžet úplně bokem!
    
    const getSerperData = async () => {
      try {
        const res = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            q: `${title} PC optimization steam system requirements reddit config ini stuttering fix`,
            gl: 'us', hl: 'en'
          })
        });
        const data = await res.json();
        return data.organic?.map(res => `${res.title}: ${res.snippet}`).join('\n\n') || '';
      } catch (e) { return ''; }
    };

    // Odpálíme rešerši
    const rawText = await getSerperData();

    // --- PARALELNÍ BĚH: GPT Text + DALL-E Obrázek ---
    // Tady se děje ta magie. GPT generuje text a DALL-E kreslí naráz.
    
    const [completion, imageResult] = await Promise.all([
      // 1. Úloha: GPT-4-turbo generuje text
      openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          { role: "system", content: "Jsi 'The Hardware Guru'. Piš drsně, technicky. Žádná omáčka." },
          { role: "user", content: `Hra: ${title}\nData: ${rawText}\n\nVygeneruj JSON s: seo_description, html_content (struktura: Guru Analýza, Systémové požadavky Steam, Hardcore Fixy, Nastavení FPS), image_prompt (anglicky, high-tech hardware styl bez názvu hry).` }
        ],
        response_format: { type: "json_object" }
      }),
      
      // 2. Úloha: DALL-E 3 generuje obrázek (použijeme generický, ale kvalitní prompt, aby nečekal na GPT)
      openai.images.generate({
        model: "dall-e-3",
        prompt: `High-tech cinematic close-up of gaming PC components, liquid cooling, neon cyber lighting, professional photography, 8k resolution, hardware enthusiast style.`,
        n: 1, size: "1024x1024"
      }).catch(e => { console.error("DALL-E fail", e); return null; })
    ]);

    const ai = JSON.parse(completion.choices[0].message.content);
    let finalImg = 'EMPTY';

    // 3. Nahrání obrázku do Supabase (běží zatímco parsujeme JSON)
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
      } catch (e) { console.error("Storage fail", e); }
    }

    return NextResponse.json({ 
      seo_description: ai.seo_description, 
      html_content: ai.html_content, 
      image_url: finalImg, 
      source: 'Guru Parallel Engine' 
    });

  } catch (err) { 
    return NextResponse.json({ error: err.message }, { status: 500 }); 
  }
}
