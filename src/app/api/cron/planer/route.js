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
    body: JSON.stringify({ 
      q: query, 
      tbs: "qdr:d", 
      num: 25 
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
    const { data: recentPlans } = await supabase.from('content_plan').select('title').order('id', { ascending: false }).limit(40);
    const existingTitles = recentPlans ? recentPlans.map(p => p.title).join(' | ') : 'Zatím nic';

    const sources = "site:videocardz.com OR site:techpowerup.com OR site:wccftech.com OR site:ign.com OR site:theverge.com OR site:vgc.com OR site:pcgamer.com OR site:tomshardware.com OR site:gsmarena.com";
    
    // Agresivnější dotaz na HW, aby to AI "nutilo" najít železo
    const [hwResults, gameResults] = await Promise.all([
      getTrends(`${sources} hardware "leak" OR "benchmark" OR "specs" OR "TDP" GPU CPU 2026`),
      getTrends(`${sources} game "official" OR "review" OR "announcement" 2026`)
    ]);

    const combinedTrends = JSON.stringify({ hwResults, gameResults }).substring(0, 15000);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Jsi šéfredaktor The Hardware Guru. Dnes je: ${dateStr}.
          
          ZÁSADNÍ PRAVIDLO: Musíš vybrat PŘESNĚ 2x "hardware" a PŘESNĚ 2x "game".
          - Pokud je v datech málo HW novinek, zaměř se na leaky specifikací, nové ovladače nebo benchmarky.
          - NESMÍŠ nahradit hardware slot hrou!
          - Rating Virability (8-10): Ber jen věci, co hýbou internetem.
          - Neopakuj: [ ${existingTitles} ].
          
          Vrať JSON: { "plan": [ { "title": "Český název", "type": "hardware/game", "virability": 9, "verification": "Kde to psali", "reason": "..." } ] }`
        },
        { role: "user", content: `Data: ${combinedTrends}` }
      ],
      response_format: { type: "json_object" }
    });

    const tasksFromAi = JSON.parse(completion.choices[0].message.content).plan;
    let addedCount = 0;
    let verifiedReports = [];

    for (const task of tasksFromAi) {
      if (task.virability < 8) continue;

      const analysisText = (task.title + " " + task.verification + " " + task.reason).toLowerCase();
      
      const hwSignals = ['gpu', 'cpu', 'nvidia', 'amd', 'intel', 'rtx', 'ryzen', 'bench', 'ram', 'ssd', 'motherboard', 'čip', 'procesor', 'nanometr', 'nm', 'vram', 'socket', 'zen', 'blackwell'];
      const gameSignals = ['game', 'hra', 'pc gaming', 'steam', 'ps5', 'xbox', 'playstation', 'nintendo', 'switch', 'studio', 'trailer', 'patch', 'remake', 'release'];

      let hwScore = hwSignals.filter(s => analysisText.includes(s)).length;
      let gameScore = gameSignals.filter(s => analysisText.includes(s)).length;

      let finalType = task.type.toLowerCase();
      
      // Kódová oprava - pokud AI lže o kategorii, kód ji přebije
      if (hwScore > gameScore && hwScore > 0) finalType = 'hardware';
      if (gameScore > hwScore && gameScore > 0) finalType = 'game';
      
      // Specifické platformy
      if (analysisText.includes('ps5') || analysisText.includes('xbox') || analysisText.includes('playstation') || analysisText.includes('pass')) {
        finalType = 'game';
      }

      const { data: duplicate } = await supabase.from('content_plan').select('id').eq('title', task.title).limit(1);
      if (duplicate && duplicate.length > 0) continue;

      const { data } = await supabase.from('content_plan').insert({
        title: task.title,
        release_date: now.toISOString().split('T')[0],
        type: finalType,
        status: 'planned'
      }).select();
      
      if (data) {
        addedCount++;
        verifiedReports.push({ title: task.title, type: finalType, source: task.verification });
      }
    }

    return NextResponse.json({ status: 'SUCCESS', added: addedCount, db_zapis: verifiedReports });

  } catch (err) {
    return NextResponse.json({ error: 'Chyba planovace', details: err.message });
  }
}
