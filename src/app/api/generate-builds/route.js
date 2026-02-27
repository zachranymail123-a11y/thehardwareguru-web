import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('secret') !== 'Wifik500') return new Response('Unauthorized', { status: 401 });

  const GURU_STRICT_PROMPT = `
    Jsi "The Hardware Guru". Navrhni PŘESNĚ tyto 3 sestavy pro únor 2026. 
    STRUKTURA JSON: {"builds": [{"name": "...", "price_range": "...", "cpu": "...", "gpu": "...", "ram": "...", "motherboard": "...", "storage": "...", "psu": "...", "cooler": "...", "case_name": "...", "description": "..."}]}

    POVINNÉ NÁZVY A CENY (DODRŽET NA HALÉŘ):
    1. "Budget Beast" (Cena: 51 493 Kč)
    2. "Mid-range Master RTX" (Cena: 73 872 Kč)
    3. "Mid-range Master Radeon" (Cena: 80 476 Kč)

    SPECIFIKACE PRO MASTER RADEON:
    CPU: AMD Ryzen 9 9900X3D (14 590 Kč), GPU: AMD Radeon RX 9070 XT (21 700 Kč), MB: Gigabyte X870E AORUS MASTER (11 161 Kč), RAM: 11 790 Kč, SSD (512GB+2TB): 7 498 Kč, Zdroj: 2 525 Kč, Chlazení: 6 500 Kč, Case: 4 712 Kč.

    STRIKTNÍ PRAVIDLA:
    - Platforma: Vždy AM5.
    - Klíče MUSÍ být vyplněné, žádná prázdná pole.
    - Popis: Hobby projekt, nutný Kick Sub a Discord.
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
      motherboard: b.motherboard || "AM5 ATX Board",
      storage: b.storage || "512GB + 2TB NVMe",
      psu: b.psu || "Seasonic Gold",
      cooler: b.cooler || "AIO / Cooler",
      case_name: b.case_name || "ATX Case",
      description: b.description || "Hobby projekt. Kick sub + Discord.",
      active: true,
      updated_at: new Date().toISOString()
    }));

    // 🔥 TOTÁLNÍ ČISTKA: Mazání pomocí filtru, který v Supabase sežere všechno
    // Používáme filtr "id is not null", což v Supabase zaručeně smaže každou řádku
    const { error: deleteError } = await supabase
      .from('pc_builds')
      .delete()
      .not('id', 'is', null);

    if (deleteError) {
      console.error("Delete failed:", deleteError);
      throw new Error("Chyba při mazání tabulky: " + deleteError.message);
    }

    // 🔥 KROK 2: Vložení 3 nových čistých sestav
    const { error: insertError } = await supabase
      .from('pc_builds')
      .insert(cleanBuilds);

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ 
      message: "GURU RESET HOTOV - NAHRÁNY 3 SESTAVY!", 
      count: cleanBuilds.length 
    }), { status: 200 });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
