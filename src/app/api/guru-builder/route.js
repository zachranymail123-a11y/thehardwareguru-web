import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// NEPRŮSTŘELNÝ VYTAHOVAČ CEN
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
      const textToSearch = (s.snippet + " " + s.title).replace(/\u00A0/g, ' '); 
      // Chytne jakýkoliv formát čísla před Kč (14990, 14 990, 14.990)
      const match = textToSearch.match(/([0-9\s\.,]+)\s*Kč/i);
      
      if (match) {
        // Vymaže všechno kromě čistých číslic
        const price = parseInt(match[1].replace(/\D/g, ''), 10);
        
        // Zahození SEO nesmyslů (splátky za 300 Kč atd.)
        if (price > 1000 && price < 150000) {
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

    // 1. GURU DOTAZY (Rozšířeno pro RTX a zachováno striktní AMD)
    const gpuQuery = preference === 'Červený' 
        ? (budgetNum > 50000 ? 'AMD Radeon RX 9070 XT' : 'AMD Radeon RX 9070')
        : (budgetNum > 70000 ? 'NVIDIA RTX 5090' : (budgetNum > 45000 ? 'NVIDIA RTX 5080' : (budgetNum > 35000 ? 'NVIDIA RTX 5070' : 'NVIDIA RTX 4060 OR RTX 4070')));
    
    // ZACHOVÁNO: Ryzen 7 (8 jader) a výše
    const cpuQuery = budgetNum > 50000 ? 'AMD Ryzen 9 9900X' : 'AMD Ryzen 7 9700X OR AMD Ryzen 7 9800X3D';

    const [gpuData, cpuData, mbData, ramData, ssdData, psuData] = await Promise.all([
      fetchComponentData('GPU', gpuQuery),
      fetchComponentData('CPU', cpuQuery),
      fetchComponentData('Motherboard', 'základní deska B850 OR X870 AM5'),
      fetchComponentData('RAM', '32GB KIT DDR5 6000MHz Kingston FURY OR Corsair Vengeance'),
      fetchComponentData('SSD', 'SSD 1TB OR 2TB NVMe M.2'),
      fetchComponentData('PSU', 'počítačový zdroj 750W OR 850W 80 Plus Gold')
    ]);

    const catalog = [...gpuData, ...cpuData, ...mbData, ...ramData, ...ssdData, ...psuData];

    // 2. GURU MOZEK - ZÁKAZ VYNECHÁVAT DÍLY KVŮLI BUDGETU
    const prompt = `
      Jsi The Hardware Guru. 
      Zde je tvůj katalog z e-shopů:
      ${JSON.stringify(catalog)}

      TVŮJ ÚKOL (ZÁKAZ CHYBOVÁNÍ):
      1. MUSÍŠ vybrat PŘESNĚ TĚCHTO 6 KOMPONENT: 1x GPU, 1x CPU, 1x Motherboard, 1x RAM, 1x SSD, 1x PSU.
      2. POKUD JE ZADANÝ ROZPOČET (${budget} Kč) PŘÍLIŠ NÍZKÝ, IGNORUJ HO. Prostě vyber nejlevnější smysluplnou variantu z katalogu tak, abys postavil KOMPLETNÍ PC.
      3. Zkopíruj PŘESNĚ 'name', 'price' a 'link' z katalogu. 
      4. Nevymýšlej si čísla.

      Vrať POUZE JSON:
      {
        "title": "Guru Herní Mašina",
        "explanation": "Komentář k sestavě...",
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
      temperature: 0.0 // ŽÁDNÁ FANTASIE
    });

    const resData = JSON.parse(aiRes.choices[0].message.content);
    
    // 3. KONTROLA NA FRONTENDU
    let realTotal = 0;
    resData.components.forEach(c => { realTotal += (Number(c.price) || 0); });

    // Už to nespadne kvůli budgetu, ale spadne to jen tehdy, když Serper nedodá data
    if (!resData.components || resData.components.length < 5 || realTotal < 10000) {
       throw new Error("Při čtení dat z e-shopů došlo k chybě. Zkus to prosím znovu.");
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
