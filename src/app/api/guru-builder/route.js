import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    const { budget, preference } = await req.json();

    // 1. CÍLENÉ VYHLEDÁVÁNÍ NA ČESKÝCH E-SHOPECH
    const serperRes = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 
        'X-API-KEY': process.env.SERPER_API_KEY, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ 
        q: `site:alza.cz OR site:smarty.cz OR site:mironet.cz aktuální cena ${preference === 'Červený' ? 'Radeon 9070 XT' : 'RTX 4070 5070'} DDR5 32GB Corsair Vengeance Ryzen 7000 9000 březen 2026`,
        num: 10 
      })
    });
    
    const searchData = await serperRes.json();

    // 2. GURU PROMPT - NEKOMPROMISNÍ MANUÁL
    const prompt = `
      JSI THE HARDWARE GURU. TVÝM ÚKOLEM JE SESTAVIT DOKONALÝ HERNÍ PC ZA ${budget} KČ.
      POKUD PŘEKROČÍŠ BUDGET O VÍC NEŽ 500 KČ, JE TO FAIL.

      ZDE JSOU REÁLNÁ DATA Z E-SHOPŮ: ${JSON.stringify(searchData.organic?.slice(0, 8).map(s => s.snippet) || [])}

      STRIKTNÍ GURU PRAVIDLA (PORUŠENÍ = OSTUDA):
      1. PLATFORMA: Vždy AMD Ryzen 7000 nebo 9000. Intel je ZAKÁZÁN.
      2. DESKY: Pouze Socket AM5 s čipsety B850, X870 nebo X870E. Žádné B550/AM4!
      3. RAM: 32GB DDR5 Corsair Vengeance stojí MINIMÁLNĚ 8.500 Kč. Nikdy nepiš 3.000 Kč!
      4. GRAFIKA: Podle týmu (${preference}). Pouze NVIDIA RTX 4000/5000 nebo Radeon 9070/9070 XT.
      5. KOMPATIBILITA: Ryzen 7000/9000 NEFUNGUJE v deskách řady 500. Musíš dát řadu 800.
      6. ZDROJ: Minimálně 750W 80+ Gold pro herní sestavu.

      POKUD V DATECH VIDÍŠ STARÝ HARDWARE (RTX 3060, B550), IGNORUJ HO. JE ROK 2026.

      Vrať POUZE JSON:
      {
        "title": "Guru Herní Mašina: [Název]",
        "description": "Nekompromisní herní build ověřený na českých e-shopech.",
        "components": [
          {"part": "CPU", "name": "...", "price": 0},
          {"part": "Motherboard", "name": "...", "price": 0},
          {"part": "GPU", "name": "...", "price": 0},
          {"part": "RAM", "name": "32GB DDR5 Corsair Vengeance", "price": 9000},
          {"part": "SSD", "name": "...", "price": 0},
          {"part": "PSU", "name": "...", "price": 0}
        ],
        "explanation": "Technické potvrzení, že RAM stojí 9k a deska je AM5 socket...",
        "total_price": 0
      }
    `;

    const aiRes = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const sestavaData = JSON.parse(aiRes.choices[0].message.content);
    
    // 3. ULOŽENÍ S KONTROLOU
    const slug = `guru-herni-sestava-${budget}-${Math.floor(Math.random() * 10000)}`;
    
    const { data, error } = await supabase.from('sestavy').insert([{
      title: sestavaData.title,
      description: sestavaData.description,
      budget: budget,
      usage: "Gaming",
      components: sestavaData.components,
      content: sestavaData.explanation,
      total_price: sestavaData.total_price,
      slug: slug,
      image_url: "https://i.postimg.cc/QdWxszv3/bg-guru.png"
    }]).select();

    if (error) throw error;

    return NextResponse.json({ success: true, url: `/sestavy/${slug}`, data: data[0] });

  } catch (error) {
    console.error('Guru API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
