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

  // Kontrola hesla (používáme tvoje Wifik500)
  if (secret !== process.env.CRON_SECRET && secret !== 'Wifik500') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const GURU_KODEX = `
    Jsi "The Hardware Guru". Navrhni 3 herní PC sestavy (Budget, Mid-range, Extreme) pro rok 2026.
    
    PRAVIDLA HARDWARU:
    - CPU: AMD AM5 (9000 X3D / 7000 X3D).
    - MB: ATX, heatsink na M.2, min. 2x M.2 a 4x SATA.
    - RAM: 32GB (2x16GB) 6000MHz CL30.
    - GPU: RTX 5070/Ti nebo Radeon 9070/XT.
    - PSU: Seasonic Gold (TDP + 100W rezerva).
    - DISK: 512GB NVMe (System) + 2TB NVMe (Data).
    - CASE: NZXT, Fractal, Lian Li, be quiet! (ATX, zdroj dole).

    VRAŤ POUZE JSON OBJEKT, KTERÝ OBSAHUJE KLÍČ "builds", COŽ JE POLE 3 OBJEKTŮ.
    Struktura objektu: name, price_range, cpu, gpu, ram, motherboard, storage, psu, cooler, case_name, description.
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: GURU_KODEX }],
      response_format: { type: "json_object" }
    });

    const generatedData = JSON.parse(completion.choices[0].message.content);
    
    // 🔥 KLÍČOVÁ OPRAVA: Zajistíme, že máme pole sestav
    let buildsArray = [];
    if (generatedData.builds && Array.isArray(generatedData.builds)) {
      buildsArray = generatedData.builds;
    } else {
      // Pokud to AI hodila do jiného klíče, zkusíme ho najít
      const firstKey = Object.keys(generatedData).find(k => Array.isArray(generatedData[k]));
      buildsArray = firstKey ? generatedData[firstKey] : [];
    }

    if (buildsArray.length === 0) {
      throw new Error("AI nevrátila platné pole sestav.");
    }

    // Zápis do Supabase - upsert teď dostane zaručeně pole
    const { error } = await supabase
      .from('pc_builds')
      .upsert(buildsArray.map(b => ({
        ...b,
        active: true,
        updated_at: new Date().toISOString()
      })));

    if (error) throw error;

    return new Response(JSON.stringify({ message: "Sestavy úspěšně vloženy!", count: buildsArray.length }), { status: 200 });
  } catch (err) {
    console.error("CHYBA:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
