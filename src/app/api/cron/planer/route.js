import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERPER_API_KEY = process.env.SERPER_API_KEY;

// Rozšířeno na 24h, ale kód si pohlídá čerstvost
async function getFreshTrends(query) {
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      q: query, 
      tbs: "qdr:d", // Okno 24h pro více výsledků
      num: 40 // Více dat pro AI na analýzu
    })
  });
  const data = await res.json();
  return data.organic || [];
}

export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const now = new Date();
  const dateStr = `${now.getDate()}. ${now.getMonth() + 1}. ${now.getFullYear()}`;

  try {
    const { data: history } = await supabase.from('content_plan').select('title').order('id', { ascending: false }).limit(60);
    const blacklisted = history ? history.map(h => h.title).join(' | ') : 'Nic';

    const sources = "site:videocardz.com OR site:techpowerup.com OR site:wccftech.com OR site:ign.com OR site:vgc.com OR site:pcgamer.com OR site:tomshardware.com OR site:eurogamer.net OR site:theverge.com";

    // Vyhledáváme s důrazem na dnešní události
    const [hwData, gameData] = await Promise.all([
      getFreshTrends(`${sources} hardware "leak" OR "benchmark" OR "announced" GPU CPU`),
      getFreshTrends(`${sources} game "official" OR "trailer" OR "review" news`)
    ]);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Jsi analytik technického zpravodajství. Dnes je: ${dateStr}.
          ÚKOL: Vyber 2x HW a 2x GAME novinku, které vyšly DNES.
          
          VERIFIKAČNÍ PROTOKOL:
          1. KONTROLA ČASU: Musí to být z dneška. Hledej "hours ago" nebo "mins ago". Ignoruj vše, co je "1 day ago" nebo starší.
          2. VALIDITA: Žádné recykláty (Milla Jovovich, staré Ryzeny, Witcher 4 info z minula).
          3. PC PRIORITA: PC hry a Steam novinky patří do kategorie "game".
          4. ANTI-DUPLICITA: Neopakuj: [ ${blacklisted} ].
          
          Vrať JSON: { "plan": [ { "title": "Úderný název", "type": "hardware/game", "age_proof": "přesný čas z dat (např. 4 hours ago)", "source": "web" } ] }`
        },
        { role: "user", content: `Data k analýze (24h): ${JSON.stringify({ hw: hwData, game: gameData }).substring(0, 16000)}` }
      ],
      response_format: { type: "json_object" }
    });

    const tasks = JSON.parse(completion.choices[0].message.content).plan;
    let addedCount = 0;
    let log = [];

    for (const task of tasks) {
      // --- NEKOMPROMISNÍ FILTR ČASU V KÓDU ---
      const age = (task.age_proof || "").toLowerCase();
      // Pokud tam není údaj o čase, nebo je to "včerejší" (day), tak to zahodíme
      if (!age || age.includes('day') || age.includes('yesterday')) continue;
      // Musí tam být "hour" nebo "min" (důkaz dneška)
      if (!age.includes('hour') && !age.includes('min')) continue;

      const text = (task.title + " " + task.age_proof).toLowerCase();
      
      const hwSignals = ['gpu', 'cpu', 'nvidia', 'amd', 'intel', 'rtx', 'ryzen', 'bench', 'vram', 'ti', 'socket', 'zen', 'blackwell'];
      let hwScore = hwSignals.filter(s => text.includes(s)).length;
      
      let finalType = task.type.toLowerCase();
      if (hwScore > 0) finalType = 'hardware';
      if (text.includes('pc') || text.includes('game') || text.includes('steam')) {
        if (hwScore === 0) finalType = 'game';
      }

      const { data: dup } = await supabase.from('content_plan').select('id').eq('title', task.title).limit(1);
      if (dup && dup.length > 0) continue;

      const { data } = await supabase.from('content_plan').insert({
        title: task.title,
        release_date: now.toISOString().split('T')[0],
        type: finalType,
        status: 'planned'
      }).select();

      if (data) {
        addedCount++;
        log.push({ title: task.title, age: task.age_proof, type: finalType });
      }
    }

    return NextResponse.json({ status: 'DONE', added: addedCount, db_zapis: log });
  } catch (err) {
    return NextResponse.json({ error: err.message });
  }
}
