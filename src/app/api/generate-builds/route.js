import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('secret') !== 'Wifik500') return new Response('Unauthorized', { status: 401 });

  const GURU_PROMPT = `Jsi "The Hardware Guru". Navrhni 3 herní PC (Budget, Mid, Extreme) pro rok 2026.
    VRAŤ JSON: {"builds": [{"name": "...", "price_range": "... Kč", "cpu": "...", "gpu": "...", "ram": "...", "motherboard": "...", "storage": "...", "psu": "...", "cooler": "...", "case_name": "...", "description": "..."}]}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: GURU_PROMPT }],
      response_format: { type: "json_object" }
    });

    const data = JSON.parse(completion.choices[0].message.content);
    const rawBuilds = data.builds || [];

    const cleanBuilds = rawBuilds.map(b => ({
      name: b.name || b.nazev || "Guru Sestava",
      price_range: b.price_range || b.cena || "Cena v Kč",
      cpu: b.cpu || b.processor || b.procesor || "AMD AM5 X3D",
      gpu: b.gpu || b.grafika || b.vga || "RTX / Radeon",
      ram: b.ram || b.pamet || "32GB DDR5 6000MHz CL30",
      motherboard: b.motherboard || b.deska || b.zakladni_deska || "ATX Guru Standard",
      storage: b.storage || b.disk || b.ssd || "512GB + 2TB NVMe",
      psu: b.psu || b.zdroj || "Seasonic Gold",
      cooler: b.cooler || b.chlazeni || "Vodní AIO / PWM Fans",
      case_name: b.case_name || b.skrin || b.case || "ATX Airflow Case",
      description: b.description || b.popis || "Realizace jako hobby projekt. Discord + Kick Sub.",
      active: true,
      updated_at: new Date().toISOString()
    }));

    await supabase.from('pc_builds').upsert(cleanBuilds);
    return new Response(JSON.stringify({ message: "Sestavy vyčištěny a nahrány!", count: cleanBuilds.length }));
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
