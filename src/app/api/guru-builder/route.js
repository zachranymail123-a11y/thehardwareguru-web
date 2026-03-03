import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 1. TVOJE DEFINICE KOMPONENT (ZÁKLAD I UPGRADY)
const COMPONENTS = {
  base: {
    CPU: { name: 'AMD Ryzen 7 7700', url: 'https://www.alza.cz/amd-ryzen-7-7700-d7612606.htm?o=1', tdp: 65 },
    GPU: { name: 'GIGABYTE GeForce RTX 5070 EAGLE OC 12G', url: 'https://www.alza.cz/gigabyte-geforce-rtx-5070-eagle-oc-12g-d12815107.htm?o=6', tgp: 250 },
    MB: { name: 'MSI MAG B850 TOMAHAWK WIFI', url: 'https://www.alza.cz/msi-mag-b850-tomahawk-wifi-d13163989.htm?o=78' },
    RAM: { name: 'Patriot Viper Venom 32GB KIT DDR5 6000MHz CL30', url: 'https://www.alza.cz/patriot-viper-venom-32gb-kit-ddr5-6000mhz-cl30-d12440050.htm?o=2' },
    SSD: { name: 'Samsung 990 PRO 2TB', url: 'https://www.alza.cz/samsung-990-pro-2tb-d7516910.htm?o=1' },
    PSU: { name: 'Seasonic Core GX-650 ATX 3.1', url: 'https://www.alza.cz/seasonic-core-gx-650-atx-3-2024-d12744103.htm?o=2', cap: 650 }
  },
  upgrades: {
    GPU_5080: { name: 'GIGABYTE GeForce RTX 5080 GAMING OC 16G', url: 'https://www.alza.cz/graficke-karty-nvidia-geforce-rtx-5080/18810050.htm', tgp: 320 },
    GPU_5090: { name: 'GIGABYTE GeForce RTX 5090 GAMING OC 32G', url: 'https://www.alza.cz/graficke-karty-nvidia-geforce-rtx-5090/18810049.htm', tgp: 500 },
    CPU_9800: { name: 'AMD Ryzen 7 9800X3D', url: 'https://www.alza.cz/amd-ryzen-7-9800x3d-d12666752.htm', tdp: 120 },
    MB_X870: { name: 'MSI MPG X870E CARBON WIFI', url: 'https://www.alza.cz/msi-mpg-x870e-carbon-wifi-d12548842.htm' },
    RAM_64: { name: 'Patriot Viper Venom 64GB KIT DDR5 6000MHz CL30', url: 'https://www.alza.cz/patriot-viper-venom-64gb-kit-ddr5-6000mhz-cl30-d12440051.htm' },
    PSU_850: { name: 'Seasonic Focus GX-850 ATX 3.0', url: 'https://www.alza.cz/seasonic-focus-gx-850-atx-3-0-d7943936.htm', cap: 850 },
    PSU_1000: { name: 'Seasonic Vertex GX-1000 ATX 3.0', url: 'https://www.alza.cz/seasonic-vertex-gx-1000-d7600109.htm', cap: 1000 }
  }
};

// FUNKCE PRO ZÍSKÁNÍ CENY PŘÍMO Z ALZY PŘES SCRAPERAPI (Tahá API KEY z Vercelu)
async function getLivePrice(url) {
  try {
    const apiKey = process.env.SCRAPER_API_KEY; // TADY TO TAHÁ TU VARIABLE
    if (!apiKey) throw new Error("SCRAPER_API_KEY chybí ve Vercelu!");

    const scraperUrl = `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(url)}&render=false`;
    const response = await fetch(scraperUrl);
    const html = await response.text();
    
    // Čistý Regex, který hledá číslo před Kč v HTML kódu
    const match = html.match(/(\d{1,3}(?:\s\d{3})*)\s*(?:Kč|,-)/);
    if (match) {
      const price = parseInt(match[1].replace(/\s/g, ''), 10);
      if (price > 1000) return price;
    }
    return null;
  } catch (e) {
    console.error(`Chyba u URL ${url}:`, e);
    return null;
  }
}

export async function POST(req) {
  try {
    const { budget } = await req.json();
    const budgetNum = Number(budget);

    // 1. ZÍSKÁNÍ ŽIVÝCH CEN (Paralelně)
    const pricePromises = {
      baseGPU: getLivePrice(COMPONENTS.base.GPU.url),
      baseCPU: getLivePrice(COMPONENTS.base.CPU.url),
      baseMB: getLivePrice(COMPONENTS.base.MB.url),
      baseRAM: getLivePrice(COMPONENTS.base.RAM.url),
      baseSSD: getLivePrice(COMPONENTS.base.SSD.url),
      basePSU: getLivePrice(COMPONENTS.base.PSU.url),
      upGPU80: getLivePrice(COMPONENTS.upgrades.GPU_5080.url),
      upGPU90: getLivePrice(COMPONENTS.upgrades.GPU_5090.url),
      upCPU: getLivePrice(COMPONENTS.upgrades.CPU_9800.url),
      upMB: getLivePrice(COMPONENTS.upgrades.MB_X870.url),
      upRAM: getLivePrice(COMPONENTS.upgrades.RAM_64.url),
      upPSU850: getLivePrice(COMPONENTS.upgrades.PSU_850.url),
      upPSU1000: getLivePrice(COMPONENTS.upgrades.PSU_1000.url)
    };

    const prices = {};
    for (const [key, promise] of Object.entries(pricePromises)) {
      prices[key] = await promise;
    }

    // Fallbacky, kdyby ScraperAPI selhalo (přibližné ceny)
    const p = (key, fallback) => prices[key] || fallback;

    // 2. STAVBA PC PODLE TVÉ LOGIKY
    let build = { ...COMPONENTS.base };
    let currentTotal = p('baseGPU', 16500) + p('baseCPU', 6000) + p('baseMB', 5500) + p('baseRAM', 2800) + p('baseSSD', 4500);

    // Upgrade 1: GPU
    if (currentTotal - p('baseGPU', 16500) + p('upGPU90', 55000) + p('upPSU1000', 5000) <= budgetNum) {
      build.GPU = COMPONENTS.upgrades.GPU_5090;
      currentTotal = currentTotal - p('baseGPU', 16500) + p('upGPU90', 55000);
    } else if (currentTotal - p('baseGPU', 16500) + p('upGPU80', 32000) + p('upPSU850', 3500) <= budgetNum) {
      build.GPU = COMPONENTS.upgrades.GPU_5080;
      currentTotal = currentTotal - p('baseGPU', 16500) + p('upGPU80', 32000);
    }

    // Upgrade 2: CPU
    if (currentTotal - p('baseCPU', 6000) + p('upCPU', 13000) <= budgetNum - 2000) {
      build.CPU = COMPONENTS.upgrades.CPU_9800;
      currentTotal = currentTotal - p('baseCPU', 6000) + p('upCPU', 13000);
    }

    // Upgrade 3: MB
    if (currentTotal - p('baseMB', 5500) + p('upMB', 11500) <= budgetNum - 2000) {
      build.MB = COMPONENTS.upgrades.MB_X870;
      currentTotal = currentTotal - p('baseMB', 5500) + p('upMB', 11500);
    }

    // Upgrade 4: RAM
    if (currentTotal - p('baseRAM', 2800) + p('upRAM', 5500) <= budgetNum - 2000) {
      build.RAM = COMPONENTS.upgrades.RAM_64;
      currentTotal = currentTotal - p('baseRAM', 2800) + p('upRAM', 5500);
    }

    // 3. VÝPOČET ZDROJE (TDP + TGP + 100W)
    const reqPwr = (build.CPU.tdp || 65) + (build.GPU.tgp || 250) + 100;
    let finalPSU = COMPONENTS.base.PSU;
    let psuPrice = p('basePSU', 2000);

    if (reqPwr > 850) {
      finalPSU = COMPONENTS.upgrades.PSU_1000;
      psuPrice = p('upPSU1000', 5000);
    } else if (reqPwr > 650) {
      finalPSU = COMPONENTS.upgrades.PSU_850;
      psuPrice = p('upPSU850', 3500);
    }

    const finalTotal = currentTotal + psuPrice;

    // 4. PŘÍPRAVA PRO DB
    const componentsArray = [
      { part: "GPU", name: build.GPU.name, price: build.GPU.tgp === 500 ? p('upGPU90', 55000) : (build.GPU.tgp === 320 ? p('upGPU80', 32000) : p('baseGPU', 16500)), link: build.GPU.url },
      { part: "CPU", name: build.CPU.name, price: build.CPU.tdp === 120 ? p('upCPU', 13000) : p('baseCPU', 6000), link: build.CPU.url },
      { part: "Motherboard", name: build.MB.name, price: build.MB.name.includes('X870') ? p('upMB', 11500) : p('baseMB', 5500), link: build.MB.url },
      { part: "RAM", name: build.RAM.name, price: build.RAM.name.includes('64GB') ? p('upRAM', 5500) : p('baseRAM', 2800), link: build.RAM.url },
      { part: "SSD", name: COMPONENTS.base.SSD.name, price: p('baseSSD', 4500), link: COMPONENTS.base.SSD.url },
      { part: "PSU", name: finalPSU.name, price: psuPrice, link: finalPSU.url }
    ];

    const slug = `guru-sestava-${budget}-${Date.now()}`;
    await supabase.from('sestavy').insert([{
      title: `Guru Herní Mašina za ${finalTotal.toLocaleString()} Kč`,
      budget: budget,
      components: componentsArray,
      total_price: finalTotal,
      content: "Sestava vypočítaná podle striktní logiky Guru s ohledem na TGP a TDP.",
      slug: slug,
      image_url: "https://i.postimg.cc/QdWxszv3/bg-guru.png"
    }]);

    return NextResponse.json({ success: true, url: `/sestavy/${slug}` });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
