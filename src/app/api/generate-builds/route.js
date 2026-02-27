import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Funkce pro získání živých dat z českého trhu přes Serper.dev
async function fetchLiveMarketData(query) {
  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": process.env.SERPER_API_KEY, // Nutno přidat do Vercelu
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        q: query + " cena Heureka.cz 2026",
        gl: "cz",
        hl: "cs"
      })
    });
    const data = await response.json();
    return data.organic?.map(res => res.snippet).join(" | ") || "Data nenalezena";
  } catch (error) {
    return "Chyba při vyhledávání cen.";
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('secret') !== 'Wifik500') return new Response('Unauthorized', { status: 401 });

  try {
    // 1. GURU PRŮZKUM TRHU (Získáváme reálná data pro únor 2026)
    const [budgetPrices, midPrices, extremePrices] = await Promise.all([
      fetchLiveMarketData("AMD Ryzen 7 7700X, RTX 5070, B850 deska"),
      fetchLiveMarketData("AMD Ryzen 9 7900X3D, RTX 5070 Ti, X870 deska"),
      fetchLiveMarketData("AMD Ryzen 9 9900X3D, Radeon RX 9070 XT, X870E deska")
    ]);

    const GURU_STRICT_PROMPT = `
      Jsi "The Hardware Guru". Navrhni PŘESNĚ tyto 3 sestavy na platformě AM5. 
      Právě jsi prozkoumal český trh a toto jsou aktuální úryvky z webů: 
      ${budgetPrices} | ${midPrices} | ${extremePrices}

      TVÉ POVINNÉ SESTAVY A KOMPONENTY:

      1. "Budget Beast" (~51 500 Kč):
         - CPU: AMD Ryzen 7 7700X (POZOR: 7700X3D neexistuje!)
         - MB: B850 (ATX)
         - GPU: NVIDIA RTX 5070
         - RAM: 32GB (2x16) 6000MHz CL30
         - PSU: Seasonic Gold 650W

      2. "Mid-range Master RTX" (~74 000 Kč):
         - CPU: AMD Ryzen 9 7900X3D
         - MB: X870 (ATX)
         - GPU: NVIDIA RTX 5070 Ti
         - RAM: 32GB (2x16) 6000MHz CL30
         - PSU: Seasonic Gold 750W

      3. "Xtreme Euphoria Mid-range Master Radeon" (~80 500 Kč):
         - CPU: AMD Ryzen 9 9900X3D
         - MB: Gigabyte X870E AORUS MASTER (ATX)
         - GPU: AMD Radeon RX 9070 XT
         - RAM: 32GB (2x16) 6000MHz CL30
         - PSU: Seasonic Gold 850W
         - Cooler: 360mm AIO (např. Corsair/Lian Li)
         - Case: Lian Li PC-O11

      SPOLEČNÁ PRAVIDLA:
      - Disky: Vždy 512GB NVMe (Systém) + 2TB NVMe (Data).
      - Cena (price_range): Musí být reálný součet všech komponent v Kč podle úryvků z trhu.
      - Popis: Realizace jako hobby projekt. Nutný Subscribe na Kicku a kontakt na Discordu.

      VRAŤ JSON: {"builds": [OBJ] }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: GURU_STRICT_PROMPT }],
      temperature: 0, // Nulová kreativita, jen fakta
      response_format: { type: "json_object" }
    });

    const data = JSON.parse(completion.choices[0].message.content);
    const buildsArray = data.builds || [];

    const cleanBuilds = buildsArray.map(b => ({
      ...b,
      active: true,
      updated_at: new Date().toISOString()
    }));

    // Smazání starých a vložení nových čistých dat
    await supabase.from('pc_builds').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('pc_builds').insert(cleanBuilds);

    return new Response(JSON.stringify({ message: "GURU LIVE DATA NAHRÁNA!", count: cleanBuilds.length }));
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
