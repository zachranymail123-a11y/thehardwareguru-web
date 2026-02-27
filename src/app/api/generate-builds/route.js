import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('secret') !== 'Wifik500') return new Response('Unauthorized', { status: 401 });

  const GURU_STRICT_PROMPT = `
    Jsi "The Hardware Guru". Navrhni 3 herní PC (Budget, Mid-range, Extreme) pro rok 2026.
    
    ZÁKLADNÍ PRAVIDLA (PORUŠENÍ = CHYBA):
    1. PLATFORMA: Vždy a pouze AMD AM5. Žádný Intel.
    2. DESKY (STRIKTNĚ):
       - Budget build: Vždy čipset B850 (ATX).
       - Mid-range build: Vždy čipset X870 (ATX).
       - Extreme build: Vždy čipset X870E (ATX).
       - Každá deska musí mít heatsink na M.2 a minimálně 4x SATA.
    3. CPU: Pouze řady 9000 X3D nebo 7000 X3D.
    4. RAM: Vždy 32GB (2x16GB) 6000MHz CL30.
    5. GPU: RTX 5070/Ti nebo Radeon 9070/XT (podle tieru).
    6. ZDROJ: Vždy Seasonic Gold (výkon = TDP + 100W).
    7. DISKY: Vždy kombinace 512GB NVMe (OS) + 2TB NVMe (DATA).

    VRAŤ JSON: {"builds": [OBJ] }
    Struktura: name, price_range (v Kč), cpu, gpu, ram, motherboard, storage, psu, cooler, case_name, description.
    Popis musí obsahovat info o hobby projektu, Discordu a Kicku.
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: GURU_STRICT_PROMPT }],
      temperature: 0.1, // Sníženo na minimum pro maximální přesnost a nulovou kreativitu
      response_format: { type: "json_object" }
    });

    const data = JSON.parse(completion.choices[0].message.content);
    const rawBuilds = data.builds || [];

    const cleanBuilds = rawBuilds.map(b => ({
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

    // Před vložením nových sestav vymažeme ty staré zmetky
    await supabase.from('pc_builds').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    await supabase.from('pc_builds').insert(cleanBuilds);

    return new Response(JSON.stringify({ message: "GURU KODEX APLIKOVÁN!", count: cleanBuilds.length }));
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
