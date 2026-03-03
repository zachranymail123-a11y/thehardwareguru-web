import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Pomocná funkce pro cílené hledání s tvrdým filtrem na ceny
async function fetchComponentData(componentType, query) {
  try {
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: `site:alza.cz OR site:smarty.cz OR site:mironet.cz ${query} cena "Kč"`, num: 6 })
    });
    const data = await res.json();
    
    // ZÁSADNÍ FILTR: Pouštíme dál JEN výsledky, které reálně obsahují text "Kč" ve snippetu nebo titulku.
    const validResults = (data.organic || []).filter(s => 
      /Kč/i.test(s.snippet) || /Kč/i.test(s.title)
    );

    return validResults.map(s => ({
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

    // 1. GURU NÁKUPČÍ - Cílenější dotazy, aby to nenašlo kraviny
    const gpuQuery = preference === 'Červený' 
        ? (budgetNum > 50000 ? 'AMD Radeon RX 9070 XT grafická karta' : 'AMD Radeon RX 9070 grafická karta')
        : (budgetNum > 70000 ? 'NVIDIA RTX 5090 grafická karta' : (budgetNum > 45000 ? 'NVIDIA RTX 5080 grafická karta' : 'NVIDIA RTX 5070 grafická karta'));
    
    const cpuQuery = budgetNum > 50000 ? 'AMD Ryzen 9 9900X procesor' : 'AMD Ryzen 7 9700X OR Ryzen 5 9600X procesor';

    // Provedeme všechna hledání paralelně
    const [gpuData, cpuData, mbData, ramData, ssdData, psuData] = await Promise.all([
      fetchComponentData('GPU', gpuQuery),
      fetchComponentData('CPU', cpuQuery),
      fetchComponentData('Motherboard', 'základní deska B850 OR X870 AM5 -PC'),
      fetchComponentData('RAM', 'Patriot Viper Venom 32GB KIT DDR5 6000MHz OR Kingston FURY 32GB DDR5 6000MHz'),
      fetchComponentData('SSD', 'SSD disk 1TB OR 2TB NVMe M.2 PCIe'),
      fetchComponentData('PSU', 'počítačový zdroj 850W 80 Plus Gold')
    ]);

    // Spojíme nalezené produkty do jednoho katalogu
    const catalog = [...gpuData, ...cpuData, ...mbData, ...ramData, ...ssdData, ...psuData];

    // 2. GURU MOZEK - Vypnuta fantazie, pouze tupé čtení
    const prompt = `
      JSI TUPÝ PARSER DAT. NESMÍŠ SI VYMYSLET ANI KORUNU.
      Tvým úkolem je vybrat 6 komponent z tohoto katalogu:
      ${JSON.stringify(catalog)}

      STRIKTNÍ PRAVIDLA (PORUŠENÍ = FAIL):
      1. VYBÍREJ POUZE Z KATALOGU. Každý díl musí mít přesný 'name' a reálný 'link' z katalogu.
      2. CENY NESMÍŠ HÁDAT. Musíš je vyčíst PŘÍMO Z TEXTU ve snippetu nebo titulku (např. vidíš "14 990 Kč", napiš 14990).
      3. CENA NESMÍ BÝT NIKDY 0! Pokud nevidíš cenu, komponentu přeskoč a vyber jinou.
      4. Sestava se musí co nejvíce blížit částce ${budget} Kč.
      5. Vyber 1x GPU, 1x CPU, 1x Motherboard, 1x RAM, 1x SSD, 1x PSU.

      Vrať POUZE JSON v tomto formátu (striktně dodrž klíče):
      {
        "title": "Guru Herní Mašina za ${budget} Kč",
        "explanation": "Komentář k sestavě...",
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
      temperature: 0.0 // TOTÁLNĚ VYPNOUT FANTASII
    });

    const resData = JSON.parse(aiRes.choices[0].message.content);
    
    // 3. OCHRANA PŘED ULOŽENÍM BLBOSTÍ NA FRONTENDU
    let realTotal = 0;
    let hasZero = false;

    resData.components.forEach(c => {
      const price = Number(c.price) || 0;
      realTotal += price;
      if (price === 0) hasZero = true; // Zachytíme, pokud to AI i tak posrala
    });

    // Pokud chybí komponenty, celková cena je nesmyslně nízká, nebo tam propadla nula, vyhodíme chybu
    if (!resData.components || resData.components.length < 5 || realTotal < 10000 || hasZero) {
       throw new Error("AI nedokázala poskládat validní sestavu s reálnými cenami z e-shopů. Zkus to znovu.");
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
