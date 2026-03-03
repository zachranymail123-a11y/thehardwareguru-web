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

    // 1. CÍLENÉ VYHLEDÁVÁNÍ S POŽADAVKEM NA KONKRÉTNÍ E-SHOPY
    const serperRes = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 
        'X-API-KEY': process.env.SERPER_API_KEY, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ 
        q: `site:alza.cz OR site:smarty.cz OR site:mironet.cz herní PC komponenty ${preference === 'Červený' ? 'Radeon 9070 XT' : 'RTX 5070'} DDR5 32GB Ryzen 9000 cena březen 2026`,
        num: 10 
      })
    });
    
    const searchData = await serperRes.json();
    // Vytáhneme titulek, snippet a hlavně LINK
    const realMarketData = searchData.organic?.map(s => ({
      title: s.title,
      link: s.link,
      snippet: s.snippet
    })) || [];

    // 2. GURU PROMPT - PŘÍKAZ K CITACI REALITY
    const prompt = `
      JSI THE HARDWARE GURU. TVÁ SLOVA JSOU ZÁKON. 
      MÁŠ ROZPOČET ${budget} KČ. POKUD SI CENU VYMYSLÍŠ, KONČÍŠ.

      ZDE JSOU REÁLNÁ DATA Z E-SHOPŮ (TITULKY, ODKAZY, CENY): 
      ${JSON.stringify(realMarketData)}

      STRIKTNÍ GURU ROZKAZY:
      1. ŽÁDNÉ LŽI: Cena komponenty MUSÍ odpovídat ceně nalezené v datech výše.
      2. POVINNÉ ODKAZY: U každé komponenty (CPU, GPU, Motherboard, RAM) MUSÍŠ uvést reálný "link" na Alza.cz, Smarty.cz nebo Mironet.cz, který vidíš v datech.
      3. HW LIMIT: Pouze AMD Ryzen 7000/9000 a desky B850/X870 (AM5). 
      4. RAM: 32GB DDR5 Corsair Vengeance stojí v roce 2026 cca 9.000 Kč. Pokud napíšeš méně, je to ostuda a halucinace.
      5. KOMPATIBILITA: Ryzen 9000 NESMÍ být v desce B550.

      Vrať POUZE JSON:
      {
        "title": "Guru Herní Bestie: [Název]",
        "components": [
          {
            "part": "GPU", 
            "name": "[Přesný název z e-shopu]", 
            "price": 0, 
            "link": "[REÁLNÁ URL Z DAT]"
          },
          {
            "part": "CPU", 
            "name": "[Přesný název z e-shopu]", 
            "price": 0, 
            "link": "[REÁLNÁ URL Z DAT]"
          }
          // ... ostatní komponenty
        ],
        "explanation": "Guru potvrzení, že tyto ceny jsou reálné k dnešnímu dni...",
        "total_price": 0
      }
    `;

    const aiRes = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const sestavaData = JSON.parse(aiRes.choices[0].message.content);
    
    const slug = `guru-sestava-${budget}-${Math.floor(Math.random() * 10000)}`;
    
    const { data, error } = await supabase.from('sestavy').insert([{
      title: sestavaData.title,
      description: "Sestava s reálnými odkazy na e-shopy.",
      budget: budget,
      usage: "Gaming",
      components: sestavaData.components, // Ukládáme i s linky
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
