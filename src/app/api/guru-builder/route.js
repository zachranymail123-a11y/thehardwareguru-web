import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// TAHÁME ŽIVOU CENU PŘESNĚ PRO TVŮJ KONKRÉTNÍ PRODUKT
async function fetchLivePrice(productName, fallbackPrice) {
  try {
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: `site:alza.cz "${productName}" cena`, num: 3 })
    });
    const data = await res.json();
    for (const s of (data.organic || [])) {
      const match = (s.snippet + " " + s.title).replace(/\u00A0/g, ' ').match(/(\d{1,3}(?:[ \.]\d{3})*|\d+)\s*(?:Kč|,-|CZK)/i);
      if (match) {
        const price = parseInt(match[1].replace(/[\s\.]/g, ''), 10);
        // Ochrana - vezmeme jen reálnou cenu (odfiltruje kraviny jako "splátka od 200 Kč")
        if (price > 1000 && price < fallbackPrice * 1.5) {
          return price;
        }
      }
    }
  } catch (e) {
    console.error(`Chyba ceny u ${productName}:`, e);
  }
  // Pokud Alza nebo Serper mlčí, použijeme default, aby to nespadlo na Error oknu
  return fallbackPrice; 
}

export async function POST(req) {
  try {
    const { budget } = await req.json();
    const budgetNum = Number(budget);

    // 1. DEFINICE TVÝCH KONKRÉTNÍCH KOMPONENTŮ A ODKAZŮ (Včetně TDP a TGP)
    const catalog = {
      baseCPU: { name: 'AMD Ryzen 7 7700', link: 'https://www.alza.cz/amd-ryzen-7-7700-d7612606.htm?o=1', power: 65, defaultPrice: 5990 },
      baseGPU: { name: 'GIGABYTE GeForce RTX 5070 EAGLE OC 12G', link: 'https://www.alza.cz/gigabyte-geforce-rtx-5070-eagle-oc-12g-d12815107.htm?o=6', power: 250, defaultPrice: 16490 },
      baseMB: { name: 'MSI MAG B850 TOMAHAWK WIFI', link: 'https://www.alza.cz/msi-mag-b850-tomahawk-wifi-d13163989.htm?o=78', power: 0, defaultPrice: 5490 },
      baseRAM: { name: 'Patriot Viper Venom 32GB KIT DDR5 6000MHz CL30', link: 'https://www.alza.cz/patriot-viper-venom-32gb-kit-ddr5-6000mhz-cl30-d12440050.htm?o=2', power: 0, defaultPrice: 2790 },
      baseSSD: { name: 'Samsung 990 PRO 2TB', link: 'https://www.alza.cz/samsung-990-pro-2tb-d7516910.htm?o=1', power: 0, defaultPrice: 4490 },
      
      upGPU80: { name: 'GIGABYTE GeForce RTX 5080 GAMING OC 16G', link: 'https://www.alza.cz/graficke-karty-nvidia-geforce-rtx-5080/18810050.htm', power: 320, defaultPrice: 31990 },
      upGPU90: { name: 'GIGABYTE GeForce RTX 5090 GAMING OC 32G', link: 'https://www.alza.cz/graficke-karty-nvidia-geforce-rtx-5090/18810049.htm', power: 500, defaultPrice: 54990 },
      upCPU: { name: 'AMD Ryzen 7 9800X3D', link: 'https://www.alza.cz/amd-ryzen-7-9800x3d-d12666752.htm', power: 120, defaultPrice: 12990 },
      upMB: { name: 'MSI MPG X870E CARBON WIFI', link: 'https://www.alza.cz/msi-mpg-x870e-carbon-wifi-d12548842.htm', power: 0, defaultPrice: 11490 },
      upRAM: { name: 'Patriot Viper Venom 64GB KIT DDR5 6000MHz CL30', link: 'https://www.alza.cz/patriot-viper-venom-64gb-kit-ddr5-6000mhz-cl30-d12440051.htm', power: 0, defaultPrice: 5490 },
      
      psu650: { name: 'Seasonic Core GX-650 ATX 3.1', link: 'https://www.alza.cz/seasonic-core-gx-650-atx-3-2024-d12744103.htm?o=2', power: 650, defaultPrice: 1990 },
      psu850: { name: 'Seasonic Focus GX-850 ATX 3.0', link: 'https://www.alza.cz/seasonic-focus-gx-850-atx-3-0-d7943936.htm', power: 850, defaultPrice: 3490 },
      psu1000: { name: 'Seasonic Vertex GX-1000 ATX 3.0', link: 'https://www.alza.cz/seasonic-vertex-gx-1000-d7600109.htm', power: 1000, defaultPrice: 4990 },
    };

    // 2. PARALELNÍ NAČTENÍ ŽIVÝCH CEN Z ALZY (Projede za sekundu)
    const pricePromises = Object.keys(catalog).map(async (key) => {
      const item = catalog[key];
      const livePrice = await fetchLivePrice(item.name, item.defaultPrice);
      return { [key]: { ...item, price: livePrice } };
    });
    
    const resolvedPrices = await Promise.all(pricePromises);
    const liveCatalog = Object.assign({}, ...resolvedPrices);

    // 3. MATEMATIKA STAVBY (PŘESNĚ PODLE TVÉ LOGIKY, AI MÁ ZÁKAZ VSTUPU)
    let build = {
      GPU: liveCatalog.baseGPU,
      CPU: liveCatalog.baseCPU,
      MB: liveCatalog.baseMB,
      RAM: liveCatalog.baseRAM,
      SSD: liveCatalog.baseSSD
    };

    // Funkce na zjištění aktuální ceny rozdělané sestavy
    const getCost = (b) => b.GPU.price + b.CPU.price + b.MB.price + b.RAM.price + b.SSD.price;
    
    // KASKÁDOVÝ UPGRADE (Pořadí: 1. GPU -> 2. CPU -> 3. MB -> 4. RAM)
    
    // 1. GPU Upgrade (Otestuje nejdražší 5090, pak 5080)
    if (getCost({ ...build, GPU: liveCatalog.upGPU90 }) + liveCatalog.psu1000.price <= budgetNum) {
       build.GPU = liveCatalog.upGPU90;
    } else if (getCost({ ...build, GPU: liveCatalog.upGPU80 }) + liveCatalog.psu850.price <= budgetNum) {
       build.GPU = liveCatalog.upGPU80;
    }

    // 2. CPU Upgrade
    if (getCost({ ...build, CPU: liveCatalog.upCPU }) + liveCatalog.psu650.price <= budgetNum) {
       build.CPU = liveCatalog.upCPU;
    }

    // 3. MB Upgrade
    if (getCost({ ...build, MB: liveCatalog.upMB }) + liveCatalog.psu650.price <= budgetNum) {
       build.MB = liveCatalog.upMB;
    }

    // 4. RAM Upgrade
    if (getCost({ ...build, RAM: liveCatalog.upRAM }) + liveCatalog.psu650.price <= budgetNum) {
       build.RAM = liveCatalog.upRAM;
    }

    // 5. VÝPOČET ZDROJE (TDP + TGP + 100W)
    const requiredPower = build.CPU.power + build.GPU.power + 100;
    let selectedPsu = liveCatalog.psu650;
    
    if (requiredPower > 850) {
       selectedPsu = liveCatalog.psu1000;
    } else if (requiredPower > 650) {
       selectedPsu = liveCatalog.psu850;
    }

    build.PSU = selectedPsu;
    const finalTotal = getCost(build) + build.PSU.price;

    const componentsArray = [
      { part: "GPU", name: build.GPU.name, price: build.GPU.price, link: build.GPU.link },
      { part: "CPU", name: build.CPU.name, price: build.CPU.price, link: build.CPU.link },
      { part: "Motherboard", name: build.MB.name, price: build.MB.price, link: build.MB.link },
      { part: "RAM", name: build.RAM.name, price: build.RAM.price, link: build.RAM.link },
      { part: "SSD", name: build.SSD.name, price: build.SSD.price, link: build.SSD.link },
      { part: "PSU", name: build.PSU.name, price: build.PSU.price, link: build.PSU.link }
    ];

    // 4. AI JEN NAPÍŠE TEXTOVÝ KOMENTÁŘ NA ZÁKLADĚ TOHO, CO JSME SLOŽILI
    const aiRes = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: `Napiš úderně a sebevědomě max 2 věty o této sestavě: ${build.GPU.name} a ${build.CPU.name}. Styl: The Hardware Guru. Žádné ceny, jen chvála výkonu.` }]
    });
    const explanation = aiRes.choices[0].message.content.trim();

    // 5. ULOŽIT DO DATABÁZE
    const slug = `guru-sestava-${budget}-${Date.now()}`;
    const { error } = await supabase.from('sestavy').insert([{
      title: `Guru Herní Mašina za ${finalTotal.toLocaleString()} Kč`,
      description: "Sestava striktně vygenerovaná od minimálního základu s logickými upgrady podle The Hardware Guru.",
      budget: budget,
      usage: "Gaming",
      components: componentsArray,
      content: explanation,
      total_price: finalTotal,
      slug: slug,
      image_url: "https://i.postimg.cc/QdWxszv3/bg-guru.png"
    }]);

    if (error) throw error;
    return NextResponse.json({ success: true, url: `/sestavy/${slug}` });

  } catch (error) {
    console.error("GURU BUILDER ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
