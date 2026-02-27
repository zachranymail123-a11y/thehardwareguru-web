export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Přesnější hledání, které cílí výhradně na Heureku
async function fetchMarketPrices(query) {
  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: { "X-API-KEY": process.env.SERPER_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ q: query + " nejnižší cena site:heureka.cz", gl: "cz", hl: "cs" })
    });
    const data = await response.json();
    return data.organic?.slice(0, 3).map(res => res.snippet).join(" | ");
  } catch (e) { 
    return "Ceny nedostupné"; 
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('secret') !== 'Wifik500') return new Response('Unauthorized', { status: 401 });

  try {
    // 1. Získáme aktuální data
    const [liveBudget, liveRTX, liveRadeon] = await Promise.all([
      fetchMarketPrices("AMD Ryzen 7 7700X RTX 5070 ASUS B850"),
      fetchMarketPrices("AMD Ryzen 7 9800X3D RTX 5070 Ti MSI X870"),
      fetchMarketPrices("AMD Ryzen 7 9800X3D Radeon RX 9070 XT Gigabyte X870E AORUS MASTER")
    ]);

    const GURU_FINAL_PROMPT = `
      Jsi "The Hardware Guru". Vytvoř PŘESNĚ 3 PC sestavy (AM5).

      DATA Z HEUREKY (Vyber ty nejnižší a nejaktuálnější ceny pro únor 2026):
      - Budget: ${liveBudget}
      - RTX: ${liveRTX}
      - Radeon: ${liveRadeon}

      POŽADOVANÉ SESTAVY A KOMPONENTY:
      1. "Budget Beast": CPU AMD Ryzen 7 7700X, GPU RTX 5070, MB B850.
      2. "Mid-range Master RTX": CPU AMD Ryzen 7 9800X3D, GPU RTX 5070 Ti, MB X870.
      3. "Mid-range Master Radeon": CPU AMD Ryzen 7 9800X3D, GPU RX 9070 XT, MB X870E AORUS MASTER.

      KRITICKÁ PRAVIDLA PRO HW A CENY:
      - RAM: MUSÍ BÝT VŽDY "32GB DDR5 6000MHz CL30". Nikdy nepoužívej 5600MHz!
      - U KAŽDÉ komponenty (cpu, gpu, ram, motherboard, storage, psu, cooler, case_name) napiš do závorky její nejnižší aktuální cenu, kterou jsi našel z dat Heureky. 
      - Hodnota "price_range" MUSÍ BÝT PŘESNÝ MATEMATICKÝ SOUČET všech částek v závorkách!

      TEXT DO DESCRIPTION (Kopíruj PŘESNĚ):
      "Kdyz chce někdo levnejsi custom sestavu tak Subscribe na [Kick streamu](https://kick.com/thehardwareguru) a naslesně na [Discordu](https://discord.com/invite/n7xThr8) to doresime samozrejme. Realizace probíhá jako hobby projekt."

      JSON STRUKTURA: {"builds": [{"name": "...", "price_range": "...", "cpu": "...", "gpu": "...", "ram": "...", "motherboard": "...", "storage": "...", "psu": "...", "cooler": "...", "case_name": "...", "description": "..."}]}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: GURU_FINAL_PROMPT }],
      temperature: 0,
      response_format: { type: "json_object" }
    });

    const data = JSON.parse(completion.choices[0].message.content);
    const buildsArray = data.builds || [];

    // Fallback s tvrdou pojistkou na 6000MHz
    const cleanBuilds = buildsArray.map(b => ({
      name: b.name || "Guru Sestava",
      price_range: b.price_range || "Aktualizuje se...",
      cpu: b.cpu || "AMD AM5",
      gpu: b.gpu || "RTX / Radeon",
      ram: "32GB DDR5 6000MHz CL30", // TADY JE TO NATVRDO, PŘEPÍŠE JAKÝKOLIV AI NESMYSL
      motherboard: b.motherboard || "AM5 Board",
      storage: b.storage || "512GB + 2TB NVMe",
      psu: b.psu || "Seasonic Gold",
      cooler: b.cooler || "AIO / Cooler",
      case_name: b.case_name || "ATX Case",
      description: "Kdyz chce někdo levnejsi custom sestavu tak Subscribe na [Kick streamu](https://kick.com/thehardwareguru) a naslesně na [Discordu](https://discord.com/invite/n7xThr8) to doresime samozrejme. Realizace probíhá jako hobby projekt.",
      active: true,
      updated_at: new Date().toISOString()
    }));

    // 🔥 SMAZÁNÍ STARÝCH SESTAV
    const { error: deleteError } = await supabase.from('pc_builds').delete().not('id', 'is', null);
    if (deleteError) throw new Error("Smazání selhalo: " + deleteError.message);

    // 🔥 VLOŽENÍ NOVÝCH
    const { error: insertError } = await supabase.from('pc_builds').insert(cleanBuilds);
    if (insertError) throw insertError;

    return new Response(JSON.stringify({ message: "GURU KODEX A CACHE OPRAVENY!", count: cleanBuilds.length }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
