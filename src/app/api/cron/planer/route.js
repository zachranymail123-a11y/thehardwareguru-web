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
    body: JSON.stringify({ q: query, tbs: "qdr:h12", num: 10 })
  });
  const data = await res.json();
  return data.organic || [];
}

export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const now = new Date();
  const todayISO = now.toISOString().split('T')[0];

  try {
    // 1. SBĚR DAT - STRIKTNĚ ODDĚLENÉ ZDROJE
    const hwSources = "site:videocardz.com OR site:techpowerup.com OR site:wccftech.com";
    const gameSources = "site:ign.com OR site:vgc.com OR site:pcgamer.com OR site:eurogamer.net";
    
    const [hwRaw, gameRaw] = await Promise.all([
      getCategoryData(`${hwSources} hardware GPU CPU leak benchmark`),
      getCategoryData(`${gameSources} game official announcement trailer news`)
    ]);

    // 2. NAČTENÍ HISTORIE URL (Pojistka proti duplicitám)
    const { data: existing } = await supabase.from('content_plan').select('source_url');
    const usedUrls = new Set(existing ? existing.map(r => r.source_url) : []);

    let log = [];

    // Funkce pro zpracování jedné kategorie
    const processCategory = async (rawItems, type) => {
      let count = 0;
      for (const item of rawItems) {
        if (count >= 2) break; // Chceme přesně 2 na kategorii
        if (usedUrls.has(item.link)) continue; // Tvrdý stop duplicity přes URL

        // AI jen přeloží titulek, o ničem jiném nerozhoduje
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: "Jsi překladatel. Udělej z anglického titulku úderný český název. JSON: { \"title\": \"...\" }" },
            { role: "user", content: item.title }
          ],
          response_format: { type: "json_object" }
        });

        const czechTitle = JSON.parse(completion.choices[0].message.content).title;

        const { data } = await supabase.from('content_plan').insert({
          title: czechTitle,
          release_date: todayISO,
          type: type,
          status: 'planned',
          source_url: item.link // Ukládáme URL pro příští kontrolu
        }).select();

        if (data) {
          usedUrls.add(item.link);
          log.push({ title: czechTitle, type: type });
          count++;
        }
      }
    };

    // Spustíme obě kategorie nezávisle
    await processCategory(hwRaw, 'hardware');
    await processCategory(gameRaw, 'game');

    return NextResponse.json({ status: 'DONE', items: log });

  } catch (err) {
    return NextResponse.json({ error: err.message });
  }
}
