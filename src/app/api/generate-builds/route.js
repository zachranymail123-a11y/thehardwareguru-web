import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Funkce pro získání živých dat z trhu (Heureka / Alza)
async function fetchMarketPrices(query) {
  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": process.env.SERPER_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        q: query + " cena 2026 Heureka.cz",
        gl: "cz",
        hl: "cs"
      })
    });
    const data = await response.json();
    return data.organic?.slice(0, 3).map(res => res.snippet).join(" | ");
  } catch (e) {
    return "Ceny nedostupné";
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('secret') !== 'Wifik500') return new Response('Unauthorized', { status: 401 });

  try {
    // 1. GURU PRŮZKUM (Zjišťujeme reálné ceny pro tvoje komponenty)
    const [liveBudget, liveRTX, liveRadeon] = await Promise.all([
      fetchMarketPrices("AMD Ryzen 7 7700X, RTX 5070, ASUS B850"),
      fetchMarketPrices("AMD Ryzen 9 7900X3D, RTX 5070 Ti, MSI X870"),
      fetchMarketPrices("AMD Ryzen 9 9900X3D, Radeon RX 9070 XT, X870E AORUS MASTER")
    ]);

    const GURU_PROMPT = `
      Jsi "The Hardware Guru". Navrhni 3 herní PC na platformě AM5. 
      Tady jsou aktuální data z českého trhu: ${liveBudget} | ${liveRTX} | ${liveRadeon}

      SESTAVY (DODRŽET NÁZVY):
      1. "Budget Beast": Ryzen 7 7700X (7700X3D neexistuje!), RTX 5070, B850.
      2. "Mid-range Master RTX": Ryzen 9 7900X3D, RTX 5070 Ti, X870.
      3. "Mid-range Master Radeon": Ryzen 9 9900X3D, RX 9070 XT, X870E AORUS MASTER.

      STRIKTNÍ PRAVIDLA:
      - Ceny (price_range) musí být reálný součet v Kč podle tržních dat.
      - Disky: Vždy 512GB (OS) + 2TB (Data). Zdroj: Seasonic Gold.
      - JSON STRUKTURA: {"builds": [{"name": "...", "price_range": "...", "cpu": "...", "gpu": "...", "ram": "...", "motherboard": "...", "storage": "...", "psu": "...", "cooler": "...", "case_name": "...", "description": "..."}]}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: GURU_PROMPT }],
      temperature: 0,
      response_format: { type: "json_object" }
    });

    const data = JSON.parse(completion.choices[0].message.content);
    const buildsArray = data.builds || [];

    const cleanBuilds = buildsArray.map(b => ({
      name: b.name || "Guru Build",
      price_range: b.price_range || "Aktualizace...",
      cpu: b.cpu || "AMD AM5",
      gpu: b.gpu || "Grafika",
      ram: b.ram || "32GB DDR5 6000MHz",
      motherboard: b.motherboard || "ATX Board",
      storage: b.storage || "512GB + 2TB NVMe",
      psu: b.psu || "Seasonic Gold",
      cooler: b.cooler || "Chladič",
      case_name: b.case_name || "Case",
      description: b.description || "Hobby projekt. Kick sub + Discord.",
      active: true,
      updated_at: new Date().toISOString()
    }));

    // 🔥 KROK 1: SMAZÁNÍ (Nutná aktivní delete policy v Supabase!)
    const { error: deleteError } = await supabase.from('pc_builds').delete().not('id', 'is', null);
    if (deleteError) throw new Error("Smazání selhalo: " + deleteError.message);

    // 🔥 KROK 2: VLOŽENÍ 3 NOVÝCH SESTAV S ŽIVÝMI CENAMI
    const { error: insertError } = await supabase.from('pc_builds').insert(cleanBuilds);
    if (insertError) throw insertError;

    return new Response(JSON.stringify({ message: "GURU AUTOMATIKA DOKONČENA!", count: cleanBuilds.length }));

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
