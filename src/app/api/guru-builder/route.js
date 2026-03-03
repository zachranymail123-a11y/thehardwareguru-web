import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Jednoduchý vyhledávač cen pro upgrady a kontrolu
async function fetchPrices(query) {
  try {
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: `site:alza.cz ${query} cena`, num: 3 })
    });
    const data = await res.json();
    const items = [];

    for (const s of (data.organic || [])) {
      const match = (s.snippet + " " + s.title).replace(/\u00A0/g, ' ').match(/(\d{1,3}(?:[ \.]\d{3})*|\d+)\s*(?:Kč|,-|CZK)/i);
      if (match) {
        const price = parseInt(match[1].replace(/[\s\.]/g, ''), 10);
        if (price > 1000) {
          items.push({ name: s.title.split('-')[0].split('|')[0].trim(), price, link: s.link });
        }
      }
    }
    return items[0]; // Vezmeme hned první nejlepší výsledek z Alzy
  } catch (e) {
    return null;
  }
}

export async function POST(req) {
  try {
    const { budget, preference } = await req.json();
    
    // 1. STÁHNEME AKTUÁLNÍ CENY PRO UPGRADE DÍLY (abychom měli reálná data)
    // Základní grafiky a CPU hledat nemusíme, AI dostane natvrdo tvé odkazy
    const [gpuUpgrade1, gpuUpgrade2, cpuUpgrade, mbUpgrade, psu850, psu1000, ram64] = await Promise.all([
      fetchPrices('GIGABYTE GeForce RTX 5080 GAMING OC'), // Upgrade GPU 1
      fetchPrices('GIGABYTE GeForce RTX 5090 GAMING OC'), // Upgrade GPU 2
      fetchPrices('AMD Ryzen 7 9800X3D'),                 // Upgrade CPU
      fetchPrices('MSI MPG X870E CARBON WIFI'),           // Upgrade Deska
      fetchPrices('Seasonic Focus GX-850 ATX 3.0'),       // Upgrade Zdroj 850W
      fetchPrices('Seasonic Vertex GX-1000'),             // Upgrade Zdroj 1000W
      fetchPrices('Patriot Viper Venom 64GB KIT DDR5 6000MHz CL30') // Upgrade RAM
    ]);

    const upgradeCatalog = { gpuUpgrade1, gpuUpgrade2, cpuUpgrade, mbUpgrade, psu850, psu1000, ram64 };

    // 2. GURU LOGIKA S TVRDOU ZÁKLADNÍ SESTAVOU A TVÝMI ODKAZY
    const prompt = `
      Jsi počtář pro The Hardware Guru. Tvůj úkol je sestavit PC s rozpočtem ${budget} Kč.

      TVŮJ ZÁKLADNÍ STAVEBNÍ KÁMEN (MINIMÁLNÍ SESTAVA):
      Tuto sestavu použij jako výchozí bod. Pokud je rozpočet nízký, vrať přesně tyto díly.
      - CPU: "AMD Ryzen 7 7700" (Cena cca 6000 Kč, TDP: 65W, Link: https://www.alza.cz/amd-ryzen-7-7700-d7612606.htm?o=1)
      - GPU: "GIGABYTE GeForce RTX 5070 EAGLE OC 12G" (Cena cca 16500 Kč, TGP: 250W, Link: https://www.alza.cz/gigabyte-geforce-rtx-5070-eagle-oc-12g-d12815107.htm?o=6)
      - MB: "MSI MAG B850 TOMAHAWK WIFI" (Cena cca 5500 Kč, Link: https://www.alza.cz/msi-mag-b850-tomahawk-wifi-d13163989.htm?o=78)
      - RAM: "Patriot Viper Venom 32GB KIT DDR5 6000MHz CL30" (Cena cca 2800 Kč, Link: https://www.alza.cz/patriot-viper-venom-32gb-kit-ddr5-6000mhz-cl30-d12440050.htm?o=2)
      - SSD: "Samsung 990 PRO 2TB" (Cena cca 4500 Kč, Link: https://www.alza.cz/samsung-990-pro-2tb-d7516910.htm?o=1)
      - PSU: "Seasonic Core GX-650 ATX 3.1" (Cena cca 2000 Kč, Link: https://www.alza.cz/seasonic-core-gx-650-atx-3-2024-d12744103.htm?o=2)

      KATALOG UPGRADŮ (S REÁLNÝMI DNEŠNÍMI CENAMI Z ALZY):
      ${JSON.stringify(upgradeCatalog)}
      - Hodnoty spotřeby pro výpočet zdroje: RTX 5080 = 320W, RTX 5090 = 500W, Ryzen 9800X3D = 120W.

      PRAVIDLA PRO UPGRADE (MUSÍŠ DODRŽET POŘADÍ!):
      Pokud zadaný rozpočet (${budget} Kč) dovoluje utrácet víc než stojí základní sestava, vylepšuj díly PŘESNĚ v tomto pořadí:
      1. Grafická karta (Vezmi lepší z katalogu upgradů, např. RTX 5080 nebo 5090)
      2. Procesor (Vezmi lepší z katalogu upgradů, např. 9800X3D)
      3. Základní deska
      4. Větší kapacita RAM (64GB)

      MATEMATIKA ZDROJE (PSU):
      Když vybereš grafiku a procesor, sečti jejich spotřebu: (Max TDP Procesoru + Max TGP Grafiky + 100 W rezerva).
      - Pokud výsledek <= 650W, použij základní 650W zdroj.
      - Pokud výsledek > 650W a <= 850W, použij 850W zdroj z katalogu.
      - Pokud výsledek > 850W, použij 1000W zdroj z katalogu.

      Vrať POUZE JSON:
      {
        "title": "Guru Herní Mašina",
        "explanation": "Komentář, jak jsi postupoval podle pravidel...",
        "components": [
          { "part": "GPU", "name": "...", "price": 0, "link": "..." },
          { "part": "CPU", "name": "...", "price": 0, "link": "..." }
          // Doplň zbytek... VŽDY POUŽIJ REÁLNÝ LINK a CENU
        ]
      }
    `;

    const aiRes = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.0 // Tupý stroj, žádná fantazie
    });

    const resData = JSON.parse(aiRes.choices[0].message.content);
    
    // Front-end ověření ceny
    let realTotal = 0;
    resData.components.forEach(c => { realTotal += (Number(c.price) || 0); });

    const slug = `guru-sestava-${budget}-${Date.now()}`;
    
    const { data, error } = await supabase.from('sestavy').insert([{
      title: `${resData.title} za ${realTotal.toLocaleString()} Kč`,
      description: "Sestava striktně vygenerovaná od minimálního základu s logickými upgrady.",
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
