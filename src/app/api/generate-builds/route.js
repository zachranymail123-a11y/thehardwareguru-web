export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Přepnuto na NÁKUPY s chytrou logikou hledání NEJLEVNĚJŠÍ ceny
async function fetchRealPrices(query) {
  try {
    const response = await fetch("https://google.serper.dev/shopping", {
      method: "POST",
      headers: { "X-API-KEY": process.env.SERPER_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ q: query, gl: "cz", hl: "cs" }),
      cache: 'no-store'
    });
    const data = await response.json();
    
    if (data.shopping && data.shopping.length > 0) {
      // Vytáhneme všechny položky, očistíme cenu na čisté číslo a vyfiltrujeme blbosti (pod 500 Kč)
      const items = data.shopping.map(item => {
        const priceStr = item.price ? item.price.toString() : "0";
        // Odstraní desetinné čárky a nechá jen holé číslo (např. z "5 690,00 Kč" udělá 5690)
        const priceNum = parseInt(priceStr.split(',')[0].replace(/[^\d]/g, ''), 10) || 0;
        return { title: item.title, priceNum };
      }).filter(item => item.priceNum > 500);

      // Seřadíme od NEJLEVNĚJŠÍHO
      items.sort((a, b) => a.priceNum - b.priceNum);

      // Pošleme AI ty absolutně nejlevnější 3 varianty, co na trhu jsou
      if (items.length > 0) {
        return items.slice(0, 3).map(item => `${item.title}: ${item.priceNum} Kč`).join(" | ");
      }
    }
    return "Cena nenalezena";
  } catch (e) { 
    return "Chyba API"; 
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('secret') !== 'Wifik500') return new Response('Unauthorized', { status: 401 });

  try {
    // 1. Získáme přesná čísla pro přesné komponenty včetně KC3000
    const [cpuBudget, cpuMid, gpu5070, gpu5070Ti, gpu9070XT, ramPrice, mbPrice, ssdPrice] = await Promise.all([
      fetchRealPrices("AMD Ryzen 7 7700X procesor"),
      fetchRealPrices("AMD Ryzen 7 9800X3D procesor"),
      fetchRealPrices("NVIDIA GeForce RTX 5070 grafická karta"),
      fetchRealPrices("NVIDIA GeForce RTX 5070 Ti grafická karta"),
      fetchRealPrices("AMD Radeon RX 9070 XT grafická karta"),
      fetchRealPrices("Kingston Fury Beast DDR5 32GB 6000MHz CL30 2x16GB"),
      fetchRealPrices("Gigabyte X870E AORUS ELITE WIFI7"),
      fetchRealPrices("Kingston KC3000 2048GB SSD")
    ]);

    const GURU_FINAL_PROMPT = `
      Jsi "The Hardware Guru". MÁŠ ZAKÁZÁNO POČÍTAT SOUČTY A VYMÝŠLET SI CENY U RAM, DESKY A SSD. 

      ŽIVÉ CENY Z TRHU (Seřazeno od nejlevnějších, vždy POUŽIJ TU NEJNIŽŠÍ CENU!):
      - Ryzen 7 7700X: ${cpuBudget}
      - Ryzen 7 9800X3D: ${cpuMid}
      - RTX 5070: ${gpu5070}
      - RTX 5070 Ti: ${gpu5070Ti}
      - RX 9070 XT: ${gpu9070XT}
      - RAM (Kingston): ${ramPrice}
      - Motherboard (Gigabyte): ${mbPrice}
      - SSD (Kingston KC3000): ${ssdPrice}

      TVÉ 3 SESTAVY:
      1. "Budget Beast" (7700X, RTX 5070)
      2. "Mid-range Master RTX" (9800X3D, RTX 5070 Ti)
      3. "Mid-range Master Radeon" (9800X3D, RX 9070 XT)

      PRAVIDLA PRO JSON:
      - U položky "price" použij VŽDY JEN ČÍSLO.
      - Ostatní díly (zdroj, chladič, case) ohodnoť logickou aktuální tržní cenou.
      - V názvech vypisuj celé jméno, nikdy nepoužívej tři tečky.

      VRAŤ PŘESNĚ TENTO JSON FORMÁT:
      {
        "builds": [
          {
            "name": "Celý Název Sestavy",
            "components": {
              "cpu": {"name": "Celý název procesoru", "price": 10000},
              "gpu": {"name": "Celý název grafiky", "price": 15000},
              "ram": {"name": "Kingston", "price": 3000},
              "motherboard": {"name": "Gigabyte", "price": 7000},
              "storage": {"name": "Kingston SSD", "price": 3500},
              "psu": {"name": "Seasonic Focus GX 850W", "price": 3000},
              "cooler": {"name": "Arctic Liquid Freezer III 360", "price": 2000},
              "case_name": {"name": "Lian Li Lancool 216", "price": 2500}
            }
          }
        ]
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: GURU_FINAL_PROMPT }],
      temperature: 0,
      response_format: { type: "json_object" }
    });

    const data = JSON.parse(completion.choices[0].message.content);
    const buildsArray = data.builds || [];

    const FIXED_IDS = {
      budget: "11111111-1111-1111-1111-111111111111",
      rtx: "22222222-2222-2222-2222-222222222222",
      radeon: "33333333-3333-3333-3333-333333333333"
    };

    const finalBuilds = buildsArray.map(b => {
      let targetId = "44444444-4444-4444-4444-444444444444";
      if (b.name.includes("Budget")) targetId = FIXED_IDS.budget;
      else if (b.name.includes("RTX")) targetId = FIXED_IDS.rtx;
      else if (b.name.includes("Radeon")) targetId = FIXED_IDS.radeon;

      const c = b.components || {};

      const pCpu = (c.cpu && typeof c.cpu.price === 'number') ? c.cpu.price : 5000;
      const pGpu = (c.gpu && typeof c.gpu.price === 'number') ? c.gpu.price : 15000;
      const pRam = (c.ram && typeof c.ram.price === 'number') ? c.ram.price : 3200;
      const pMb = (c.motherboard && typeof c.motherboard.price === 'number') ? c.motherboard.price : 7500;
      const pStorage = (c.storage && typeof c.storage.price === 'number') ? c.storage.price : 3500;
      const pPsu = (c.psu && typeof c.psu.price === 'number') ? c.psu.price : 2500;
      const pCooler = (c.cooler && typeof c.cooler.price === 'number') ? c.cooler.price : 2000;
      const pCase = (c.case_name && typeof c.case_name.price === 'number') ? c.case_name.price : 2500;

      // Součet a zaokrouhlení na nejbližších 5000 Kč nahoru
      const totalSum = pCpu + pGpu + pRam + pMb + pStorage + pPsu + pCooler + pCase;
      const roundedSum = Math.ceil(totalSum / 5000) * 5000;

      const formatComp = (name, price) => `${name} (${price.toLocaleString('cs-CZ')} Kč)`;
      const getName = (obj, def) => (obj && obj.name) ? obj.name : def;

      const cleanDescription = "Když chce někdo levnější custom sestavu, ať dá Subscribe na Kick streamu a následně to pořešíme na Discordu. Realizace probíhá jako hobby projekt.";

      return {
        id: targetId,
        name: b.name,
        price_range: `Orientační cena: ${roundedSum.toLocaleString('cs-CZ')} Kč`,
        cpu: formatComp(getName(c.cpu, "AMD CPU"), pCpu),
        gpu: formatComp(getName(c.gpu, "GPU"), pGpu),
        
        // 🔥 TVRDÉ ZÁMKY HW
        ram: formatComp("Kingston Fury Beast DDR5 32GB 6000MHz CL30 (2x16GB)", pRam), 
        motherboard: formatComp("Gigabyte X870E AORUS ELITE WIFI7", pMb),
        storage: formatComp("Kingston KC3000 2048GB", pStorage),
        
        psu: formatComp(getName(c.psu, "Seasonic 850W Gold PSU"), pPsu),
        cooler: formatComp(getName(c.cooler, "Chladič"), pCooler),
        case_name: formatComp(getName(c.case_name, "PC Skříň"), pCase),
        description: cleanDescription,
        active: true,
        updated_at: new Date().toISOString()
      };
    });

    const { error: upsertError } = await supabase.from('pc_builds').upsert(finalBuilds);
    if (upsertError) throw upsertError;

    return new Response(JSON.stringify({ message: "GURU UPDATE: Inteligentní vyhledávání NEJLEVNĚJŠÍCH cen nasazeno!", count: finalBuilds.length }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
