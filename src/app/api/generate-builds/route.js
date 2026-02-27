import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fetchMarketPrices(query) {
  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: { "X-API-KEY": process.env.SERPER_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ q: query + " cena 2026 Heureka.cz", gl: "cz", hl: "cs" })
    });
    const data = await response.json();
    return data.organic?.slice(0, 3).map(res => res.snippet).join(" | ");
  } catch (e) { return "Ceny nedostupné"; }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('secret') !== 'Wifik500') return new Response('Unauthorized', { status: 401 });

  try {
    const [liveBudget, liveRTX, liveRadeon] = await Promise.all([
      fetchMarketPrices("AMD Ryzen 7 7700X, RTX 5070"),
      fetchMarketPrices("AMD Ryzen 7 9800X3D, RTX 5070 Ti"),
      fetchMarketPrices("AMD Ryzen 7 9800X3D, Radeon RX 9070 XT")
    ]);

    const GURU_FINAL_PROMPT = `
      Jsi "The Hardware Guru". Navrhni PŘESNĚ tyto 3 sestavy (AM5 platforma).
      Data z trhu: ${liveBudget} | ${liveRTX} | ${liveRadeon}

      SESTAVY A PROCESORY:
      1. "Budget Beast": CPU AMD Ryzen 7 7700X.
      2. "Mid-range Master RTX": CPU AMD Ryzen 7 9800X3D.
      3. "Mid-range Master Radeon": CPU AMD Ryzen 7 9800X3D.

      TVŮJ POVINNÝ TEXT DO DESCRIPTION (U VŠECH SESTAV):
      "Kdyz chce někdo levnejsi custom sestavu tak Subscribe na [Kick streamu](https://kick.com/thehardwareguru) a naslesně na [Discordu](https://discord.com/invite/n7xThr8) to doresime samozrejme. Realizace probíhá jako hobby projekt."

      STRIKTNÍ PRAVIDLA:
      - Ceny (price_range) musí být reálný součet všech komponent v Kč.
      - Názvy musí přesně sedět. Všechna pole musí být vyplněná.
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

    const cleanBuilds = buildsArray.map(b => ({
      ...b,
      active: true,
      updated_at: new Date().toISOString()
    }));

    // 🔥 NEJTVRDŠÍ SMAZÁNÍ: Smaže úplně všechno v tabulce
    const { error: deleteError } = await supabase.from('pc_builds').delete().neq('name', 'NEMOZNENAZVY');
    if (deleteError) throw new Error("Smazání selhalo: " + deleteError.message);

    // Vložení 3 nových kusů
    const { error: insertError } = await supabase.from('pc_builds').insert(cleanBuilds);
    if (insertError) throw insertError;

    return new Response(JSON.stringify({ message: "GURU KODEX AKTUALIZOVÁN!", count: cleanBuilds.length }));
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
