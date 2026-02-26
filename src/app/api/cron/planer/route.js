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
      num: 10 
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

    const hwQueryCZ = `hardware "právě odhaleno" OR "únik" OR "novinka" GPU CPU "${now.getMonth() + 1}/${currentYear}"`;
    const hwTrendsCZ = await getTrends(hwQueryCZ, "cz", "cs");
    
    const hwQueryEN = `breaking hardware leaks announcements GPU CPU reviews "${currentMonth} ${currentYear}" site:videocardz.com OR site:tomshardware.com`;
    const hwTrendsEN = await getTrends(hwQueryEN, "us", "en");

    const gameQueryCZ = `herní bleskovky "oznámeno" OR "vyšlo dnes" recenze "${now.getMonth() + 1}/${currentYear}"`;
    const gameTrendsCZ = await getTrends(gameQueryCZ, "cz", "cs");

    const gameQueryEN = `breaking AAA game news announcements leaks reviews "${currentMonth} ${currentYear}" site:ign.com OR site:insider-gaming.com`;
    const gameTrendsEN = await getTrends(gameQueryEN, "us", "en");

    const combinedTrends = JSON.stringify({
      hardware: { czech: hwTrendsCZ, world: hwTrendsEN },
      gaming: { czech: gameTrendsCZ, world: gameTrendsEN }
    }).substring(0, 15000);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Jsi nemilosrdný šéfredaktor bleskového zpravodajství The Hardware Guru. Dnes je ${dateString}.
          
          TVOJE JEDINÁ PRÁCE JE HLEDAT MEGA NOVINKY A LEAKY Z POSLEDNÍCH 24 HODIN!
          
          PRAVIDLA PŘEŽITÍ:
          1. ZÁKAZ STARÝCH SRAČEK: Vyber jen to, co se stalo DNES. Žádné staré hry!
          2. KATEGORIE: Vyber PŘESNĚ 2x "hardware" a PŘESNĚ 2x "game". Nesmíš to splést!
          3. ANTI-DUPLICITA: Neopakuj články: [ ${existingTitles} ].
          
          Vrať striktně JSON: 
          { 
            "plan": [ 
              { "title": "Název článku", "type": "hardware", "reason": "Důvod proč dnes...", "release_date": "${now.toISOString().split('T')[0]}" },
              { "title": "Název článku", "type": "game", "reason": "Důvod proč dnes...", "release_date": "${now.toISOString().split('T')[0]}" }
            ] 
          }`
        },
        { role: "user", content: `Data: ${combinedTrends}` }
      ],
      response_format: { type: "json_object" }
    });

    const newTasks = JSON.parse(completion.choices[0].message.content).plan;

    let addedCount = 0;
    let dbErrors = [];
    let insertedRows = [];

    for (const task of newTasks) {
      // LEPŠÍ KONTROLA TYPU
      const rawType = task.type.toLowerCase();
      const safeType = (rawType.includes('game') || rawType.includes('hra') || rawType.includes('hry')) ? 'game' : 'hardware';

      const { data: checkDuplicate } = await supabase
        .from('content_plan')
        .select('id')
        .eq('title', task.title)
        .limit(1);

      if (checkDuplicate && checkDuplicate.length > 0) {
        dbErrors.push({ title: task.title, error_message: "DUPLICITA - Zahozeno." });
        continue; 
      }

      const { data, error } = await supabase.from('content_plan').insert({
        title: task.title,
        release_date: task.release_date,
        type: safeType,
        status: 'planned'
      }).select();
      
      if (error) {
        dbErrors.push({ title: task.title, error_message: error.message });
      } else if (data && data.length > 0) {
        addedCount++;
        insertedRows.push({ ...data[0], ai_reason: task.reason }); 
      }
    }

    return NextResponse.json({ 
      status: dbErrors.length > 0 ? 'VAROVANI' : 'SUCCESS', 
      added: addedCount,
      db_zapis: insertedRows,
      chyby: dbErrors
    });

  } catch (err) {
    return NextResponse.json({ error: 'Chyba planovace', details: err.message });
  }
}
