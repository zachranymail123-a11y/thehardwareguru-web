export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Přepnuto na NÁKUPY (Shopping API) - Živé e-shopové ceny
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
      return data.shopping.slice(0, 2).map(item => `${item.title}: ${item.price} Kč`).join(" | ");
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
    // 1. Získáme ŽIVÁ čísla z nákupů včetně RAM
    const [cpuBudget, cpuMid, gpu5070, gpu5070Ti, gpu9070XT, ramPrice] = await Promise.all([
      fetchRealPrices("AMD Ryzen 7 7700X procesor"),
      fetchRealPrices("AMD Ryzen 7 9800X3D procesor"),
      fetchRealPrices("NVIDIA GeForce RTX 5070 grafická karta"),
      fetchRealPrices("NVIDIA GeForce RTX 5070 Ti grafická karta"),
      fetchRealPrices("AMD Radeon RX 9070 XT grafická karta"),
      fetchRealPrices("32GB DDR5 6000MHz CL30") // Vyhledá přesně tvoji RAM
    ]);

    const GURU_FINAL_PROMPT = `
      Jsi "The Hardware Guru". 
      MÁŠ ZAKÁZÁNO POČÍTAT SOUČTY. TO UDĚLÁ MUJ SKRIPT. Tvojí jedinou prací je vypsat komponenty a přiřadit k nim cenu jako HOLÉ ČÍSLO.

      ŽIVÉ CENY Z TRHU (Použij tyto jako základ):
      - Ryzen 7 7700X: ${cpuBudget}
      - Ryzen 7 9800X3D: ${cpuMid}
      - RTX 5070: ${gpu5070}
      - RTX 5070 Ti: ${gpu5070Ti}
      - RX 9070 XT: ${gpu9070XT}
      - RAM: ${ramPrice}

      TVÉ 3 SESTAVY:
      1. "Budget Beast" (7700X, RTX 5070, B850)
      2. "Mid-range Master RTX" (9800X3D, RTX 5070 Ti, X870)
      3. "Mid-range Master Radeon" (9800X3D, RX 9070 XT, X870E AORUS MASTER)

      PRAVIDLA:
      - U položky "price" použij VŽDY JEN ČÍSLO (např. 14590, bez "Kč" a mezer).
      - Pokud nemáš cenu z dat nahoře (např. pro desku nebo zdroj), odhadni reálnou dnešní cenu jako číslo.

      VRAŤ PŘESNĚ TENTO JSON FORMÁT (dodrž přesně tuto strukturu objektů!):
      {
        "builds": [
          {
            "name": "Název sestavy",
            "components": {
              "cpu": {"name": "AMD Ryzen...", "price": 10000},
              "gpu": {"name": "RTX...", "price": 15000},
              "ram": {"name": "32GB DDR5", "price": 3500},
              "motherboard": {"name": "Deska...", "price": 4000},
              "storage": {"name": "512GB + 2TB NVMe", "price": 5000},
              "psu": {"name": "Seasonic Gold...", "price": 2500},
              "cooler": {"name": "Chladič...", "price": 2000},
              "case_name": {"name": "Skříň...", "price": 2500}
            },
            "description": "Kdyz chce někdo levnejsi custom sestavu tak Subscribe na [Kick streamu](https://kick.com/thehardwareguru) a naslesně na [Discordu](https://discord.com/invite/n7xThr8) to doresime samozrejme. Realizace probíhá jako hobby projekt."
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

    // 🔥 TVRDÁ IDčka - Tímhle obejdeme ten blok v Supabase. Sestavy se budou vždy jen PŘEPISOVAT na tyto 3 pozice.
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

      // Získáme čistá čísla z AI. Pokud AI udělá chybu a vynechá cenu, dáme záchrannou hodnotu.
      const pCpu = (c.cpu && typeof c.cpu.price === 'number') ? c.cpu.price : 5000;
      const pGpu = (c.gpu && typeof c.gpu.price === 'number') ? c.gpu.price : 15000;
      const pRam = (c.ram && typeof c.ram.price === 'number') ? c.ram.price : 3500;
      const pMb = (c.motherboard && typeof c.motherboard.price === 'number') ? c.motherboard.price : 4000;
      const pStorage = (c.storage && typeof c.storage.price === 'number') ? c.storage.price : 4500;
      const pPsu = (c.psu && typeof c.psu.price === 'number') ? c.psu.price : 2500;
      const pCooler = (c.cooler && typeof c.cooler.price === 'number') ? c.cooler.price : 2000;
      const pCase = (c.case_name && typeof c.case_name.price === 'number') ? c.case_name.price : 2500;

      // 🔥 MATEMATIKU DĚLÁ JAVASCRIPT: Sečteme to na halíř přesně
      const totalSum = pCpu + pGpu + pRam + pMb + pStorage + pPsu + pCooler + pCase;

      // Funkce pro složení textu "Název (14 590 Kč)"
      const formatComp = (name, price) => `${name} (${price.toLocaleString('cs-CZ')} Kč)`;
      const getName = (obj, def) => (obj && obj.name) ? obj.name : def;

      return {
        id: targetId,
        name: b.name,
        price_range: `${totalSum.toLocaleString('cs-CZ')} Kč`,
        cpu: formatComp(getName(c.cpu, "AMD CPU"), pCpu),
        gpu: formatComp(getName(c.gpu, "GPU"), pGpu),
        
        // 🔥 TVRDÁ POJISTKA PRO RAM: AI to textově už NIKDY nezmění, doplní se jen cena
        ram: formatComp("32GB DDR5 6000MHz CL30", pRam), 
        
        motherboard: formatComp(getName(c.motherboard, "AM5 Motherboard"), pMb),
        storage: formatComp(getName(c.storage, "512GB + 2TB NVMe"), pStorage),
        psu: formatComp(getName(c.psu, "Seasonic Gold PSU"), pPsu),
        cooler: formatComp(getName(c.cooler, "Cooler"), pCool
