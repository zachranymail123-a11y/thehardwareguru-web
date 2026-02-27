import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fetchMarketPrices(query) {
  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: { "X-API-KEY": process.env.SERPER_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ q: query + " cena Heureka", gl: "cz", hl: "cs" })
    });
    const data = await response.json();
    return data.organic?.slice(0, 3).map(res => res.snippet).join(" | ");
  } catch (e) { return "Ceny nedostupné"; }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('secret') !== 'Wifik500') return new Response('Unauthorized', { status: 401 });

  try {
    // Rychlý dotaz na Heureku
    const [liveBudget, liveRTX, liveRadeon] = await Promise.all([
      fetchMarketPrices("AMD Ryzen 7 7700X RTX 5070"),
      fetchMarketPrices("AMD Ryzen 7 9800X3D RTX 5070 Ti"),
      fetchMarketPrices("AMD Ryzen 7 9800X3D Radeon RX 9070 XT")
    ]);

    const GURU_FINAL_PROMPT = `
      Jsi "The Hardware Guru". Navrhni PŘESNĚ 3 sestavy (AM5 platforma).

      TVŮJ ZÁKLAD (POKUD SERPER NENAJDE LEPŠÍ DATA, POUŽIJ PŘESNĚ TYTO CENY):
      1. "Budget Beast" (~51 493 Kč): CPU AMD Ryzen 7 7700X (4990 Kč), GPU RTX 5070 (18590 Kč), MB B850 (4289 Kč), RAM 32GB (10990 Kč), SSD (1999+4690 Kč), PSU 650W (2299 Kč), Ostatní (~3646 Kč).
      2. "Mid-range Master RTX" (~73 872 Kč): CPU AMD Ryzen 7 9800X3D (14544 Kč), GPU RTX 5070 Ti (24990 Kč), MB X870 (6054 Kč), RAM 32GB (11690 Kč), SSD (1999+6231 Kč), PSU 750W (2805 Kč), Ostatní (~5559 Kč).
      3. "Mid-range Master Radeon" (~80 476 Kč): CPU AMD Ryzen 7 9800X3D (14590 Kč), GPU AMD Radeon RX 9070 XT (21700 Kč), MB X870E AORUS MASTER (11161 Kč), RAM 32GB (11790 Kč), SSD (1999+5499 Kč), PSU 850W (2525 Kč), Ostatní (~11212 Kč).

      DATA ZE SERPERU (Heureka):
      - Budget: ${liveBudget}
      - RTX: ${liveRTX}
      - Radeon: ${liveRadeon}
      (Pokud v těchto datech vidíš jinou aktuální cenu, uprav ten konkrétní díl a PŘEPOČÍTEJ CELKOVOU CENU. Jinak nech základ.)

      POVINNÝ TEXT DO DESCRIPTION (Vlož ho přesně takto, včetně Markdown odkazů!):
      "Kdyz chce někdo levnejsi custom sestavu tak Subscribe na [Kick streamu](https://kick.com/thehardwareguru) a naslesně na [Discordu](https://discord.com/invite/n7xThr8) to doresime samozrejme. Realizace probíhá jako hobby projekt."

      STRIKTNÍ PRAVIDLA:
      - Názvy, CPU (9800X3D pro Mid-range) a přesné odkazy musí být dodrženy.
      - JSON STRUKTURA: {"builds": [{"name": "...", "price_range": "...", "cpu": "...", "gpu": "...", "ram": "...", "motherboard": "...", "storage": "...", "psu": "...", "cooler": "...", "case_name": "...", "description": "..."}]}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: GURU_FINAL_PROMPT }],
      temperature: 0,
      response_format: { type: "json_object" }
    });

    const data = JSON.parse(completion.choices[0].message.content);
    const buildsArray = data.builds || [];

    const fallbackDescription = "Kdyz chce někdo levnejsi custom sestavu tak Subscribe na [Kick streamu](https://kick.com/thehardwareguru) a naslesně na [Discordu](https://discord.com/invite/n7xThr8) to doresime samozrejme. Realizace probíhá jako hobby projekt.";

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
      description: b.description || fallbackDescription,
      active: true,
      updated_at: new Date().toISOString()
    }));

    // 🔥 VRÁCENO MAZÁNÍ, KTERÉ FUNGOVALO: Smaže úplně všechny řádky
    const { error: deleteError } = await supabase.from('pc_builds').delete().not('id', 'is', null);
    if (deleteError) throw new Error("Smazání selhalo: " + deleteError.message);

    // Vložení 3 nových sestav
    const { error: insertError } = await supabase.from('pc_builds').insert(cleanBuilds);
    if (insertError) throw insertError;

    return new Response(JSON.stringify({ message: "GURU KODEX OPRAVEN A NAHRÁN!", count: cleanBuilds.length }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
