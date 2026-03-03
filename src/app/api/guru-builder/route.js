import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ČISTÝ FETCH: Žádné omezovače, žádné promazávání. Co Google najde, to pošleme AI.
async function fetchComponentData(componentType, query) {
  try {
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: `site:alza.cz OR site:smarty.cz OR site:mironet.cz ${query} cena`, num: 6 })
    });
    const data = await res.json();
    
    return (data.organic || []).map(s => ({
      part: componentType,
      title: s.title,
      link: s.link,
      snippet: s.snippet
    }));
  } catch (e) {
    console.error(`Chyba při hledání ${componentType}:`, e);
    return [];
  }
}

export async function POST(req) {
  try {
    const { budget, preference } = await req.json();
    const budgetNum = Number(budget);

    // 1. REÁLNÉ DOTAZY: Pro 30k budget musíme hledat RTX 4060/4070, jinak to matematicky nevyjde
    const gpuQuery = preference === 'Červený' 
        ? (budgetNum > 40000 ? 'AMD Radeon RX 9070 XT' : 'AMD Radeon RX 9070')
        : (budgetNum > 45000 ? 'NVIDIA RTX 5080' : (budgetNum > 35000 ? 'NVIDIA RTX 5070' : 'NVIDIA RTX 4060 OR RTX 4070'));
    
    // Vždy POUZE 8 jader a více
    const cpuQuery = budgetNum > 45000 ? 'procesor AMD Ryzen 7 9800X3D OR Ryzen 9 9900X' : 'procesor AMD Ryzen 7 7700 OR Ryzen 7 9700X';

    // PARALELNÍ NAČÍTÁNÍ VŠECH DÍLŮ
    const [gpuData, cpuData, mbData, ramData, ssdData, psuData] = await Promise.all([
      fetchComponentData('GPU', gpuQuery),
      fetchComponentData('CPU', cpuQuery),
      fetchComponentData('Motherboard', 'základní deska AM5 B850 OR X870'),
      fetchComponentData('RAM', '32GB DDR5 6000MHz Kingston OR Corsair'),
      fetchComponentData('SSD', '1TB OR 2TB M.2 NVMe SSD WD OR Samsung'),
      fetchComponentData('PSU', 'počítačový zdroj 750W OR 850W Gold')
    ]);

    const catalog = [...gpuData, ...cpuData, ...mbData, ...ramData, ...ssdData, ...psuData];

    // 2. TUPÁ AI: Přečti si text, opiš cenu a zkopíruj link.
    const prompt = `
      Jsi extraktor dat. Sestav PC z dodaného katalogu.
      KATALOG: ${JSON.stringify(catalog)}

      PRAVIDLA (PORUŠENÍ ZNAMENÁ KATASTROFU):
      1. Vyber PŘESNĚ 1x GPU, 1x CPU, 1x Motherboard, 1x RAM, 1x SSD, 1x PSU.
      2. Přečti si text (snippet) a název (title) u každého dílu. Najdi tam reálnou cenu v Kč.
      3. Zkopíruj 'title' do 'name' a 'link' do 'link'. Cenu zapiš jako čisté číslo (např. 14990).
      4. Pokud u komponenty v textu není napsaná žádná cena, NESMÍŠ JÍ VYBRAT. Vezmi jinou variantu.
      5. Nikdy si nevymýšlej cenu z hlavy. 
      6. Zkus se co nejvíce přiblížit k rozpočtu: ${budget} Kč.

      Vrať POUZE JSON:
      {
        "title": "Guru Herní Mašina",
        "explanation": "Komentář...",
        "components": [
          { "part": "GPU", "name": "...", "price": 0, "link": "..." },
          { "part": "CPU", "name": "...", "price": 0, "link": "..." }
        ]
      }
    `;

    const aiRes = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.0 // Absolutní zákaz jakékoliv kreativity a vymýšlení cen
    });

    const resData = JSON.parse(aiRes.choices[0].message.content);
    
    // 3. SEČTENÍ NA FRONTENDU
    let realTotal = 0;
    resData.components.forEach(c => { realTotal += (Number(c.price) || 0); });

    // Zmírněná ochrana: Spadne to jen tehdy, když Serper kompletně selže a nepošle vůbec nic
    if (!resData.components || resData.components.length === 0) {
       throw new Error("E-shopy aktuálně nevrací dostupná data. Zkuste to prosím za chvíli.");
    }

    const slug = `guru-sestava-${budget}-${Date.now()}`;
    
    const { data, error } = await supabase.from('sestavy').insert([{
      title: `${resData.title} za ${realTotal.toLocaleString()} Kč`,
      description: "Sestava striktně vygenerovaná z aktuálních cen e-shopů.",
      budget: budget,
      usage: "Gaming",
      components: resData.components,
      content: resData.explanation,
      total_price: realTotal,
      slug: slug,
      image_url: "https://i.postimg.cc/QdWxszv3/bg-guru.png"
    }]).select();

    if (error) throw error;
    return NextResponse.json({ success: true, url: `/sestavy/${slug}` });

  } catch (error) {
    console.error("GURU BUILDER ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
