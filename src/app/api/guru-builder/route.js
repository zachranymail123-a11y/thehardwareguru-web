import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POMOCNÁ FUNKCE - BERE CENU PŘÍMO Z E-SHOPU, ŽÁDNÉ UMĚLÉ LIMITY
async function fetchComponentData(componentType, query) {
  try {
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: `site:alza.cz OR site:smarty.cz OR site:mironet.cz ${query} cena`, num: 8 })
    });
    const data = await res.json();
    const validItems = [];

    for (const s of (data.organic || [])) {
      // Přečteme text a hledáme cokoliv před "Kč" (např. "14 990 Kč" nebo "14.990 Kč")
      const textToSearch = (s.snippet + " " + s.title).replace(/\u00A0/g, ' '); 
      const match = textToSearch.match(/([0-9]{1,3}(?:[ \.][0-9]{3})*)\s*Kč/i);
      
      if (match) {
        // Získáme reálnou cenu z e-shopu
        const price = parseInt(match[1].replace(/[\s\.]/g, ''), 10);
        
        if (price > 0) {
          const cleanTitle = s.title.split('-')[0].split('|')[0].trim();
          validItems.push({
            part: componentType,
            name: cleanTitle,
            price: price,
            link: s.link
          });
        }
      }
    }
    
    // Pošleme AI až 4 reálné možnosti od každého dílu
    return validItems.slice(0, 4);
  } catch (e) {
    console.error(`Chyba při hledání ${componentType}:`, e);
    return [];
  }
}

export async function POST(req) {
  try {
    const { budget, preference } = await req.json();
    const budgetNum = Number(budget);

    // 1. GURU DOTAZY (Procesory pouze 8 jader a více)
    const gpuQuery = preference === 'Červený' 
        ? (budgetNum > 50000 ? 'AMD Radeon RX 9070 XT' : 'AMD Radeon RX 9070')
        : (budgetNum > 70000 ? 'NVIDIA RTX 5090' : (budgetNum > 45000 ? 'NVIDIA RTX 5080' : 'NVIDIA RTX 5070'));
    
    const cpuQuery = budgetNum > 50000 ? 'AMD Ryzen 9 9900X' : 'AMD Ryzen 7 9700X OR AMD Ryzen 7 9800X3D';

    // 2. PARALELNÍ HLEDÁNÍ (Žádné limity v kódu, trh určuje cenu)
    const [gpuData, cpuData, mbData, ramData, ssdData, psuData] = await Promise.all([
      fetchComponentData('GPU', gpuQuery),
      fetchComponentData('CPU', cpuQuery),
      fetchComponentData('Motherboard', 'základní deska B850 OR X870 AM5'),
      fetchComponentData('RAM', '32GB KIT DDR5 6000MHz Kingston FURY OR Corsair Vengeance'),
      fetchComponentData('SSD', 'SSD 1TB OR 2TB NVMe M.2'),
      fetchComponentData('PSU', 'počítačový zdroj 750W OR 850W 80 Plus Gold')
    ]);

    const catalog = [...gpuData, ...cpuData, ...mbData, ...ramData, ...ssdData, ...psuData];

    // 3. GURU MOZEK - VÝBĚR KOMPONENT
    const prompt = `
      Jsi The Hardware Guru. 
      Tady máš přesný seznam zboží s ověřenou cenou z e-shopů k dnešnímu dni:
      ${JSON.stringify(catalog)}

      TVŮJ ÚKOL:
      1. Vyber 1x GPU, 1x CPU, 1x Motherboard, 1x RAM, 1x SSD, 1x PSU.
      2. Součet cen se musí co nejvíce blížit cílovému rozpočtu: ${budget} Kč.
      3. LOGIKA STAVBY: Neutrácej celý budget za nejdražší základní desku na úkor grafiky! Grafika a procesor jsou základ.
      4. Zkopíruj u vybraných dílů PŘESNĚ 'name', 'price' a 'link', jak jsou uvedeny v datech.
      5. NESMÍŠ SI CUKNOUT ANI O KORUNU.

      Vrať POUZE JSON:
      {
        "title": "Guru Herní Mašina za ${budget} Kč",
        "explanation": "Komentář k vyváženosti sestavy...",
        "components": [
          { "part": "GPU", "name": "[Z katalogu]", "price": [Číslo z katalogu], "link": "https://zina.pl/strony/katalog" },
          { "part": "CPU", "name": "[Z katalogu]", "price": [Číslo z katalogu], "link": "https://zina.pl/strony/katalog" }
        ]
      }
    `;

    const aiRes = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.1 // Velmi nízká teplota, aby model nehalucinoval
    });

    const resData = JSON.parse(aiRes.choices[0].message.content);
    
    // 4. BEZPEČNOSTNÍ VÝPOČET NA FRONTENDU
    let realTotal = 0;
    resData.components.forEach(c => { realTotal += (Number(c.price) || 0); });

    if (resData.components.length < 5 || realTotal < 15000) {
       throw new Error("Při čtení dat z e-shopů došlo k chybě. Zkus to prosím znovu.");
    }

    const slug = `guru-sestava-${budget}-${Date.now()}`;
    
    const { data, error } = await supabase.from('sestavy').insert([{
      title: resData.title,
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
