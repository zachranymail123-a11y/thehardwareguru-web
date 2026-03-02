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

  try {
    // 1. ČISTÉ DOTAZY PRO TVOJE ZDROJE
    const gameSources = "(site:games.tiscali.cz OR site:indian-tv.cz OR site:eurogamer.net)";
    const hwSources = "(site:guru3d.com OR site:pctuning.cz OR site:tomshardware.com)";
    
    // Zjednodušená klíčová slova pro lepší hit-rate
    const [gameRaw, hwRaw] = await Promise.all([
      getCategoryData(`${gameSources} hry news`),
      getCategoryData(`${hwSources} hardware news`)
    ]);

    // 2. KONTROLA DUPLICIT (Správně podle tvé DB - source_url)
    const { data: existing } = await supabase.from('content_plan').select('source_url');
    const usedUrls = new Set(existing ? existing.map(r => r.source_url) : []);

    let log = [];

    const processCategory = async (rawItems, type) => {
      let count = 0;
      for (const item of rawItems) {
        if (count >= 3) break; 
        
        // Zde musí být item.link (to co vrací Serper)
        if (usedUrls.has(item.link)) continue; 

        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: "Jsi překladatel. Udělej z titulku úderný český název. JSON: { \"title\": \"...\" }" },
            { role: "user", content: item.title }
          ],
          response_format: { type: "json_object" }
        });

        const czechTitle = JSON.parse(completion.choices[0].message.content).title;

        // Vkládáme do tvého sloupce source_url
        const { data, error } = await supabase.from('content_plan').insert({
          title: czechTitle,
          release_date: todayISO,
          type: type,
          status: 'planned',
          source_url: item.link 
        }).select();

        if (data) {
          usedUrls.add(item.link);
          log.push({ title: czechTitle, type: type });
          count++;
        }
      }
    };

    await processCategory(gameRaw, 'game');
    await processCategory(hwRaw, 'hardware');

    return NextResponse.json({ status: 'DONE', items: log });

  } catch (err) {
    return NextResponse.json({ error: err.message });
  }
}
