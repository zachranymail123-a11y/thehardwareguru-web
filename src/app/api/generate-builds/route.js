export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('secret') !== 'Wifik500') return new Response('Unauthorized', { status: 401 });

  try {
    const GURU_FINAL_PROMPT = `
      Jsi "The Hardware Guru". Navrhni 3 herní PC sestavy.
      ZAKAZUJI TI PSÁT JAKÉKOLIV CENY. Tvojí jedinou prací je vypsat přesné a celé názvy komponentů.

      TVÉ 3 SESTAVY:
      1. "Budget Beast" (CPU: AMD Ryzen 7 7700X, GPU: RTX 5070)
      2. "Mid-range Master RTX" (CPU: AMD Ryzen 7 9800X3D, GPU: RTX 5070 Ti)
      3. "Mid-range Master Radeon" (CPU: AMD Ryzen 7 9800X3D, GPU: RX 9070 XT)

      PRAVIDLA PRO JSON (NEPOUŽÍVEJ TŘI TEČKY V NÁZVECH! VYPISUJ CELÁ JMÉNA!):
      - U grafiky, zdroje, chladiče a skříně vypiš prostě jen normální název produktu.

      VRAŤ PŘESNĚ TENTO JSON FORMÁT:
      {
        "builds": [
          {
            "name": "Celý Název Sestavy",
            "components": {
              "cpu": {"name": "Celý název procesoru"},
              "gpu": {"name": "Celý název grafiky"},
              "ram": {"name": "RAM"},
              "motherboard": {"name": "Deska"},
              "storage": {"name": "SSD"},
              "psu": {"name": "Seasonic Focus GX 850W"},
              "cooler": {"name": "Arctic Liquid Freezer III 360"},
              "case_name": {"name": "Lian Li Lancool 216"}
            }
          }
        ]
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: GURU_FINAL_PROMPT }],
      temperature: 0,
      response_format: { type: "json_object" }
    });

    const data = JSON.parse(completion.choices[0].message.content);
    const buildsArray = data.builds || [];

    // Pevná IDčka, takže sestavy se nekupí, ale elegantně se přepisují
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

      const c = b.components || {};
      const getName = (obj, def) => (obj && obj.name) ? obj.name : def;

      // Univerzální texty nahrazující problémové ceny
      const customPriceRange = "Cena dle aktuálního trhu";
      const customDescription = "Ceny hardwaru se mění každý den, takže se celková částka odvíjí od data, kdy sestavu navrhujeme. Bližší dohodu a přesnou kalkulaci pořešíme společně – stačí hodit Subscribe na Kick streamu a napsat mi na Discord. Realizace probíhá jako hobby projekt.";

      return {
        id: targetId,
        name: b.name,
        price_range: customPriceRange,
        cpu: getName(c.cpu, "AMD CPU"),
        gpu: getName(c.gpu, "GPU"),
        
        // 🔥 TVRDÉ ZÁMKY HW (Sjednocený základ u všech sestav)
        ram: "Kingston Fury Beast DDR5 32GB 6000MHz CL30 (2x16GB)", 
        motherboard: "Gigabyte X870E AORUS ELITE WIFI7",
        storage: "Kingston KC3000 2048GB",
        
        psu: getName(c.psu, "Seasonic 850W Gold PSU"),
        cooler: getName(c.cooler, "Chladič"),
        case_name: getName(c.case_name, "PC Skříň"),
        description: customDescription,
        active: true,
        updated_at: new Date().toISOString()
      };
    });

    const { error: upsertError } = await supabase.from('pc_builds').upsert(finalBuilds);
    if (upsertError) throw upsertError;

    return new Response(JSON.stringify({ message: "GURU UPDATE: Ceny odstraněny, komponenty a texty sjednoceny!", count: finalBuilds.length }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
