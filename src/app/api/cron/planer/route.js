import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERPER_API_KEY = process.env.SERPER_API_KEY;

// Funkce pro agresivní vyhledávání napříč elitními zdroji
async function getDeepTrends(query) {
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: query, tbs: "qdr:d", num: 30 })
  });
  const data = await res.json();
  return data.organic || [];
}

export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const now = new Date();
  const dateStr = `${now.getDate()}. ${now.getMonth() + 1}. ${now.getFullYear()}`;

  try {
    // Načteme historii, abychom nepsali o stejném dvakrát
    const { data: history } = await supabase.from('content_plan').select('title').order('id', { ascending: false }).limit(60);
    const blacklisted = history ? history.map(h => h.title).join(' | ') : 'Nic';

    const sources = "site:videocardz.com OR site:techpowerup.com OR site:wccftech.com OR site:ign.com OR site:theverge.com OR site:vgc.com OR site:pcgamer.com OR site:tomshardware.com OR site:eurogamer.net";

    // Hledáme železo a hry odděleně, abychom měli dostatek materiálu pro obojí
    const [hwData, gameData] = await Promise.all([
      getDeepTrends(`${sources} "RTX" OR "Ryzen" OR "Intel" OR "benchmark" OR "leak" OR "specs" 2026`),
      getDeepTrends(`${sources} "game" OR "PC news" OR "Steam" OR "announcement" OR "trailer" 2026`)
    ]);

    const combinedContext = JSON.stringify({ hardware: hwData, gaming: gameData }).substring(0, 18000);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Jsi šéfredaktor bleskovek The Hardware Guru. Dnes je: ${dateStr}.
          
          TVOJE POVINNOST (BEZ VÝMLUV):
          1. Vyber PŘESNĚ 2x "hardware" a PŘESNĚ 2x "game". Celkem 4 unikátní články.
          2. HARDWARE: Zaměř se na čipy, GPU, CPU, leaky výkonu, TDP, technologie (DLSS/FSR).
          3. GAME: Zaměř se na PC novinky, Steam, konzole, oznámení her a velké updaty.
          4. PŘÍSNÁ ANTI-DUPLICITA: NESMÍŠ vybrat nic z tohoto seznamu: [ ${blacklisted} ]. Pokud tam téma je, musíš najít jiné!
          
          Vrať JSON: { "plan": [ { "title": "Úderný český název", "type": "hardware/game", "reason": "Důkaz, že je to dnešní pecka" } ] }`
        },
        { role: "user", content: `Data k analýze: ${combinedContext}` }
      ],
      response_format: { type: "json_object" }
    });

    const tasks = JSON.parse(completion.choices[0].message.content).plan;
    let addedCount = 0;
    let log = [];

    for (const task of tasks) {
      const text = (task.title + " " + task.reason).toLowerCase();
      
      // --- NEPRŮSTŘELNÁ KÓDOVÁ ROZHODOVAČKA ---
      const hwSignals = ['gpu', 'cpu', 'nvidia', 'amd', 'intel', 'rtx', 'ryzen', 'benchmark', 'leak', 'specs', 'vram', 'ti', 'chip', 'nm', 'socket', 'zen', 'blackwell'];
      const gameSignals = ['game', 'hra', 'pc', 'steam', 'epic', 'ps5', 'xbox', 'playstation', 'nintendo', 'switch', 'studio', 'trailer', 'patch', 'update', 'plus', 'pass'];

      let hwScore = hwSignals.filter(s => text.includes(s)).length;
      let gameScore = gameSignals.filter(s => text.includes(s)).length;

      let finalType = task.type.toLowerCase();
      
      // Pokud kód najde jasné HW signály, přebije línou AI
      if (hwScore > gameScore && hwScore > 0) finalType = 'hardware';
      if (gameScore > hwScore && gameScore > 0) finalType = 'game';
      
      // Konzole, platformy a služby jsou vždy GAME, pokud tam není vyloženě "vnitřní čip"
      if ((text.includes('pc') || text.includes('steam') || text.includes('ps5') || text.includes('xbox')) && hwScore === 0) {
        finalType = 'game';
      }

      // Kontrola duplicity těsně před zápisem (podle názvu)
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
        log.push({ title: task.title, type: finalType });
      }
    }

    return NextResponse.json({ status: 'DONE', added: addedCount, db_zapis: log });

  } catch (err) {
    return NextResponse.json({ error: 'Chyba planovace', details: err.message });
  }
}
