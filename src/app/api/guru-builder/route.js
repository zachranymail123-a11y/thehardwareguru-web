import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// NEPRŮSTŘELNÝ EXTRAKTOR S MAXIMÁLNÍM CENOVÝM LIMITEM
async function fetchComponentData(componentType, query, maxPrice = 999999) {
  try {
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: `site:alza.cz OR site:smarty.cz OR site:mironet.cz ${query}`, num: 10 })
    });
    const data = await res.json();
    const validItems = [];

    for (const s of (data.organic || [])) {
      const textToSearch = (s.snippet + " " + s.title).replace(/\u00A0/g, ' ');
      // Najde všechny formáty: 14 990 Kč, 14.990 Kč, 14990,-, 14 990 CZK
      const match = textToSearch.match(/(\d{1,3}(?:[ \.]\d{3})*|\d+)\s*(?:Kč|,-|CZK)/i);

      if (match) {
        // Očištění na čisté číslo
        const price = parseInt(match[1].replace(/[\s\.]/g, ''), 10);
        
        // LIMIT: Ignoruje splátky (pod 1000) a IGNORUJE PŘEDRAŽENÉ DÍLY (maxPrice)
        if (price >= 1000 && price <= maxPrice) {
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
    
    // Pošleme dál maximálně 4 reálné odkazy
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

    // 1. DOTAZY POUZE NA 8+ JADER A ZAKÁZANÉ PŘEDRAŽENÉ DÍLY
    const gpuQuery = preference === 'Červený' 
        ? (budgetNum > 50000 ? 'AMD Radeon RX 9070 XT' : 'AMD Radeon RX 9070')
        : (budgetNum > 70000 ? 'NVIDIA RTX 5090' : (budgetNum > 45000 ? 'NVIDIA RTX 5080' : 'NVIDIA RTX 5070'));
    
    // POUZE 8 JADER A VÝŠE. Žádný Ryzen 5!
    const cpuQuery = budgetNum > 50000 ? 'AMD Ryzen 9 9900X' : 'AMD Ryzen 7 9700X OR Ryzen 7 9800X3D';

    // 2. PARALELNÍ HLEDÁNÍ S TVRDOU CENZUROU MAXIMÁLNÍ CENY (Už žádné desky za 18k!)
    const [gpuData, cpuData, mbData, ramData, ssdData, psuData] = await Promise.all([
      fetchComponentData('GPU', gpuQuery), 
      fetchComponentData('CPU', cpuQuery),
      fetchComponentData('Motherboard', 'základní deska AM5 B850 OR X870', 7500), // DESKA MAX 7500 Kč!
      fetchComponentData('RAM', '32GB DDR5 6000MHz CL30', 4500), // RAM MAX 4500 Kč!
      fetchComponentData('SSD', '1TB OR 2TB NVMe M.2 SSD', 5000), // SSD MAX 5000 Kč!
      fetchComponentData('PSU', 'zdroj 850W 80 Plus Gold', 4500) // ZDROJ MAX 4500 Kč!
    ]);

    const catalog = [...gpuData, ...cpuData, ...mbData, ...ramData, ...ssdData, ...psuData];

    // 3. TUPÝ GURU MOZEK - VYBER A NEKECEJ
    const prompt = `
      Jsi skladník. Tvým úkolem je poskládat PC POUZE z tohoto seznamu reálných produktů:
      ${JSON.stringify(catalog)}

      PRAVIDLA:
      1. VYBER PŘESNĚ: 1x GPU, 1x CPU, 1x Motherboard, 1x RAM, 1x SSD, 1x PSU.
      2. Ceny a odkazy PŘESNĚ zkopíruj. NESMÍŠ SI NIC VYMYSLET.
      3. Sestav to tak, aby se to blížilo ${budget} Kč. POKUD MÁŠ V KATALOGU JEN DRAŽŠÍ VĚCI A BUDGET NESTAČÍ, IGNORUJ BUDGET A SLOŽ TO Z TOHO NEJLEVNĚJŠÍHO, CO V KATALOGU MÁŠ! Hlavně nevynechej žádný díl!

      Vrať POUZE JSON:
      {
        "title": "Guru Herní Mašina",
        "explanation": "Komentář...",
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
      temperature: 0.0 // ABSOLUTNÍ ZÁKAZ FANTASIE
    });

    const resData = JSON.parse(aiRes.choices[0].message.content);
    
    // 4. BEZPEČNOSTNÍ VÝPOČET REÁLNÉ CENY
    let realTotal = 0;
    resData.components.forEach(c => { realTotal += (Number(c.price) || 0); });

    // Pokud e-shopy nedodaly data, radši vyhodíme chybu, než ukázat nesmysl
    if (!resData.components || resData.components.length < 5 || realTotal < 15000) {
       throw new Error("Při čtení dat z e-shopů došlo k chybě. Omlouváme se, zkuste to znovu.");
    }

    const slug = `guru-sestava-${budget}-${Date.now()}`;
    
    const { data, error } = await supabase.from('sestavy').insert([{
      title: `${resData.title} (Reálná cena)`,
      description: "Sestava striktně vygenerovaná z ověřených reálných dat a odkazů.",
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
