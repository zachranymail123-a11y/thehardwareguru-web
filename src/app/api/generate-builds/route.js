import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');

  if (secret !== process.env.CRON_SECRET && secret !== 'Wifik500') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const GURU_KODEX = `
    Jsi "The Hardware Guru". Navrhni 3 herní PC sestavy pro rok 2026.
    
    💰 MĚNA A CENY:
    - Všechny ceny v poli "price_range" uváděj výhradně v ČESKÝCH KORUNÁCH (Kč).
    - Budget: cca 25.000 - 35.000 Kč.
    - Mid-range: cca 50.000 - 65.000 Kč.
    - Extreme: 90.000 Kč a více.

    STRIKTNÍ PRAVIDLA PRO DESKY:
    - Budget: B850 (ATX).
    - Mid-range: X870 (ATX).
    - Extreme: X870E (ATX).
    - Vždy heatsink na M.2, min. 2x M.2 a 4x SATA.

    HARDWAROVÁ PRAVIDLA:
    - CPU: AMD AM5 (9000 X3D pro Mid/Extreme, 7000 X3D pro Budget).
    - RAM: 32GB (2x16GB) 6000MHz CL30.
    - GPU Budget: RTX 5070 / Radeon 9070.
    - GPU Mid/Extreme: RTX 5070 Ti / Radeon 9070 XT.
    - PSU: Seasonic Gold (TDP + 100W rezerva).
    - DISK: 512GB NVMe (Systém) + 2TB NVMe (Data).
    - CASE: NZXT, Fractal, Lian Li, be quiet! (ATX, zdroj dole).
    - CHLAZENÍ: Vodní AIO pro AM5, tiché PWM ventilátory.

    POVINNÝ TEXT DO DESCRIPTION:
    "Realizace probíhá jako hobby projekt a komunitní pomoc. Vše se řeší individuálně na Discordu. Podmínkou je Subscribe na Kicku."

    VRAŤ POUZE JSON OBJEKT s klíčem "builds" (pole 3 objektů).
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: GURU_KODEX }],
      response_format: { type: "json_object" }
    });

    const generatedData = JSON.parse(completion.choices[0].message.content);
    let buildsArray = generatedData.builds || Object.values(generatedData).find(Array.isArray) || [];

    if (buildsArray.length === 0) throw new Error("AI nevrátila pole.");

    const { error } = await supabase
      .from('pc_builds')
      .upsert(buildsArray.map(b => ({
        ...b,
        active: true,
        updated_at: new Date().toISOString()
      })));

    if (error) throw error;

    return new Response(JSON.stringify({ message: "Sestavy v Kč uloženy!", count: buildsArray.length }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
