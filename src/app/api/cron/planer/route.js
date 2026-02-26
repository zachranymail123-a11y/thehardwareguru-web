import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERPER_API_KEY = process.env.SERPER_API_KEY;

async function getTrends(query) {
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: query, tbs: "qdr:d", num: 40 }) // Okno 24h
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

    const sources = "site:videocardz.com OR site:techpowerup.com OR site:wccftech.com OR site:ign.com OR site:vgc.com OR site:pcgamer.com OR site:tomshardware.com OR site:eurogamer.net";

    const [hwData, gameData] = await Promise.all([
      getTrends(`${sources} hardware "leak" OR "benchmark" OR "announced" GPU CPU 2026`),
      getTrends(`${sources} game "official" OR "announcement" OR "trailer" OR "release" 2026`)
    ]);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Jsi šéfredaktor Hardware Guru. Dnes je: ${dateStr}.
          ÚKOL: Vyber 2x HW (čipy, grafiky) a 2x GAME (PC hry, Steam, konzole).
          
          PŘÍSNÁ PRAVIDLA:
          1. AKTUALITA: Hledej v datech časové značky jako "hours ago", "mins ago" nebo "today". Pokud je tam datum z minulého týdne, IGNORUJ.
          2. ZDROJ: Musí to být z elitních webů.
          3. DUPLICITA: Nepiš o: [ ${blacklisted} ].
          4. POVINNOST: Musíš vrátit 4 články. Pokud není nic mega, vezmi nejnovější menší leak nebo update.
          
          Vrať JSON: { "plan": [ { "title": "Název", "type": "hardware/game", "age": "citace času z dat", "source": "web" } ] }`
        },
        { role: "user", content: `Data k analýze: ${JSON.stringify({ hw: hwData, game: gameData }).substring(0, 17000)}` }
      ],
      response_format: { type: "json_object" }
    });

    const tasks = JSON.parse(completion.choices[0].message.content).plan;
    let addedCount = 0;
    let log = [];

    for (const task of tasks) {
      const text = (task.title + " " + (task.age || "")).toLowerCase();
      
      // KÓDOVÁ POJISTKA - Pokud je to včerejší balast, vyhodit
      if (text.includes('day ago') || text.includes('yesterday')) continue;

      // ROZHODOVÁNÍ O TYPU (PC = Game)
      let finalType = task.type.toLowerCase();
      const isHw = text.includes('gpu') || text.includes('cpu') || text.includes('rtx') || text.includes('ryzen') || text.includes('intel') || text.includes('amd') || text.includes('nvidia') || text.includes('benchmark');
      
      if (isHw) {
        finalType = 'hardware';
      } else {
        finalType = 'game';
      }

      // Kontrola duplicity v DB
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
        log.push({ title: task.title, type: finalType, age: task.age });
      }
    }

    return NextResponse.json({ status: 'SUCCESS', added: addedCount, db_zapis: log });

  } catch (err) {
    return NextResponse.json({ error: err.message });
  }
}
