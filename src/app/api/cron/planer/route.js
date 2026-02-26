import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERPER_API_KEY = process.env.SERPER_API_KEY;

async function getTrends(query, location = "us", language = "en") {
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      q: query, 
      tbs: "qdr:d", 
      gl: location,
      hl: language,
      num: 12 
    })
  });
  const data = await res.json();
  return data.organic || [];
}

export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const now = new Date();
  const dateString = `${now.getDate()}. ${now.getMonth() + 1}. ${now.getFullYear()}`;
  const currentMonth = now.toLocaleString('en-US', { month: 'long' });
  const currentYear = now.getFullYear();

  try {
    const { data: recentPlans } = await supabase.from('content_plan').select('title').order('id', { ascending: false }).limit(30);
    const existingTitles = recentPlans ? recentPlans.map(p => p.title).join(' | ') : 'Zatím žádné články';

    // Vyhledávání novinek
    const hwQuery = `hardware leaks GPU CPU "právě odhaleno" OR "novinka" ${currentYear}`;
    const gameQuery = `breaking gaming news AAA "oznámeno" OR "vyšlo dnes" release leak`;

    const [hwCZ, hwEN, gameCZ, gameEN] = await Promise.all([
      getTrends(hwQuery, "cz", "cs"),
      getTrends(hwQuery, "us", "en"),
      getTrends(gameQuery, "cz", "cs"),
      getTrends(gameQuery, "us", "en")
    ]);

    const combinedTrends = JSON.stringify({ hwCZ, hwEN, gameCZ, gameEN }).substring(0, 15000);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Jsi nemilosrdný šéfredaktor bleskového zpravodajství The Hardware Guru. Dnes je ${dateString}.
          Úkol: Vyber 2x "hardware" (komponenty, čipy, benchmarky) a 2x "game" (hry, konzole, studia).
          Pravidla: Žádné staré věci. Neopakuj témata: [ ${existingTitles} ].
          Vrať striktně JSON: { "plan": [ { "title": "...", "type": "hardware/game", "reason": "..." } ] }`
        },
        { role: "user", content: `Data: ${combinedTrends}` }
      ],
      response_format: { type: "json_object" }
    });

    const newTasks = JSON.parse(completion.choices[0].message.content).plan;

    let addedCount = 0;
    let results = [];

    for (const task of newTasks) {
      // --- INTELIGENTNÍ KÓDOVÁ ROZHODOVAČKA ---
      const textAnalysis = (task.title + " " + task.reason).toLowerCase();
      
      // Klíčová slova, která definují Hardware
      const hwSignals = ['gpu', 'cpu', 'nvidia', 'amd', 'intel', 'rtx', 'ryzen', 'geforce', 'radeon', 'bench', 'ram', 'ssd', 'motherboard', 'čip', 'procesor', 'nanometr', 'nm', 'turing', 'blackwell', 'rdna'];
      // Klíčová slova, která definují Hry
      const gameSignals = ['game', 'hra', 'hry', 'ps5', 'xbox', 'playstation', 'nintendo', 'switch', 'sony', 'studia', 'studio', 'trailer', 'multiplayer', 'rpg', 'fps', 'remake', 'patch', 'dlc', 'plus', 'pass', 'unreal engine'];

      let hwScore = hwSignals.filter(s => textAnalysis.includes(s)).length;
      let gameScore = gameSignals.filter(s => textAnalysis.includes(s)).length;

      // Pokud AI pošle blbost, kód ji na základě bodů opraví
      let finalType = task.type.toLowerCase();
      if (hwScore > gameScore && hwScore > 0) finalType = 'hardware';
      if (gameScore > hwScore && gameScore > 0) finalType = 'game';
      
      // Jistota pro specifické případy (konzole nejsou hardware komponenty v našem pojetí článků)
      if (textAnalysis.includes('ps5') || textAnalysis.includes('xbox') || textAnalysis.includes('playstation')) finalType = 'game';

      // Kontrola duplicity v DB
      const { data: duplicate } = await supabase.from('content_plan').select('id').eq('title', task.title).limit(1);
      if (duplicate && duplicate.length > 0) continue;

      const { data, error } = await supabase.from('content_plan').insert({
        title: task.title,
        release_date: now.toISOString().split('T')[0],
        type: finalType,
        status: 'planned'
      }).select();
      
      if (data) {
        addedCount++;
        results.push({ title: task.title, type: finalType, ai_reason: task.reason });
      }
    }

    return NextResponse.json({ status: 'SUCCESS', added: addedCount, db_zapis: results });

  } catch (err) {
    return NextResponse.json({ error: 'Chyba planovace', details: err.message });
  }
}
