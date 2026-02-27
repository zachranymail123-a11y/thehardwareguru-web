import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('secret') !== 'Wifik500') return new Response('Unauthorized', { status: 401 });

  const GURU_STRICT_PROMPT = `
    Jsi "The Hardware Guru". Navrhni PŘESNĚ tyto 3 sestavy. 
    STRUKTURA JSON: {"builds": [{"name": "...", "price_range": "...", "cpu": "...", "gpu": "...", "ram": "...", "motherboard": "...", "storage": "...", "psu": "...", "cooler": "...", "case_name": "...", "description": "..."}]}

    1. "Budget Beast" (Cena: 51 493 Kč)
       - CPU: AMD Ryzen 7 7700X (4 990 Kč)
       - GPU: NVIDIA GeForce RTX 5070 (18 590 Kč)
       - MB: B850 ATX (4 289 Kč)
       - RAM: 32GB DDR5-6000 CL30 (10 990 Kč)
       - Ostatní: Seasonic 650W, 512GB+2TB NVMe, NZXT H510.

    2. "Mid-range Master RTX" (Cena: 73 872 Kč)
       - CPU: AMD Ryzen 9 7900X3D (14 544 Kč)
       - GPU: NVIDIA GeForce RTX 5070 Ti (24 990 Kč)
       - MB: MSI X870 PRO (6 054 Kč)
       - RAM: 32GB DDR5-6000 CL30 (11 690 Kč)
       - Ostatní: Seasonic 750W, Noctua NH-D15, Fractal Meshify C.

    3. "Mid-range Master Radeon" (Cena: 80 476 Kč)
       - CPU: AMD Ryzen 9 9900X3D (14 590 Kč)
       - GPU: AMD Radeon RX 9070 XT (21 700 Kč)
       - MB: Gigabyte X870E AORUS MASTER (11 161 Kč)
       - RAM: 32GB DDR5-6000 CL30 (11 790 Kč)
       - Ostatní: Seasonic 850W, Corsair H150i Elite, Lian Li O11.

    STRIKTNÍ PRAVIDLA:
    - Klíče "cpu", "gpu", "ram", "motherboard", "storage", "psu", "cooler", "case_name" MUSÍ BÝT VYPLNĚNÉ.
    - Žádná prázdná pole!
    - Popis: Realizace jako hobby projekt. Kick Sub + Discord.
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

    // Mapování s fallbackem, aby pole NIKDY nebylo prázdné
    const cleanBuilds = buildsArray.map(b => ({
      name: b.name || "Guru Build",
      price_range: b.price_range || "Dle trhu",
      cpu: b.cpu || "AMD AM5",
      gpu: b.gpu || "RTX / Radeon",
      ram: b.ram || "32GB DDR5 6000MHz CL30",
      motherboard: b.motherboard || "AM5 ATX Board",
      storage: b.storage || "512GB + 2TB NVMe",
      psu: b.psu || "Seasonic Gold",
      cooler: b.cooler || "AIO / Air Cooler",
      case_name: b.case_name || "ATX Case",
      description: b.description || "Kontaktuj mě na Discordu (nutný Kick sub).",
      active: true,
      updated_at: new Date().toISOString()
    }));

    // TOTÁLNÍ ČISTKA: Smaže všechno z tabulky před vložením nových dat
    await supabase.from('pc_builds').delete().neq('name', 'NEMOZNENAZVY');
    
    // Vložení nových dat
    const { error: insertError } = await supabase.from('pc_builds').insert(cleanBuilds);
    if (insertError) throw insertError;

    return new Response(JSON.stringify({ message: "GURU KODEX OPRAVEN!", count: cleanBuilds.length }));
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
