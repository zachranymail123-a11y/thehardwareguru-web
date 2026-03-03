import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Pomocná funkce pro cílené hledání jedné komponenty
async function fetchComponentData(componentType, query) {
  try {
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: `site:alza.cz OR site:smarty.cz OR site:mironet.cz ${query} cena "Kč"`, num: 5 })
    });
    const data = await res.json();
    return data.organic?.map(s => ({
      part: componentType,
      title: s.title,
      link: s.link,
      snippet: s.snippet
    })) || [];
  } catch (e) {
    console.error(`Chyba při hledání ${componentType}:`, e);
    return [];
  }
}

export async function POST(req) {
  try {
    const { budget, preference } = await req.json();
    const budgetNum = Number(budget);

    // 1. GURU NÁKUPČÍ - Hledáme každou komponentu ZVLÁŠŤ
    // Dynamicky upravíme dotazy podle budgetu a týmu
    const gpuQuery = preference === 'Červený' 
        ? (budgetNum > 50000 ? 'AMD Radeon RX 9070 XT' : 'AMD Radeon RX 9070')
        : (budgetNum > 70000 ? 'NVIDIA RTX 5090' : (budgetNum > 45000 ? 'NVIDIA RTX 5080' : 'NVIDIA RTX 5070'));
    
    const cpuQuery = budgetNum > 50000 ? 'AMD Ryzen 9 9900X' : 'AMD Ryzen 7 9700X OR Ryzen 5 9600X';

    // Provedeme všechna hledání paralelně, ať to netrvá věčnost
    const [gpuData, cpuData, mbData, ramData, ssdData, psuData] = await Promise.all([
      fetchComponentData('GPU', gpuQuery),
      fetchComponentData('CPU', cpuQuery),
      fetchComponentData('Motherboard', 'základní deska B850 OR X870 AM5'),
      fetchComponentData('RAM', 'paměť RAM 32GB DDR5 6000MHz'),
      fetchComponentData('SSD', 'SSD disk 2TB NVMe M.2'),
      fetchComponentData('PSU', 'počítačový zdroj 850W Gold')
    ]);

    // Spojíme všechny nalezené produkty do jednoho "katalogu"
    const catalog = [...gpuData, ...cpuData, ...mbData, ...ramData, ...ssdData, ...psuData];

    // 2. GURU MOZEK - Skutečné skládání ze skutečného katalogu
    const prompt = `
      Jsi The Hardware Guru. Tvým jediným úkolem je sestavit herní PC.
      Cílový rozpočet: ${budget} Kč.

      TADY JE TVŮJ KATALOG DÍLŮ Z ČESKÝCH E-SHOPŮ (MUSÍŠ VYUŽÍT POUZE TYTO DÍLY!):
      ${JSON.stringify(catalog)}

      STRIKTNÍ GURU PRAVIDLA:
      1. Sestav kompletní PC obsahující přesně tyto díly: CPU, Motherboard, GPU, RAM, SSD, PSU.
      2. VYBÍREJ POUZE Z KATALOGU VÝŠE. Nevymýšlej si žádné jiné komponenty.
      3. U každého vybraného dílu MUSÍŠ zkopírovat jeho PŘESNÝ název a reálný 'link' z katalogu.
      4. Extrahuj reálnou cenu ze snippetu/titulku v katalogu (např. pokud vidíš '15 490 Kč', napiš 15490). CENA NESMÍ BÝT 0!
      5. Pokud se nevejděš do rozpočtu, vyber levnější variantu z katalogu, ale KOMPONENTA MUSÍ BÝT Z KATALOGU A NESMÍ MÍT CENU 0.

      Vrať POUZE JSON v tomto formátu (striktně dodrž klíče):
      {
        "title": "Guru Herní Mašina za ${budget} Kč",
        "explanation": "Stručný komentář, proč jsi vybral tyto konkrétní díly...",
        "components": [
          { "part": "GPU", "name": "[Přesný název z katalogu]", "price": [Číslo, např. 15490], "link": "[Přesná URL z katalogu]" },
          { "part": "CPU", "name": "[Přesný název z katalogu]", "price": [Číslo], "link": "[Přesná URL z katalogu]" }
          // Doplň Motherboard, RAM, SSD, PSU...
        ]
      }
    `;

    const aiRes = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2 // Snížíme kreativitu na minimum, chceme jen strojové zpracování
    });

    const resData = JSON.parse(aiRes.choices[0].message.content);
    
    // Ochrana na frontendu: sečteme reálné ceny dodané AI
    const realTotal = resData.components.reduce((sum, c) => sum + (Number(c.price) || 0), 0);

    // Pokud AI selhala a nedodala 6 komponent nebo je cena podezřele nízká (např. 0), vyhodíme chybu
    if (!resData.components || resData.components.length < 5 || realTotal < 10000) {
       throw new Error("AI nedokázala poskládat validní sestavu z dodaných dat.");
    }

    const slug = `guru-sestava-${budget}-${Date.now()}`;
    
    const { data, error } = await supabase.from('sestavy').insert([{
      title: resData.title,
      description: `Reálný herní build s ověřenými cenami.`,
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
