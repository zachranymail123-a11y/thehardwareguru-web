import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERPER_API_KEY = process.env.SERPER_API_KEY;

async function getFreshTrends(query) {
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      q: query, 
      tbs: "qdr:h12", // FILTR: POUZE POSLEDNÍCH 12 HODIN
      num: 30 
    })
  });
  const data = await res.json();
  // Serper vrací pole 'organic', kde u každého výsledku bývá 'date' (např. "2 hours ago")
  return data.organic || [];
}

export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const now = new Date();
  const dateStr = `${now.getDate()}. ${now.getMonth() + 1}. ${now.getFullYear()}`;

  try {
    const { data: history } = await supabase.from('content_plan').select('title').order('id', { ascending: false }).limit(60);
    const blacklisted = history ? history.map(h => h.title).join(' | ') : 'Nic';

    const sources = "site:videocardz.com OR site:techpowerup.com OR site:wccftech.com OR site:ign.com OR site:vgc.com OR site:pcgamer.com OR site:tomshardware.com OR site:eurogamer.net";

    const [hwData, gameData] = await Promise.all([
      getFreshTrends(`${sources} hardware "breaking" OR "leak" OR "benchmark" GPU CPU`),
      getFreshTrends(`${sources} game "announced" OR "released" OR "review"`)
    ]);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Jsi analytik technického zpravodajství. Dnes je: ${dateStr}.
          ÚKOL: Vyber 2x HW a 2x GAME novinku, které vyšly SKUTEČNĚ DNES.
          
          VERIFIKAČNÍ PROTOKOL:
          1. KONTROLA ČASU: V datech hledej časové značky (např. "2 hours ago", "4 hours ago"). Pokud je článek bez časové značky nebo starší než 12h, ignoruj ho.
          2. ZÁKAZ RECYKLÁTŮ: Články o Mille Jovovich, starých Ryzenech nebo starých oznámeních Witcher 4 jsou zakázány.
          3. DUPLICITA: Nekontroluj jen doslovný název, ale i téma: [ ${blacklisted} ].
          
          Vrať JSON: { "plan": [ { "title": "...", "type": "hardware/game", "age_proof": "přesná citace času z dat", "source": "web" } ] }`
        },
        { role: "user", content: `Čerstvá data (posledních 12h): ${JSON.stringify({ hw: hwData, game: gameData }).substring(0, 16000)}` }
      ],
      response_format: { type: "json_object" }
    });

    const tasks = JSON.parse(completion.choices[0].message.content).plan;
    let addedCount = 0;
    let log = [];

    for (const task of tasks) {
      // 1. ZPĚTNÁ KONTROLA V KÓDU: Pokud AI nenašla důkaz o čase, letí to ven
      if (!task.age_proof || task.age_proof.toLowerCase().includes('day')) continue;

      const text = (task.title + " " + task.age_proof).toLowerCase();
      
      // 2. POJISTKA TYPU (PC/Steam = Game)
      const hwSignals = ['gpu', 'cpu', 'nvidia', 'amd', 'intel', 'rtx', 'ryzen', 'bench', 'vram', 'ti', 'socket'];
      const gameSignals = ['game', 'hra', 'pc', 'steam', 'ps5', 'xbox', 'nintendo', 'studio', 'patch', 'trailer'];

      let hwScore = hwSignals.filter(s => text.includes(s)).length;
      let gameScore = gameSignals.filter(s => text.includes(s)).length;

      let finalType = task.type.toLowerCase();
      if (hwScore > gameScore && hwScore > 0) finalType = 'hardware';
      if (gameScore > hwScore && gameScore > 0) finalType = 'game';
      if ((text.includes('pc') || text.includes('steam')) && hwScore === 0) finalType = 'game';

      // 3. DUPLICITA
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
        log.push({ title: task.title, age: task.age_proof, source: task.source });
      }
    }

    return NextResponse.json({ status: 'DONE', added: addedCount, db_zapis: log });
  } catch (err) {
    return NextResponse.json({ error: err.message });
  }
}
