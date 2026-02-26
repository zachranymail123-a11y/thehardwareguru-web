import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERPER_API_KEY = process.env.SERPER_API_KEY;

// Agresivní vyhledávání s důrazem na dnešní datum
async function getDeepTrends(query) {
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      q: query, 
      tbs: "qdr:d", // Pouze posledních 24 hodin!
      num: 30 
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

    const sources = "site:videocardz.com OR site:techpowerup.com OR site:wccftech.com OR site:ign.com OR site:vgc.com OR site:pcgamer.com OR site:tomshardware.com OR site:eurogamer.net";

    const [hwData, gameData] = await Promise.all([
      getDeepTrends(`${sources} hardware "leak" OR "benchmark" OR "specs" GPU CPU 2026`),
      getDeepTrends(`${sources} game "official" OR "announcement" OR "trailer" 2026`)
    ]);

    const combinedContext = JSON.stringify({ hardware: hwData, gaming: gameData }).substring(0, 18000);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Jsi nemilosrdný šéfredaktor The Hardware Guru. Dnes je: ${dateStr}.
          
          TVOJE POVINNOST:
          1. Vyber PŘESNĚ 2x "hardware" a PŘESNĚ 2x "game".
          2. ZÁKAZ HALUCINACÍ: Nevymýšlej si Elden Ring 2, PS6 ani nic, co není v datech.
          3. ŽÁDNÝ STARÝ BALAST: Ryzen 8000 nebo RTX 30 jsou staré věci. Hledej RTX 50, Ryzen 9000 atd.
          4. VERIFIKACE: Musíš uvést, ze kterého webu jsi zprávu vzal.
          5. ANTI-DUPLICITA: Neopakuj: [ ${blacklisted} ].
          
          Vrať JSON: { "plan": [ { "title": "Český název", "type": "hardware/game", "source": "Název webu", "reason": "Důkaz reálnosti" } ] }`
        },
        { role: "user", content: `Data: ${combinedContext}` }
      ],
      response_format: { type: "json_object" }
    });

    const tasks = JSON.parse(completion.choices[0].message.content).plan;
    let addedCount = 0;
    let log = [];

    // --- SEZNAM ZAKÁZANÝCH STARÝCH/LHAVÝCH TÉMAT ---
    const forbidden = ['elden ring 2', 'ryzen 8000', 'ps6', 'rtx 30', 'milla jovovich', 'resident evil movie', 'half-life 3'];

    for (const task of tasks) {
      const text = (task.title + " " + task.reason).toLowerCase();
      
      // Detektor lži: Pokud je to v zakázaných, jdeme dál
      if (forbidden.some(word => text.includes(word))) continue;

      const hwSignals = ['gpu', 'cpu', 'nvidia', 'amd', 'intel', 'rtx', 'ryzen', 'benchmark', 'leak', 'specs', 'ti', 'chip', 'nm', 'vram', 'socket'];
      const gameSignals = ['game', 'hra', 'pc', 'steam', 'ps5', 'xbox', 'playstation', 'nintendo', 'switch', 'studio', 'trailer', 'patch', 'update', 'release'];

      let hwScore = hwSignals.filter(s => text.includes(s)).length;
      let gameScore = gameSignals.filter(s => text.includes(s)).length;

      let finalType = task.type.toLowerCase();
      if (hwScore > gameScore && hwScore > 0) finalType = 'hardware';
      if (gameScore > hwScore && gameScore > 0) finalType = 'game';

      // Kontrola duplicity
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
        log.push({ title: task.title, type: finalType, source: task.source });
      }
    }

    return NextResponse.json({ status: 'DONE', added: addedCount, db_zapis: log });

  } catch (err) {
    return NextResponse.json({ error: err.message });
  }
}
