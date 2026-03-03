import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// FUNKCE PRO ZÍSKÁNÍ REÁLNÉ CENY Z ALZY (S FALLBACKEM NA TVOJE PEVNÉ ODKAZY)
async function getPrice(query, fallbackName, fallbackPrice, fallbackLink, power = 0) {
  try {
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: `site:alza.cz "${query}" cena`, num: 3 })
    });
    const data = await res.json();
    for (const s of (data.organic || [])) {
      const match = (s.snippet + " " + s.title).replace(/\u00A0/g, ' ').match(/(\d{1,3}(?:[ \.]\d{3})*|\d+)\s*(?:Kč|,-|CZK)/i);
      if (match) {
        const price = parseInt(match[1].replace(/[\s\.]/g, ''), 10);
        if (price > 1000) {
          // Našli jsme reálnou cenu, vrátíme ji s tvým pevným linkem
          return { name: fallbackName, price: price, link: fallbackLink || s.link, power: power };
        }
      }
    }
  } catch (e) {
    console.error(`Chyba při hledání ceny pro ${query}`);
  }
  // Pokud selže hledání, použije se fallback, abychom nespadli
  return { name: fallbackName, price: fallbackPrice, link: fallbackLink, power: power };
}

export async function POST(req) {
  try {
    const { budget, preference } = await req.json();
    const budgetNum = Number(budget);

    // 1. ZÍSKÁVÁME REÁLNÉ DNEŠNÍ CENY PRO TVŮJ ZÁKLAD I UPGRADY (Paralelně)
    const [
      baseCPU, baseGPU, baseMB, baseRAM, baseSSD, basePSU,
      upGPU1, upGPU2, upCPU, upMB, upRAM, upPSU850, upPSU1000
    ] = await Promise.all([
      // PEVNÝ ZÁKLAD (Tvoje odkazy a TDP/TGP limity)
      getPrice('AMD Ryzen 7 7700', 'AMD Ryzen 7 7700', 6000, 'https://www.alza.cz/amd-ryzen-7-7700-d7612606.htm?o=1', 65),
      getPrice('GIGABYTE GeForce RTX 5070 EAGLE OC 12G', 'GIGABYTE GeForce RTX 5070 EAGLE OC 12G', 16500, 'https://www.alza.cz/gigabyte-geforce-rtx-5070-eagle-oc-12g-d12815107.htm?o=6', 250),
      getPrice('MSI MAG B850 TOMAHAWK WIFI', 'MSI MAG B850 TOMAHAWK WIFI', 5500, 'https://www.alza.cz/msi-mag-b850-tomahawk-wifi-d13163989.htm?o=78', 0),
      getPrice('Patriot Viper Venom 32GB KIT DDR5 6000MHz CL30', 'Patriot Viper Venom 32GB KIT DDR5 6000MHz CL30', 2800, 'https://www.alza.cz/patriot-viper-venom-32gb-kit-ddr5-6000mhz-cl30-d12440050.htm?o=2', 0),
      getPrice('Samsung 990 PRO 2TB', 'Samsung 990 PRO 2TB', 4500, 'https://www.alza.cz/samsung-990-pro-2tb-d7516910.htm?o=1', 0),
      getPrice('Seasonic Core GX-650', 'Seasonic Core GX-650 ATX 3.1', 2000, 'https://www.alza.cz/seasonic-core-gx-650-atx-3-2024-d12744103.htm?o=2', 650),

      // KATALOG UPGRADŮ S REÁLNÝMI ODKAZY
      getPrice('NVIDIA GeForce RTX 5080 16G', 'NVIDIA GeForce RTX 5080 16G', 32000, 'https://www.alza.cz/graficke-karty-nvidia-geforce-rtx-5080/18810050.htm', 320),
      getPrice('NVIDIA GeForce RTX 5090 32G', 'NVIDIA GeForce RTX 5090 32G', 55000, 'https://www.alza.cz/graficke-karty-nvidia-geforce-rtx-5090/18810049.htm', 500),
      getPrice('AMD Ryzen 7 9800X3D', 'AMD Ryzen 7 9800X3D', 13000, 'https://www.alza.cz/amd-ryzen-7-9800x3d-d12666752.htm', 120),
      getPrice('MSI MPG X870E CARBON WIFI', 'MSI MPG X870E CARBON WIFI', 11500, 'https://www.alza.cz/msi-mpg-x870e-carbon-wifi-d12548842.htm', 0),
      getPrice('Patriot Viper Venom 64GB KIT DDR5', 'Patriot Viper Venom 64GB KIT DDR5 6000MHz CL30', 5500, 'https://www.alza.cz/patriot-viper-venom-64gb-kit-ddr5-6000mhz-cl30-d12440051.htm', 0),
      getPrice('Seasonic Focus GX-850', 'Seasonic Focus GX-850 ATX 3.0', 3500, 'https://www.alza.cz/seasonic-focus-gx-850-atx-3-0-d7943936.htm', 850),
      getPrice('Seasonic Vertex GX-1000', 'Seasonic Vertex GX-1000 ATX 3.0', 5000, 'https://www.alza.cz/seasonic-vertex-gx-1000-d7600109.htm', 1000)
    ]);

    // 2. STAVBA PC (TVRDÁ JS MATEMATIKA, UMĚLÁ INTELIGENCE MÁ ZÁKAZ VSTUPU)
    let build = { GPU: baseGPU, CPU: baseCPU, MB: baseMB, RAM: baseRAM, SSD: baseSSD };
    
    // Aktuální cena bez zdroje (ten se dopočítá nakonec)
    let currentTotal = build.GPU.price + build.CPU.price + build.MB.price + build.RAM.price + build.SSD.price;

    // PRAVIDLO 1: Upgrade GPU
    if (currentTotal - baseGPU.price + upGPU2.price <= budgetNum - basePSU.price) {
      build.GPU = upGPU2;
      currentTotal = currentTotal - baseGPU.price + upGPU2.price;
    } else if (currentTotal - baseGPU.price + upGPU1.price <= budgetNum - basePSU.price) {
      build.GPU = upGPU1;
      currentTotal = currentTotal - baseGPU.price + upGPU1.price;
    }

    // PRAVIDLO 2: Upgrade CPU
    if (currentTotal - baseCPU.price + upCPU.price <= budgetNum - basePSU.price) {
      build.CPU = upCPU;
      currentTotal = currentTotal - baseCPU.price + upCPU.price;
    }

    // PRAVIDLO 3: Upgrade MB
    if (currentTotal - baseMB.price + upMB.price <= budgetNum - basePSU.price) {
      build.MB = upMB;
      currentTotal = currentTotal - baseMB.price + upMB.price;
    }

    // PRAVIDLO 4: Upgrade RAM (kapacita)
    if (currentTotal - baseRAM.price + upRAM.price <= budgetNum - basePSU.price) {
      build.RAM = upRAM;
      currentTotal = currentTotal - baseRAM.price + upRAM.price;
    }

    // PRAVIDLO 5: VÝPOČET ZDROJE (TDP + TGP + 100W)
    const requiredWattage = build.CPU.power + build.GPU.power + 100;
    let finalPSU = basePSU; // Záleží na výpočtu, startujeme na tvém 650W

    if (requiredWattage > 850) {
      finalPSU = upPSU1000;
    } else if (requiredWattage > 650) {
      finalPSU = upPSU850;
    }
    
    build.PSU = finalPSU;
    currentTotal += finalPSU.price;

    // 3. AI JEN PÍŠE TEXT, NESTAVÍ POČÍTAČ
    const componentsArray = [
      { part: "GPU", name: build.GPU.name, price: build.GPU.price, link: build.GPU.link },
      { part: "CPU", name: build.CPU.name, price: build.CPU.price, link: build.CPU.link },
      { part: "Motherboard", name: build.MB.name, price: build.MB.price, link: build.MB.link },
      { part: "RAM", name: build.RAM.name, price: build.RAM.price, link: build.RAM.link },
      { part: "SSD", name: build.SSD.name, price: build.SSD.price, link: build.SSD.link },
      { part: "PSU", name: build.PSU.name, price: build.PSU.price, link: build.PSU.link }
    ];

    const prompt = `
      Napiš krátký, úderný komentář (max 3 věty) pro hotovou herní PC sestavu.
      Komponenty v sestavě: ${build.GPU.name}, ${build.CPU.name}.
      Zdroj má rezervu pro TGP a TDP.
      Napiš to ve stylu "The Hardware Guru" (sebevědomě).
      Vrať POUZE prostý text komentáře, nic jiného.
    `;

    const aiRes = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }]
    });

    const explanation = aiRes.choices[0].message.content.trim();

    // 4. ULOŽENÍ DO SUPABASE
    const slug = `guru-sestava-${budget}-${Date.now()}`;
    
    const { data, error } = await supabase.from('sestavy').insert([{
      title: `Guru Herní Mašina za ${currentTotal.toLocaleString()} Kč`,
      description: "Sestava vypočítaná podle striktní logiky The Hardware Guru.",
      budget: budget,
      usage: "Gaming",
      components: componentsArray,
      content: explanation,
      total_price: currentTotal,
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
