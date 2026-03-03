import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// TVOJE PEVNÁ MINIMÁLNÍ SESTAVA - TVOJE CENY, TVOJE ODKAZY
const BASE_BUILD = {
  GPU: { name: 'GIGABYTE GeForce RTX 5070 EAGLE OC 12G', price: 16490, link: 'https://www.alza.cz/gigabyte-geforce-rtx-5070-eagle-oc-12g-d12815107.htm?o=6', power: 250 },
  CPU: { name: 'AMD Ryzen 7 7700', price: 5990, link: 'https://www.alza.cz/amd-ryzen-7-7700-d7612606.htm?o=1', power: 65 },
  MB: { name: 'MSI MAG B850 TOMAHAWK WIFI', price: 5490, link: 'https://www.alza.cz/msi-mag-b850-tomahawk-wifi-d13163989.htm?o=78', power: 0 },
  RAM: { name: 'Patriot Viper Venom 32GB KIT DDR5 6000MHz CL30', price: 2790, link: 'https://www.alza.cz/patriot-viper-venom-32gb-kit-ddr5-6000mhz-cl30-d12440050.htm?o=2', power: 0 },
  SSD: { name: 'Samsung 990 PRO 2TB', price: 4490, link: 'https://www.alza.cz/samsung-990-pro-2tb-d7516910.htm?o=1', power: 0 },
  PSU: { name: 'Seasonic Core GX-650 ATX 3.1', price: 1990, link: 'https://www.alza.cz/seasonic-core-gx-650-atx-3-2024-d12744103.htm?o=2', capacity: 650 }
};

// PEVNÝ KATALOG PRO UPGRADY
const UPGRADES = {
  GPU: [
    { name: 'GIGABYTE GeForce RTX 5090 GAMING OC 32G', price: 54990, link: 'https://www.alza.cz/graficke-karty-nvidia-geforce-rtx-5090/18810049.htm', power: 500 },
    { name: 'GIGABYTE GeForce RTX 5080 GAMING OC 16G', price: 31990, link: 'https://www.alza.cz/graficke-karty-nvidia-geforce-rtx-5080/18810050.htm', power: 320 }
  ],
  CPU: [
    { name: 'AMD Ryzen 7 9800X3D', price: 12990, link: 'https://www.alza.cz/amd-ryzen-7-9800x3d-d12666752.htm', power: 120 }
  ],
  MB: [
    { name: 'MSI MPG X870E CARBON WIFI', price: 11490, link: 'https://www.alza.cz/msi-mpg-x870e-carbon-wifi-d12548842.htm', power: 0 }
  ],
  RAM: [
    { name: 'Patriot Viper Venom 64GB KIT DDR5 6000MHz CL30', price: 5490, link: 'https://www.alza.cz/patriot-viper-venom-64gb-kit-ddr5-6000mhz-cl30-d12440051.htm', power: 0 }
  ],
  PSU: [
    { name: 'Seasonic Focus GX-850 ATX 3.0', price: 3490, link: 'https://www.alza.cz/seasonic-focus-gx-850-atx-3-0-d7943936.htm', capacity: 850 },
    { name: 'Seasonic Vertex GX-1000 ATX 3.0', price: 4990, link: 'https://www.alza.cz/seasonic-vertex-gx-1000-d7600109.htm', capacity: 1000 }
  ]
};

const getPartsPrice = (b) => b.GPU.price + b.CPU.price + b.MB.price + b.RAM.price + b.SSD.price;

export async function POST(req) {
  try {
    const { budget } = await req.json();
    const budgetNum = Number(budget);

    let build = { ...BASE_BUILD };
    let budgetLeft = budgetNum - (getPartsPrice(build) + BASE_BUILD.PSU.price);

    // LOGIKA UPGRADŮ (GPU -> CPU -> MB -> RAM)
    for (const gpu of UPGRADES.GPU) {
      const diff = gpu.price - BASE_BUILD.GPU.price;
      if (budgetLeft >= diff) { build.GPU = gpu; budgetLeft -= diff; break; }
    }
    for (const cpu of UPGRADES.CPU) {
      const diff = cpu.price - BASE_BUILD.CPU.price;
      if (budgetLeft >= diff) { build.CPU = cpu; budgetLeft -= diff; break; }
    }
    for (const mb of UPGRADES.MB) {
      const diff = mb.price - BASE_BUILD.MB.price;
      if (budgetLeft >= diff) { build.MB = mb; budgetLeft -= diff; break; }
    }
    for (const ram of UPGRADES.RAM) {
      const diff = ram.price - BASE_BUILD.RAM.price;
      if (budgetLeft >= diff) { build.RAM = ram; budgetLeft -= diff; break; }
    }

    // VÝPOČET ZDROJE (TDP + TGP + 100W)
    const reqPwr = build.CPU.power + build.GPU.power + 100;
    let finalPSU = BASE_BUILD.PSU;
    if (reqPwr > 850) finalPSU = UPGRADES.PSU[1];
    else if (reqPwr > 650) finalPSU = UPGRADES.PSU[0];
    build.PSU = finalPSU;

    const finalTotal = getPartsPrice(build) + build.PSU.price;
    const slug = `guru-sestava-${budget}-${Date.now()}`;

    // ULOŽENÍ DO DB (Striktní, žádný scrapování!)
    const { error: dbError } = await supabase.from('sestavy').insert([{
      title: `Guru Herní Mašina za ${finalTotal.toLocaleString()} Kč`,
      budget: budget,
      components: [
        { part: "GPU", name: build.GPU.name, price: build.GPU.price, link: build.GPU.link },
        { part: "CPU", name: build.CPU.name, price: build.CPU.price, link: build.CPU.link },
        { part: "Motherboard", name: build.MB.name, price: build.MB.price, link: build.MB.link },
        { part: "RAM", name: build.RAM.name, price: build.RAM.price, link: build.RAM.link },
        { part: "SSD", name: build.SSD.name, price: build.SSD.price, link: build.SSD.link },
        { part: "PSU", name: build.PSU.name, price: build.PSU.price, link: build.PSU.link }
      ],
      total_price: finalTotal,
      content: "Sestava sestavená podle pevných a ověřených cen.",
      slug: slug,
      image_url: "https://i.postimg.cc/QdWxszv3/bg-guru.png"
    }]);

    if (dbError) throw dbError;

    return NextResponse.json({ success: true, url: `/sestavy/${slug}` });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
