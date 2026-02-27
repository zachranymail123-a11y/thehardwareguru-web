import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('secret') !== 'Wifik500') return new Response('Unauthorized', { status: 401 });

  const GURU_STRICT_PROMPT = `
    Jsi "The Hardware Guru". Navrhni PŘESNĚ tyto 3 sestavy pro únor 2026. 
    JSON STRUKTURA: {"builds": [{"name": "...", "price_range": "...", "cpu": "...", "gpu": "...", "ram": "...", "motherboard": "...", "storage": "...", "psu": "...", "cooler": "...", "case_name": "...", "description": "..."}]}

    POVINNÉ SESTAVY:
    1. "Budget Beast" (Cena: 51 493 Kč) - Ryzen 7 7700X, RTX 5070, B850.
    2. "Mid-range Master RTX" (Cena: 73 872 Kč) - Ryzen 9 7900X3D, RTX 5070 Ti, X870.
    3. "Mid-range Master Radeon" (Cena: 80 476 Kč) - Ryzen 9 9900X3D, RX 9070 XT, X870E AORUS MASTER.

    STRIKTNÍ PRAVIDLA:
    - Klíče "price_range", "cpu", "gpu", "ram", "motherboard", "storage", "psu", "cooler", "case_name" MUSÍ být vyplněné.
    - Cena v price_range musí být u Budget Beast přesně 51 493 Kč, u Master RTX 73 872 Kč a u Master Radeon 80 476 Kč.
    - Popis: Hobby projekt, Kick Sub + Discord.
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

    const cleanBuilds = buildsArray.map(b => {
      // Záchranná síť pro ceny, aby Supabase neřvala kvůli NULL
      let finalPrice = b.price_range || b.price || b.cena;
      if (!finalPrice || finalPrice === null) {
        if (b.name?.toLowerCase().includes("budget")) finalPrice = "51 493 Kč";
        else if (b.name?.toLowerCase().includes("rtx")) finalPrice = "73 872 Kč";
        else finalPrice = "80 476 Kč";
      }

      return {
        name: b.name || "Guru Build",
        price_range: finalPrice,
        cpu: b.cpu || b.processor || "AMD AM5",
        gpu: b.gpu || "RTX / Radeon",
        ram: b.ram || "32GB DDR5 6000MHz",
        motherboard: b.motherboard || "AM5 ATX Board",
        storage: b.storage || "512GB + 2TB NVMe",
        psu: b.psu || "Seasonic Gold",
        cooler: b.cooler || "AIO / Cooler",
        case_name: b.case_name || "ATX Case",
        description: b.description || "Hobby projekt. Kick sub + Discord.",
        active: true,
        updated_at: new Date().toISOString()
      };
    });

    // 🔥 KROK 1: SMAZÁNÍ VŠEHO (neq 'id' s nulovým UUID je nejjistější filtr)
    const { error: deleteError } = await supabase
      .from('pc_builds')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError) throw new Error("Delete failed: " + deleteError.message);

    // 🔥 KROK 2: VLOŽENÍ ČISTÝCH DAT
    const { error: insertError } = await supabase.from('pc_builds').insert(cleanBuilds);
    if (insertError) throw insertError;

    return new Response(JSON.stringify({ message: "GURU RESET HOTOV!", count: cleanBuilds.length }));

  } catch (err) {
    console.error("Guru Nuclear Error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
