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
      tbs: "qdr:d", // Striktně posledních 24 hodin
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
  
  // Přidáno přesné datum pro lepší orientaci AI
  const dateString = `${now.getDate()}. ${now.getMonth() + 1}. ${now.getFullYear()}`;
  const currentMonth = now.toLocaleString('en-US', { month: 'long' });
  const currentYear = now.getFullYear();

  try {
    // Vytáhneme posledních 30 naplánovaných nebo vydaných témat pro kontrolu duplicit
    const { data: recentPlans } = await supabase.from('content_plan').select('title').order('id', { ascending: false }).limit(30);
    const existingTitles = recentPlans ? recentPlans.map(p => p.title).join(' | ') : 'Zatím žádné články';

    // Agresivnější vyhledávací fráze s vynuceným aktuálním rokem a měsícem!
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
          content: `Jsi nemilosrdný šéfredaktor bleskového zpravodajství The Hardware Guru. Přesné dnešní datum je: ${dateString}.
          
          TVOJE JEDINÁ PRÁCE JE HLEDAT MEGA NOVINKY A LEAKY Z POSLEDNÍCH 24 HODIN!
          
          PRAVIDLA PŘEŽITÍ:
          1. ZÁKAZ STARÝCH SRAČEK (KRITICKÉ): Nesmíš vybrat článek o hrách nebo HW, které už dávno vyšly. Jestli vybereš zprávu starší než 2 dny, vyhodím tě. Hledej slova jako "dnes", "včera", "právě odhaleno".
          2. OBHÁJENÍ: U každého vybraného tématu musíš do pole 'reason' napsat, proč je to novinka PRÁVĚ Z DNEŠKA.
          3. TÉMATA: Vyber 2x HARDWARE (leaky nových grafik, dnešní recenze) a 2x HRY (mega oznámení, recenze her co VYŠLY DNES).
          4. ANTI-DUPLICITA: Zde jsou články, co už máme: [ ${existingTitles} ]. NESMÍŠ vybrat NIC, co se tomu jen trochu podobá!
          
          Vrať striktně JSON (nezapomeň na pole 'reason'!): 
          { "plan": [ { "title": "...", "type": "hardware", "reason": "Dnes na redditu unikly specifikace...", "release_date": "${now.toISOString().split('T')[0]}" } ] }
          DŮLEŽITÉ: Názvy článků ať jsou v češtině, úderné a clickbaitové.`
        },
        { role: "user", content: `Data z internetu za posledních 24h: ${combinedTrends}` }
      ],
      response_format: { type: "json_object" }
    });

    const newTasks = JSON.parse(completion.choices[0].message.content).plan;

    // Zápis do databáze s ochranou duplicit
    let addedCount = 0;
    let dbErrors = [];
    let insertedRows = [];

    for (const task of newTasks) {
      const safeType = task.type.includes('game') ? 'game' : 'hardware';

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
        // Přidáme důvod do logu, ať vidíme, jak se AI obhájila
        insertedRows.push({ ...data[0], ai_reason: task.reason }); 
      }
    }

    return NextResponse.json({ 
      status: dbErrors.length > 0 ? 'DOKONCENO_S_VAROVANIM' : 'SUCCESS', 
      added: addedCount,
      db_skutecne_zapsala: insertedRows,
      zahozeno_nebo_chyby: dbErrors
    });

  } catch (err) {
    return NextResponse.json({ error: 'Chyba planovace', details: err.message });
  }
}
