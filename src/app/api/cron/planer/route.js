import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERPER_API_KEY = process.env.SERPER_API_KEY;

// Pomocná funkce pro vyhledávání
async function getTrends(query, location = "us", language = "en") {
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      q: query, 
      tbs: "qdr:d", // VŽDY POSLEDNÍCH 24 HODIN
      gl: location,
      hl: language,
      num: 10 
    })
  });
  const data = await res.json();
  return data.organic || [];
}

export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const now = new Date();
  const currentMonth = now.toLocaleString('en-US', { month: 'long' });
  const currentYear = now.getFullYear();

  try {
    // 1. KROK: HARDWARE - Nejdřív zkusíme CZ, pak Svět
    const hwQueryCZ = `hardware novinky recenze testy GPU CPU MB RAM ${currentYear}`;
    const hwTrendsCZ = await getTrends(hwQueryCZ, "cz", "cs");
    
    const hwQueryEN = `latest hardware leaks benchmarks GPU CPU MB RAM reviews ${currentMonth} ${currentYear} site:videocardz.com OR site:wccftech.com`;
    const hwTrendsEN = await getTrends(hwQueryEN, "us", "en");

    // 2. KROK: GAMING - Nejdřív zkusíme CZ, pak Svět
    const gameQueryCZ = `herní recenze novinky hry ${currentYear}`;
    const gameTrendsCZ = await getTrends(gameQueryCZ, "cz", "cs");

    const gameQueryEN = `latest AAA game reviews releases scores ${currentMonth} ${currentYear} site:ign.com OR site:gamespot.com`;
    const gameTrendsEN = await getTrends(gameQueryEN, "us", "en");

    // Spojíme to pro AI
    const combinedTrends = JSON.stringify({
      hardware: { czech: hwTrendsCZ, world: hwTrendsEN },
      gaming: { czech: gameTrendsCZ, world: gameTrendsEN }
    }).substring(0, 15000);

    // 3. AI ANALÝZA - S jasným zadáním priority
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Jsi šéfredaktor The Hardware Guru. Je ${now.getDate()}. ${currentMonth} ${currentYear}.
          Máš k dispozici data z posledních 24 hodin z Česka i ze světa.
          
          TVOJE PRAVIDLA:
          1. PRIORITA: Pokud existuje ČESKÝ zdroj z posledních 24h o daném tématu, použij ho jako primární.
          2. DOPLNĚNÍ: Pokud v Česku nic nového není, použij světové leaky (world data).
          3. VÝBĚR: Vyber 2x HW (GPU/CPU/MB/RAM) a 2x Hry.
          
          Vrať JSON: { "plan": [ { "title": "...", "type": "game/hardware", "release_date": "${now.toISOString().split('T')[0]}" } ] }`
        },
        { role: "user", content: `Data k analýze: ${combinedTrends}` }
      ],
      response_format: { type: "json_object" }
    });

    const newTasks = JSON.parse(completion.choices[0].message.content).plan;

    // 4. ZÁPIS DO DB
    let addedCount = 0;
    for (const task of newTasks) {
      const { error } = await supabase.from('content_plan').insert({
        title: task.title,
        release_date: task.release_date,
        type: task.type,
        status: 'planned'
      });
      if (!error) addedCount++;
    }

    return NextResponse.json({ 
      status: 'SUCCESS', 
      added: addedCount,
      articles: newTasks.map(t => t.title),
      note: "Prioritizovány české zdroje < 24h."
    });

  } catch (err) {
    return NextResponse.json({ error: 'Chyba planovace', details: err.message });
  }
}
