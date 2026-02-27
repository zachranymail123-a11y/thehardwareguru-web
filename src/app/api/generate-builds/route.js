export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Funkce pro reálné hledání na Heurece (cache: 'no-store' zajistí, že to SKUTEČNĚ hledá vždy znovu)
async function fetchMarketPrices(query) {
  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: { "X-API-KEY": process.env.SERPER_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ q: query + " nejnižší cena site:heureka.cz", gl: "cz", hl: "cs" }),
      cache: 'no-store' // TOTO ZABRÁNÍ RYCHLÉMU FAKE NAČTENÍ Z PAMĚTI!
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
    // 1. Skutečně počkáme, než Serper prohledá Heureku
    const [liveBudget, liveRTX, liveRadeon] = await Promise.all([
      fetchMarketPrices("AMD Ryzen 7 7700X RTX 5070 ASUS B850"),
      fetchMarketPrices("AMD Ryzen 7 9800X3D RTX 5070 Ti MSI X870"),
      fetchMarketPrices("AMD Ryzen 7 9800X3D Radeon RX 9070 XT Gigabyte X870E AORUS MASTER")
    ]);

    const GURU_FINAL_PROMPT = `
      Jsi "The Hardware Guru". Tvým jediným úkolem je vzít data z trhu a přesně je přepsat do JSONu. ŽÁDNÉ VYMÝŠLENÍ CEN!

      DATA Z TRHU (Heureka úryvky - najdi v nich aktuální ceny):
      - Budget: ${liveBudget}
      - RTX: ${liveRTX}
      - Radeon: ${liveRadeon}

      SESTAVY (DODRŽET HARDWARE):
      1. "Budget Beast": CPU AMD Ryzen 7 7700X, GPU RTX 5070, MB B850.
      2. "Mid-range Master RTX": CPU AMD Ryzen 7 9800X3D, GPU RTX 5070 Ti, MB X870.
      3. "Mid-range Master Radeon": CPU AMD Ryzen 7 9800X3D, GPU RX 9070 XT, MB X870E AORUS MASTER.

      KRITICKÁ PRAVIDLA PRO CENY A KOMPONENTY:
      1. RAM VŽDY: "32GB DDR5 6000MHz CL30" (za žádných okolností nedávej 5600!).
      2. Do každého pole (cpu, gpu, motherboard, storage, psu, cooler, case_name) MUSÍŠ NAPSAT NÁZEV A HNED VEDLE DO ZÁVORKY CENU, kterou jsi vyčetl z "DATA Z TRHU". Příklad: "AMD Ryzen 7 9800X3D (14 590 Kč)".
      3. Klíč "price_range" MUSÍ BÝT MATEMATICKÝ SOUČET všech cen z dané sestavy. Pokud v datech ze Serperu cenu nenajdeš, použij logický aktuální odhad, ale VŽDY ji napiš do závorky k dílu a sečti.

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

    const cleanBuilds = buildsArray.map(b => ({
      name: b.name,
      price_range: b.price_range,
      cpu: b.cpu,
      gpu: b.gpu,
      ram: b.ram,
      motherboard: b.motherboard,
      storage: b.storage,
      psu: b.psu,
      cooler: b.cooler,
      case_name: b.case_name,
      description: b.description,
      active: true,
      updated_at: new Date().toISOString()
    }));

    // 🔥 NEJDRSNĚJŠÍ METODA MAZÁNÍ (Cílená likvidace podle ID)
    // 1. Najdeme všechna existující ID v tabulce
    const { data: existingBuilds, error: selectError } = await supabase.from('pc_builds').select('id');
    if (selectError) throw new Error("Chyba při načítání starých sestav: " + selectError.message);

    // 2. Pokud tam nějaké jsou, smažeme je konkrétně přes pole IDček
    if (existingBuilds && existingBuilds.length > 0) {
      const idsToDelete = existingBuilds.map(b => b.id);
      const { error: deleteError } = await supabase.from('pc_builds').delete().in('id', idsToDelete);
      if (deleteError) throw new Error("Smazání selhalo: " + deleteError.message);
    }

    // 🔥 Vložení 3 nových čistých sestav
    const { error: insertError } = await supabase.from('pc_builds').insert(cleanBuilds);
    if (insertError) throw insertError;

    return new Response(JSON.stringify({ message: "GURU KODEX AKTUALIZOVÁN! Hledání proběhlo živě.", count: cleanBuilds.length }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
