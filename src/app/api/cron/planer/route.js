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
    body: JSON.stringify({ q: query, tbs: "qdr:d", num: 40 })
  });
  const data = await res.json();
  return data.organic || [];
}

export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const now = new Date();
  
  try {
    const { data: history } = await supabase.from('content_plan').select('title').order('id', { ascending: false }).limit(60);
    const blacklisted = history ? history.map(h => h.title).join(' | ') : 'Nic';

    const sources = "site:videocardz.com OR site:techpowerup.com OR site:wccftech.com OR site:ign.com OR site:vgc.com OR site:pcgamer.com OR site:tomshardware.com OR site:eurogamer.net";
    const [hwData, gameData] = await Promise.all([
      getFreshTrends(`${sources} hardware "leak" OR "benchmark" OR "announced" GPU CPU`),
      getFreshTrends(`${sources} game "official" OR "trailer" OR "review" news`)
    ]);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Jsi analytik. Vyber 2x HW a 2x GAME novinky z dneška.
          KRITÉRIA: Musí to být DNES (v datech je 'hours ago' nebo 'mins ago').
          Pokud je v datech datum (např. 'Feb 25'), je to staré - IGNORUJ.
          Vrať JSON: { "plan": [ { "title": "...", "type": "hardware/game", "age_proof": "citace času", "source": "web" } ] }`
        },
        { role: "user", content: `Data: ${JSON.stringify({ hw: hwData, game: gameData }).substring(0, 16000)}` }
      ],
      response_format: { type: "json_object" }
    });

    const tasks = JSON.parse(completion.choices[0].message.content).plan;
    let addedCount = 0;
    let successLog = [];
    let rejectedLog = [];

    for (const task of tasks) {
      const age = (task.age_proof || "").toLowerCase();
      const text = (task.title + " " + task.age_proof).toLowerCase();

      // VERIFIKACE ČASU - Povolujeme i případy, kdy AI detekuje "today"
      const isFresh = age.includes('hour') || age.includes('min') || age.includes('today') || age.includes('now');
      const isOld = age.includes('day') || age.includes('yesterday') || age.includes('2025');

      if (!isFresh || isOld) {
        rejectedLog.push({ title: task.title, reason: "Není prokazatelně dnešní", age_found: age });
        continue;
      }

      // Rozhodování o typu (PC = Game)
      let finalType = task.type.toLowerCase();
      if (text.includes('pc') || text.includes('steam') || text.includes('game')) finalType = 'game';
      if (text.includes('gpu') || text.includes('cpu') || text.includes('rtx') || text.includes('ryzen')) finalType = 'hardware';

      const { data: dup } = await supabase.from('content_plan').select('id').eq('title', task.title).limit(1);
      if (dup && dup.length > 0) {
        rejectedLog.push({ title: task.title, reason: "Duplicita v DB" });
        continue;
      }

      const { data } = await supabase.from('content_plan').insert({
        title: task.title,
        release_date: now.toISOString().split('T')[0],
        type: finalType,
        status: 'planned'
      }).select();

      if (data) {
        addedCount++;
        successLog.push({ title: task.title, type: finalType, age: task.age_proof });
      }
    }

    return NextResponse.json({ 
      status: 'DONE', 
      added: addedCount, 
      db_zapis: successLog, 
      odmitnuto: rejectedLog 
    });

  } catch (err) {
    return NextResponse.json({ error: err.message });
  }
}
