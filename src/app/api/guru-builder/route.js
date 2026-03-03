import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Inicializace mimo handler je v pořádku
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    const { budget, usage, preference } = await req.json();

    // 1. CÍLENÉ VYHLEDÁVÁNÍ CEN (Alza, Smarty, Mironet)
    // Serper nám dodá čerstvá data, která OpenAI chybí
    const serperRes = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 
        'X-API-KEY': process.env.SERPER_API_KEY, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ 
        q: `site:alza.cz OR site:smarty.cz OR site:mironet.cz aktuální cena RTX 4000 5000 Radeon 9070 Ryzen 7000 9000 březen 2026`,
        num: 10 
      })
    });
    
    const searchData = await serperRes.json();

    // 2. GURU PROMPT - TOTÁLNÍ KONTROLA KOMPATIBILITY
    const prompt = `
      Jsi nekompromisní The Hardware Guru. Tvým úkolem je sestavit ŠPIČKOVÝ HERNÍ PC za ${budget} Kč.
      Máš k dispozici tato reálná data z e-shopů: ${JSON.stringify(searchData.organic?.slice(0, 5).map(s => s.snippet) || [])}

      STRIKTNÍ GURU PRAVIDLA:
      1. PLATFORMA: Pouze AMD (Intel je zakázán!). Procesory Ryzen 7000 nebo 9000.
      2. DESKY: Pouze socket AM5 s nejnovějšími čipsety B850, X870 nebo X870E.
      3. GRAFIKA: Pouze NVIDIA RTX řady 4000/5000 nebo AMD Radeon 9070/9070 XT.
      4. LOGIKA: Ryzen 7000/9000 nesmí být v desce B550/X570 (AM4). Vždy DDR5 RAM.
      5. FILTR: RTX 3060 a čipsety řady 500 (B550 atd.) IGNORUJ, jsou to zastaralé nesmysly.

      Vrať POUZE JSON v tomto formátu:
      {
        "title": "Guru Herní Bestie: [Název]",
        "description": "Profesionální herní sestava postavená pro maximální výkon.",
        "components": [
          {"part": "CPU", "name": "...", "price": 0},
          {"part": "Motherboard", "name": "...", "price": 0},
          {"part": "GPU", "name": "...", "price": 0},
          {"part": "RAM", "name": "DDR5 ...", "price": 0},
          {"part": "SSD", "name": "...", "price": 0},
          {"part": "PSU", "name": "...", "price": 0}
        ],
        "explanation": "Guru potvrzení kompatibility socketu AM5 a čipsetu řady 800.",
        "total_price": 0
      }
    `;

    const aiRes = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const sestavaData = JSON.parse(aiRes.choices[0].message.content);
    
    // 3. VYTVOŘENÍ UNIKÁTNÍHO SLUGU A ULOŽENÍ DO SUPABASE
    const slug = `guru-sestava-${budget}-${Math.floor(Math.random() * 10000)}`;
    
    const { data, error } = await supabase.from('sestavy').insert([{
      title: sestavaData.title,
      description: sestavaData.description,
      budget: budget,
      usage: usage || "Gaming",
      components: sestavaData.components,
      content: sestavaData.explanation,
      total_price: sestavaData.total_price,
      slug: slug,
      image_url: "https://i.postimg.cc/QdWxszv3/bg-guru.png"
    }]).select();

    if (error) throw error;

    return NextResponse.json({ success: true, url: `/sestavy/${slug}`, data: data[0] });

  } catch (error) {
    console.error('Guru Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
