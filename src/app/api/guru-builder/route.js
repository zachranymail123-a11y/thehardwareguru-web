import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 1. TVOJE PEVNÁ MINIMÁLNÍ SESTAVA (Přesné ceny a odkazy od tebe)
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
    { name: 'GIGABYTE GeForce RTX 5080 GAMING OC 16G', price: 32000, link: 'https://www.alza.cz/graficke-karty-nvidia-geforce-rtx-5080/18810050.htm', power: 320 },
    { name: 'GIGABYTE GeForce RTX 5090 GAMING OC 32G', price: 55000, link: 'https://www.alza.cz/graficke-karty-nvidia-geforce-rtx-5090/18810049.htm', power: 500 }
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

export async function POST(req) {
  try {
    const { budget } = await req.json();
    const budgetNum = Number(budget);

    // Načteme tvůj pevný základ
    let currentBuild = { ...baseBuild };
    let currentTotal = currentBuild.GPU.price + currentBuild.CPU.price + currentBuild.MB.price + currentBuild.RAM.price + currentBuild.SSD.price;
    
    // Rozpočet mínus to, co už máme v košíku a mínus cena nejlevnějšího zdroje
    let budgetLeft = budgetNum - (currentTotal + psus[0].price);

    // KASKÁDOVÝ UPGRADE (PŘESNĚ TVOJE POŘADÍ)
    
    // 1. GRAFIKA
    for (let i = upgrades.GPU.length - 1; i >= 0; i--) {
      let costDiff = upgrades.GPU[i].price - baseBuild.GPU.price;
      if (budgetLeft >= costDiff) {
        currentBuild.GPU = upgrades.GPU[i];
        budgetLeft -= costDiff;
        break; // Vybere nejlepší možnou na kterou má a jde dál
      }
    }

    // 2. PROCESOR
    for (let i = upgrades.CPU.length - 1; i >= 0; i--) {
      let costDiff = upgrades.CPU[i].price - baseBuild.CPU.price;
      if (budgetLeft >= costDiff) {
        currentBuild.CPU = upgrades.CPU[i];
        budgetLeft -= costDiff;
        break;
      }
    }

    // 3. ZÁKLADNÍ DESKA
    for (let i = upgrades.MB.length - 1; i >= 0; i--) {
      let costDiff = upgrades.MB[i].price - baseBuild.MB.price;
      if (budgetLeft >= costDiff) {
        currentBuild.MB = upgrades.MB[i];
        budgetLeft -= costDiff;
        break;
      }
    }

    // 4. PAMĚTI (KAPACITA)
    for (let i = upgrades.RAM.length - 1; i >= 0; i--) {
      let costDiff = upgrades.RAM[i].price - baseBuild.RAM.price;
      if (budgetLeft >= costDiff) {
        currentBuild.RAM = upgrades.RAM[i];
        budgetLeft -= costDiff;
        break;
      }
    }

    // 5. VÝPOČET ZDROJE (Max TDP CPU + Max TGP GPU + 100W)
    const requiredPower = currentBuild.CPU.power + currentBuild.GPU.power + 100;
    let selectedPSU = psus[0]; // Výchozí 650W

    if (requiredPower > 850) {
      selectedPSU = psus[2]; // 1000W
    } else if (requiredPower > 650) {
      selectedPSU = psus[1]; // 850W
    }
    
    currentBuild.PSU = selectedPSU;

    // KONEČNÝ SOUČET
    const finalTotal = currentBuild.GPU.price + currentBuild.CPU.price + currentBuild.MB.price + currentBuild.RAM.price + currentBuild.SSD.price + currentBuild.PSU.price;

    // PŘÍPRAVA PRO VÝPIS
    const componentsArray = [
      { part: "GPU", name: currentBuild.GPU.name, price: currentBuild.GPU.price, link: currentBuild.GPU.link },
      { part: "CPU", name: currentBuild.CPU.name, price: currentBuild.CPU.price, link: currentBuild.CPU.link },
      { part: "Motherboard", name: currentBuild.MB.name, price: currentBuild.MB.price, link: currentBuild.MB.link },
      { part: "RAM", name: currentBuild.RAM.name, price: currentBuild.RAM.price, link: currentBuild.RAM.link },
      { part: "SSD", name: currentBuild.SSD.name, price: currentBuild.SSD.price, link: currentBuild.SSD.link },
      { part: "PSU", name: currentBuild.PSU.name, price: currentBuild.PSU.price, link: currentBuild.PSU.link }
    ];

    // AI JEN GENERUJE KOMENTÁŘ NA ZÁKLADĚ HOTOVÉ SESTAVY
    const prompt = `
      Napiš krátký, úderný komentář (max 2 věty) pro hotovou herní PC sestavu.
      Vybrali jsme: ${currentBuild.GPU.name} a ${currentBuild.CPU.name}.
      Napiš to sebevědomě ve stylu "The Hardware Guru".
      Vrať pouze čistý text.
    `;

    const aiRes = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }]
    });

    const explanation = aiRes.choices[0].message.content.trim();

    // ULOŽENÍ DO SUPABASE
    const slug = `guru-sestava-${budget}-${Date.now()}`;
    const { data, error } = await supabase.from('sestavy').insert([{
      title: `Guru Herní Mašina za ${finalTotal.toLocaleString()} Kč`,
      description: "Sestava striktně vygenerovaná od minimálního základu s logickými upgrady.",
      budget: budget,
      usage: "Gaming",
      components: componentsArray,
      content: explanation,
      total_price: finalTotal,
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
