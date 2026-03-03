import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 1. TVOJE PEVNÁ MINIMÁLNÍ SESTAVA (Ceny jsou fixní, nic se nestahuje z webu)
const baseBuild = {
  GPU: { name: 'GIGABYTE GeForce RTX 5070 EAGLE OC 12G', price: 16500, link: 'https://www.alza.cz/gigabyte-geforce-rtx-5070-eagle-oc-12g-d12815107.htm?o=6', power: 250 },
  CPU: { name: 'AMD Ryzen 7 7700', price: 6000, link: 'https://www.alza.cz/amd-ryzen-7-7700-d7612606.htm?o=1', power: 65 },
  MB: { name: 'MSI MAG B850 TOMAHAWK WIFI', price: 5500, link: 'https://www.alza.cz/msi-mag-b850-tomahawk-wifi-d13163989.htm?o=78', power: 0 },
  RAM: { name: 'Patriot Viper Venom 32GB KIT DDR5 6000MHz CL30', price: 2800, link: 'https://www.alza.cz/patriot-viper-venom-32gb-kit-ddr5-6000mhz-cl30-d12440050.htm?o=2', power: 0 },
  SSD: { name: 'Samsung 990 PRO 2TB', price: 4500, link: 'https://www.alza.cz/samsung-990-pro-2tb-d7516910.htm?o=1', power: 0 }
};

// 2. PEVNÉ ZDROJE PRO VÝPOČET
const psus = [
  { name: 'Seasonic Core GX-650 ATX 3.1', price: 2000, link: 'https://www.alza.cz/seasonic-core-gx-650-atx-3-2024-d12744103.htm?o=2', capacity: 650 },
  { name: 'Seasonic Focus GX-850 ATX 3.0', price: 3500, link: 'https://www.alza.cz/seasonic-focus-gx-850-atx-3-0-d7943936.htm', capacity: 850 },
  { name: 'Seasonic Vertex GX-1000 ATX 3.0', price: 5000, link: 'https://www.alza.cz/seasonic-vertex-gx-1000-d7600109.htm', capacity: 1000 }
];

// 3. PEVNÝ KATALOG UPGRADŮ PRO DRAŽŠÍ SESTAVY
const upgrades = {
  GPU: [
    { name: 'GIGABYTE GeForce RTX 5090 GAMING OC 32G', price: 55000, link: 'https://www.alza.cz/graficke-karty-nvidia-geforce-rtx-5090/18810049.htm', power: 500 },
    { name: 'GIGABYTE GeForce RTX 5080 GAMING OC 16G', price: 32000, link: 'https://www.alza.cz/graficke-karty-nvidia-geforce-rtx-5080/18810050.htm', power: 320 }
  ],
  CPU: [
    { name: 'AMD Ryzen 7 9800X3D', price: 13000, link: 'https://www.alza.cz/amd-ryzen-7-9800x3d-d12666752.htm', power: 120 }
  ],
  MB: [
    { name: 'MSI MPG X870E CARBON WIFI', price: 11500, link: 'https://www.alza.cz/msi-mpg-x870e-carbon-wifi-d12548842.htm', power: 0 }
  ],
  RAM: [
    { name: 'Patriot Viper Venom 64GB KIT DDR5 6000MHz CL30', price: 5500, link: 'https://www.alza.cz/patriot-viper-venom-64gb-kit-ddr5-6000mhz-cl30-d12440051.htm', power: 0 }
  ]
};

// Pomocná funkce na výpočet ceny rozdělané sestavy
function getCost(build) {
  const reqPwr = build.CPU.power + build.GPU.power + 100;
  let psu = psus[0];
  if (reqPwr > 850) psu = psus[2];
  else if (reqPwr > 650) psu = psus[1];
  
  return build.GPU.price + build.CPU.price + build.MB.price + build.RAM.price + build.SSD.price + psu.price;
}

export async function POST(req) {
  try {
    const { budget } = await req.json();
    const budgetNum = Number(budget);

    // 1. VEZMEME TVŮJ PEVNÝ ZÁKLAD
    let bestBuild = { ...baseBuild };

    // 2. KASKÁDOVÝ UPGRADE (Obyčejná matematika)
    // Upgrade GPU
    for (const gpu of upgrades.GPU) {
      if (getCost({ ...bestBuild, GPU: gpu }) <= budgetNum) {
        bestBuild.GPU = gpu;
        break;
      }
    }

    // Upgrade CPU
    for (const cpu of upgrades.CPU) {
      if (getCost({ ...bestBuild, CPU: cpu }) <= budgetNum) {
        bestBuild.CPU = cpu;
        break;
      }
    }

    // Upgrade Desky
    for (const mb of upgrades.MB) {
      if (getCost({ ...bestBuild, MB: mb }) <= budgetNum) {
        bestBuild.MB = mb;
        break;
      }
    }

    // Upgrade RAM
    for (const ram of upgrades.RAM) {
      if (getCost({ ...bestBuild, RAM: ram }) <= budgetNum) {
        bestBuild.RAM = ram;
        break;
      }
    }

    // 3. VÝPOČET FINÁLNÍHO ZDROJE (TDP + TGP + 100W)
    const reqPwr = bestBuild.CPU.power + bestBuild.GPU.power + 100;
    let finalPsu = psus[0];
    if (reqPwr > 850) finalPsu = psus[2];
    else if (reqPwr > 650) finalPsu = psus[1];
    
    bestBuild.PSU = finalPsu;
    const finalTotal = getCost(bestBuild);

    const componentsArray = [
      { part: "GPU", name: bestBuild.GPU.name, price: bestBuild.GPU.price, link: bestBuild.GPU.link },
      { part: "CPU", name: bestBuild.CPU.name, price: bestBuild.CPU.price, link: bestBuild.CPU.link },
      { part: "Motherboard", name: bestBuild.MB.name, price: bestBuild.MB.price, link: bestBuild.MB.link },
      { part: "RAM", name: bestBuild.RAM.name, price: bestBuild.RAM.price, link: bestBuild.RAM.link },
      { part: "SSD", name: bestBuild.SSD.name, price: bestBuild.SSD.price, link: bestBuild.SSD.link },
      { part: "PSU", name: bestBuild.PSU.name, price: bestBuild.PSU.price, link: bestBuild.PSU.link }
    ];

    // AI JEN PÍŠE KECY NA KONEC
    const prompt = `
      Napiš max 2 úderné věty o PC sestavě, která má ${bestBuild.GPU.name} a ${bestBuild.CPU.name}.
      Styl: The Hardware Guru.
    `;

    const aiRes = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }]
    });

    const explanation = aiRes.choices[0].message.content.trim();

    // ULOŽENÍ
    const slug = `guru-sestava-${budget}-${Date.now()}`;
    const { error } = await supabase.from('sestavy').insert([{
      title: `Guru Herní Mašina za ${finalTotal.toLocaleString()} Kč`,
      description: "Ověřený výběr komponent The Hardware Guru.",
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
