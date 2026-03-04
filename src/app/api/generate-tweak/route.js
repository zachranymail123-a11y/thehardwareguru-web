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

    // 1. REŠERŠE (Musí proběhnout první, aby GPT věděl, o čem psát)
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

    // 2. PARALELNÍ ZPRACOVÁNÍ: Text + Obrázek běží naráz!
    console.log(`🚀 Startuji paralelní generování pro: ${title}`);
    
    const [completion, imageResult] = await Promise.all([
      // A. GENEROVÁNÍ TEXTU (GPT-4-turbo)
      openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          { 
            role: "system", 
            content: "Jsi 'The Hardware Guru'. Píšeš drsně, technicky a bez zbytečných keců. ZAKAZUJI obecné rady. Musíš zahrnout systémové požadavky a hardcore fixy." 
          },
          { 
            role: "user", 
            content: `Hra: ${title}\nData: ${rawText}\n\nVYGENERUJ JSON:\n1. "seo_description": Začíná "Optimalizace ${title} - "\n2. "image_prompt": Anglický prompt pro DALL-E 3: styl high-tech cinematic hardware, barvy podle žánru hry, neonové akcenty. NESMÍŠ použít název hry!\n3. "html_content": HTML kód se strukturou: <h2>Guru Analýza</h2>, <h2>Systémové požadavky (Steam)</h2>, <h2>Hardcore Fixy a Optimalizace</h2>, <h2>Nastavení ve hře: Co zabíjí FPS</h2>. Na konec VŽDY přidej: 'Sleduj mě na https://kick.com/thehardwareguru pro live optimalizace a checkuj můj YouTube https://www.youtube.com/@TheHardwareGuru_Czech.'` 
          }
        ],
        response_format: { type: "json_object" }
      }),

      // B. GENEROVÁNÍ OBRÁZKU (DALL-E 3)
      // Použijeme kvalitní hardwarový prompt hned, aby DALL-E nečekal na odpověď od GPT
      openai.images.generate({
        model: "dall-e-3",
        prompt: `High-tech cinematic close-up of high-end gaming PC components, liquid cooling, glowing neon purple and yellow lighting, extreme detail, hardware enthusiast aesthetic, 8k resolution.`,
        n: 1, size: "1024x1024"
      }).catch(e => { console.error("DALL-E fail", e); return null; })
    ]);

    const ai = JSON.parse(completion.choices[0].message.content);
    let finalImg = 'EMPTY';

    // 3. NAHRÁNÍ OBRÁZKU (Zatímco zpracováváme zbytek)
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

    return NextResponse.json({ 
      seo_description: ai.seo_description, 
      html_content: ai.html_content, 
      image_url: finalImg, 
      source: 'Guru Parallel Engine' 
    });

  } catch (err) { 
    console.error('Kritická chyba:', err);
    return NextResponse.json({ error: err.message }, { status: 500 }); 
  }
}
