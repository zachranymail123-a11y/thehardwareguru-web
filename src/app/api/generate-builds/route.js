export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Přepnuto na NÁKUPY (Shopping API) - Vrací přesné a živé ceny, ne textové bláboly!
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
      // Vezme 3 nejlevnější reálné nabídky
      return data.shopping.slice(0, 3).map(item => `${item.title} = ${item.price} Kč`).join(" | ");
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
    // 1. Získáme ŽIVÁ čísla z nákupů (bude to trvat pár vteřin)
    const [price7700X, price5070, price9800X3D, price5070Ti, price9070XT] = await Promise.all([
      fetchRealPrices("AMD Ryzen 7 7700X procesor"),
      fetchRealPrices("NVIDIA GeForce RTX 5070 grafická karta"),
      fetchRealPrices("AMD Ryzen 7 9800X3D procesor"),
      fetchRealPrices("NVIDIA GeForce RTX 5070 Ti grafická karta"),
      fetchRealPrices("AMD Radeon RX 9070 XT grafická karta")
    ]);

    const GURU_FINAL_PROMPT = `
      Jsi "The Hardware Guru". Tvůj úkol je vzít aktuální ceny a poskládat 3 sestavy.

      AKTUÁLNÍ ŽIVÉ CENY Z TRHU:
      - Ryzen 7 7700X: ${price7700X}
      - RTX 5070: ${price5070}
      - Ryzen 7 9800X3D: ${price9800X3D}
      - RTX 5070 Ti: ${price5070Ti}
      - RX 9070 XT: ${price9070XT}

      TVÉ 3 SESTAVY (DODRŽ HARDWARE):
      1. "Budget Beast": CPU AMD Ryzen 7 7700X, GPU RTX 5070, MB B850.
      2. "Mid-range Master RTX": CPU AMD Ryzen 7 9800X3D, GPU RTX 5070 Ti, MB X870.
      3. "Mid-range Master Radeon": CPU AMD Ryzen 7 9800X3D, GPU RX 9070 XT, MB X870E AORUS MASTER.

      KRITICKÁ PRAVIDLA PRO MATEMATIKU:
      1. RAM VŽDY: "32GB DDR5 6000MHz CL30" (ZAKAZUJI 5600MHz!).
      2. Z tržních dat vyber tu NEJNIŽŠÍ REÁLNOU CENU pro daný díl.
      3. Do ZÁVORKY u každého dílu napiš částku, kterou jsi použil (např. "AMD Ryzen 7 9800X3D (14 500 Kč)"). Ostatní díly (MB, RAM, SSD, zdroj) ohodnoť logickou aktuální tržní cenou a taky je napiš do závorky.
      4. "price_range" MUSÍ BÝT PŘESNÝ SOUČET VŠECH ZÁVOREK!!!

      POPIS:
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

    // 🔥 TVRDÁ IDčka - Tohle navždy vyřeší problém s mazáním
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

      return {
        id: targetId, // Vynucení přepsání na stejném místě
        name: b.name,
        price_range: b.price_range,
        cpu: b.cpu,
        gpu: b.gpu,
        ram: "32GB DDR5 6000MHz CL30", // Tvrdá pojistka
        motherboard: b.motherboard,
        storage: b.storage,
        psu: b.psu,
        cooler: b.cooler,
        case_name: b.case_name,
        description: b.description,
        active: true,
        updated_at: new Date().toISOString()
      };
    });

    // 🔥 Místo INSERT a DELETE používáme UPSERT (Přepsání existujícího ID)
    const { error: upsertError } = await supabase.from('pc_builds').upsert(finalBuilds);
    if (upsertError) throw upsertError;

    return new Response(JSON.stringify({ message: "GURU OVERRIDE ÚSPĚŠNÝ! Ceny z Nákupů aplikovány.", count: finalBuilds.length }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
