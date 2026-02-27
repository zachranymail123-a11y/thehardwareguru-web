import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('secret') !== 'Wifik500') return new Response('Unauthorized', { status: 401 });

  const GURU_STRICT_PROMPT = `
    Jsi "The Hardware Guru". Navrhni PŘESNĚ tyto 3 sestavy pro únor 2026. 
    JSON STRUKTURA: {"builds": [OBJ]}

    1. "Budget Beast" (Cena: 51 493 Kč)
       - Ryzen 7 7700X, RTX 5070, B850 ATX, 32GB RAM, 512GB+2TB NVMe.
    2. "Mid-range Master RTX" (Cena: 73 872 Kč)
       - Ryzen 9 7900X3D, RTX 5070 Ti, MSI X870 PRO, 32GB RAM, 512GB+2TB (990 PRO).
    3. "Mid-range Master Radeon" (Cena: 80 476 Kč)
       - Ryzen 9 9900X3D, Radeon RX 9070 XT, Gigabyte X870E AORUS MASTER, 32GB RAM, 512GB+2TB (990 PRO).

    STRIKTNÍ PRAVIDLA:
    - Názvy MUSÍ být přesně: "Budget Beast", "Mid-range Master RTX", "Mid-range Master Radeon".
    - Vyplň VŠECHNA pole (cpu, gpu, ram, motherboard, storage, psu, cooler, case_name).
    - ŽÁDNÁ PRÁZDNÁ POLE. Popis: Hobby projekt, Kick Sub, Discord.
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: GURU_STRICT_PROMPT }],
      temperature: 0,
      response_format: { type: "json_object" }
    });

    const data = JSON.parse(completion.choices[0].message.content);
    const buildsArray = data.builds || [];

    const cleanBuilds = buildsArray.map(b => ({
      name: b.name,
      price_range: b.price_range,
      cpu: b.cpu || "AMD AM5",
      gpu: b.gpu || "RTX / Radeon",
      ram: b.ram || "32GB DDR5 6000MHz",
      motherboard: b.motherboard || "ATX Board",
      storage: b.storage || "512GB + 2TB NVMe",
      psu: b.psu || "Seasonic Gold",
      cooler: b.cooler || "AIO / Cooler",
      case_name: b.case_name || "ATX Case",
      description: b.description || "Kontaktuj mě na Discordu (nutný Kick sub).",
      active: true,
      updated_at: new Date().toISOString()
    }));

    // 🔥 KROK 1: SMAZÁNÍ VŠEHO (Díky SQL příkazu výše už to teď projde)
    const { error: deleteError } = await supabase
      .from('pc_builds')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); 

    if (deleteError) {
      console.error("Delete Error:", deleteError);
      throw new Error("Smazání starých dat selhalo: " + deleteError.message);
    }

    // 🔥 KROK 2: Vložení nových 3 kusů
    const { error: insertError } = await supabase
      .from('pc_builds')
      .insert(cleanBuilds);

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ 
      message: "TABULKA VYČIŠTĚNA A NAHRÁNY JEN 3 SESTAVY!", 
      count: cleanBuilds.length 
    }), { status: 200 });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
