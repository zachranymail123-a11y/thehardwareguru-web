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
      tbs: "qdr:d", // Striktně posledních 24 hodin
      num: 20 
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

    // ELITNÍ WHITELIST - ZDROJE, KTERÉ JSOU ZÁRUKOU TOP NOVINEK
    const sources = "site:videocardz.com OR site:techpowerup.com OR site:wccftech.com OR site:ign.com OR site:theverge.com OR site:vgc.com OR site:pcgamer.com OR site:eurogamer.net OR site:gsmarena.com OR site:9to5google.com OR site:tomshardware.com";
    
    const [hwResults, gameResults] = await Promise.all([
      getTrends(`${sources} hardware leak benchmark GPU CPU "just announced" 2026`),
      getTrends(`${sources} game "official announcement" release review trailer "breaking news"`)
    ]);

    const combinedTrends = JSON.stringify({ hwResults, gameResults }).substring(0, 15000);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Jsi špičkový šéfredaktor The Hardware Guru. Dnes je: ${dateStr}.
          ÚKOL: Vyber 2x "hardware" a 2x "game". Ber jen ty největší BOMBY dneška.
          
          FILTRAČNÍ PROTOKOL:
          1. VIRABILITY RATING (1-10): Ohodnoť hype. Pokud je to pod 8 (všední zpráva), ZAHODIT.
          2. VERIFIKACE: Musíš uvést, na kterém elitním webu je to potvrzeno a že je to opravdu z dneška.
          3. ZÁKAZ HALUCINACÍ: Nevymýšlej si pokračování her nebo neexistující hardware!
          4. PC MASTER RACE: Nezapomínej na PC scénu, Steam a Windows gaming.
          
          Vrať JSON: { "plan": [ { "title": "Úderný český název", "type": "game/hardware", "virability": 9, "verification": "Zdroj + čas potvrzení", "reason": "..." } ] }`
        },
        { role: "user", content: `Data z elitních zdrojů: ${combinedTrends}` }
      ],
      response_format: { type: "json_object" }
    });

    const tasksFromAi = JSON.parse(completion.choices[0].message.content).plan;
    let addedCount = 0;
    let verifiedReports = [];

    for (const task of tasksFromAi) {
      // FILTR: Pustíme jen ty největší pecky (rating 8+)
      if (task.virability < 8) continue;

      const analysisText = (task.title + " " + task.verification + " " + task.reason).toLowerCase();
      
      // --- NEPRŮSTŘELNÁ KÓDOVÁ ROZHODOVAČKA ---
      const hwSignals = [
        'gpu', 'cpu', 'nvidia', 'amd', 'intel', 'rtx', 'ryzen', 'bench', 'ram', 'ssd', 
        'motherboard', 'čip', 'procesor', 'nanometr', 'nm', 'ti', 'dlss', 'fsr', 
        'vram', 'socket', 'asus', 'msi', 'gigabyte', 'evga', 'sapphire', 'turing', 'blackwell'
      ];
      const gameSignals = [
        'game', 'hra', 'hry', 'pc gaming', 'steam', 'epic', 'ps5', 'xbox', 'playstation', 
        'nintendo', 'switch', 'studio', 'trailer', 'multiplayer', 'rpg', 'fps', 
        'remake', 'patch', 'update', 'plus', 'pass', 'unreal engine', 'cd projekt', 'ubisoft'
      ];

      let hwScore = hwSignals.filter(s => analysisText.includes(s)).length;
      let gameScore = gameSignals.filter(s => analysisText.includes(s)).length;

      let finalType = task.type.toLowerCase();
      
      // Pokud je v textu "PC" nebo "Steam" a zároveň tam není grafika/procesor, je to GAME
      if ((analysisText.includes('pc') || analysisText.includes('steam')) && hwScore === 0) {
        finalType = 'game';
      } else if (hwScore > gameScore && hwScore > 0) {
        finalType = 'hardware';
      } else if (gameScore > hwScore && gameScore > 0) {
        finalType = 'game';
      }
      
      // Konzole a služby (PS Plus/Game Pass) jsou vždy GAME
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
        verifiedReports.push({ title: task.title, type: finalType, virability: task.virability, source: task.verification });
      }
    }

    return NextResponse.json({ status: 'SUCCESS', added: addedCount, db_zapis: verifiedReports });

  } catch (err) {
    return NextResponse.json({ error: 'Chyba planovace', details: err.message });
  }
}
