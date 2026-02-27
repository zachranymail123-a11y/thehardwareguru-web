import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Inicializace OpenAI a Supabase
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Potřebujeme Service Role pro zápis
);

export async function GET(req) {
  // Ochrana: Kontrola tajného klíče v URL, aby ti sestavy negeneroval kdokoli
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');

  if (secret !== process.env.CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  const GURU_KODEX = `
    Jsi "The Hardware Guru", expert s 20 lety praxe. Navrhuješ PC sestavy pro rok 2026.
    STRIKTNÍ PRAVIDLA HARDWARU:
    1. CPU: Vždy AMD AM5 (High-end: řada 9000 X3D, Budget: řada 7000 X3D).
    2. MB: Vždy ATX, heatsink na M.2, min. 2x M.2 slot a 4x SATA.
    3. RAM: Vždy 32GB (2x16GB) 6000MHz CL30.
    4. GPU: High-end (RTX 5070 Ti / Radeon 9070 XT), Budget (RTX 5070 / Radeon 9070).
    5. PSU: Vždy Seasonic Gold (Výkon = TDP komponent + 100W rezerva).
    6. DISK: 1x 512GB NVMe (Systém) + 1x 2TB NVMe (Data).
    7. CASE: Kvalitní ATX, zdroj dole, značky: NZXT, Fractal Design, Lian Li, be quiet!
    8. CHLAZENÍ: Vodní AIO pro AM5, tiché PWM ventilátory.

    KONTEXT PRO POPIS:
    - Sestavy jsou tvé nekompromisní návrhy.
    - Realizace probíhá jako HOBBY PROJEKT a komunitní pomoc pro diváky.
    - Vše se řeší individuálně a soukromě na Discordu.
    - Podmínkou pro pomoc je aktivní SUBSCRIBE na Kicku.

    TVŮJ ÚKOL:
    Vygeneruj 3 herní sestavy (Budget, Mid-range, Extreme).
    Výstup odevzdej jako JSON pole objektů s klíči: name, price_range, cpu, gpu, ram, storage, description.
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // nebo gpt-4-turbo
      messages: [{ role: "system", content: GURU_KODEX }],
      response_format: { type: "json_object" }
    });

    const generatedData = JSON.parse(completion.choices[0].message.content);
    const builds = generatedData.builds || generatedData; // Podle toho, jak AI pole zabalí

    // Uložíme/Aktualizujeme sestavy v Supabase
    // Předpokládám, že tabulka 'pc_builds' má odpovídající sloupce
    const { error } = await supabase
      .from('pc_builds')
      .upsert(builds.map(b => ({
        ...b,
        active: true,
        updated_at: new Date()
      })));

    if (error) throw error;

    return new Response(JSON.stringify({ message: "Sestavy aktualizovány!" }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
