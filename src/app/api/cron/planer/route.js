import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERPER_API_KEY = process.env.SERPER_API_KEY;

async function getCategoryData(query) {
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: query, tbs: "qdr:d,sbd:1", num: 15 })
  });
  const data = await res.json();
  return data.organic || [];
}

export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const now = new Date();
  const todayISO = now.toISOString().split('T')[0];

  let debug = {
    game: { found: 0, after_duplicate_filter: 0 },
    hw: { found: 0, after_duplicate_filter: 0 },
    errors: []
  };

  try {
    const gameSources = "(site:games.tiscali.cz OR site:indian-tv.cz OR site:eurogamer.net)";
    const hwSources = "(site:guru3d.com OR site:pctuning.cz OR site:tomshardware.com)";
    
    // Paralelní sběr dat ze Serperu
    const [gameRaw, hwRaw] = await Promise.all([
      getCategoryData(`${gameSources} news`),
      getCategoryData(`${hwSources} news`)
    ]);

    debug.game.found = gameRaw.length;
    debug.hw.found = hwRaw.length;

    const { data: existing } = await supabase.from('content_plan').select('source_url');
    const usedUrls = new Set(existing ? existing.map(r => r.source_url) : []);

    let log = [];

    const processCategoryParallel = async (rawItems, type) => {
      let validForProcessing = rawItems
        .filter(item => !usedUrls.has(item.link))
        .slice(0, 3);
      
      if (type === 'game') debug.game.after_duplicate_filter = validForProcessing.length;
      if (type === 'hardware') debug.hw.after_duplicate_filter = validForProcessing.length;

      // PARALELNÍ PŘEKLAD A ZÁPIS
      await Promise.all(validForProcessing.map(async (item) => {
        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              { role: "system", content: "Jsi překladatel. Udělej z titulku úderný český název. JSON: { \"title\": \"...\" }" },
              { role: "user", content: item.title }
            ],
            response_format: { type: "json_object" }
          });

          const czechTitle = JSON.parse(completion.choices[0].message.content).title;

          const { data, error } = await supabase.from('content_plan').insert({
            title: czechTitle,
            release_date: todayISO,
            type: type,
            status: 'planned',
            source_url: item.link 
          }).select();

          if (data) {
            log.push({ title: czechTitle, type: type });
          } else if (error) {
            debug.errors.push(`DB Error (${type}): ${error.message}`);
          }
        } catch (e) {
          debug.errors.push(`AI Error (${type}): ${e.message}`);
        }
      }));
    };

    // Odpálíme obě kategorie naráz
    await Promise.all([
      processCategoryParallel(gameRaw, 'game'),
      processCategoryParallel(hwRaw, 'hardware')
    ]);

    return NextResponse.json({ 
      status: 'DONE', 
      debug: debug,
      items: log 
    });

  } catch (err) {
    return NextResponse.json({ error: err.message, debug: debug });
  }
}
