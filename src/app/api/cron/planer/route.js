import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERPER_API_KEY = process.env.SERPER_API_KEY;

async function getRawTodayData(query) {
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      q: query, 
      tbs: "qdr:h12", 
      num: 15 
    })
  });
  const data = await res.json();
  return data.organic || [];
}

export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const now = new Date();
  const todayISO = now.toISOString().split('T')[0];

  try {
    // 1. NAČTENÍ VŠEHO, CO UŽ DNES V DB JE (Tvrdá pojistka proti duplicitám)
    const { data: existingToday } = await supabase
      .from('content_plan')
      .select('title')
      .gte('release_date', todayISO);
    
    const blacklist = existingToday ? existingToday.map(e => e.title.toLowerCase()) : [];

    const sources = "site:videocardz.com OR site:techpowerup.com OR site:wccftech.com OR site:ign.com OR site:vgc.com OR site:pcgamer.com OR site:tomshardware.com";
    
    const [hwRaw, gameRaw] = await Promise.all([
      getRawTodayData(`${sources} hardware GPU CPU leak benchmark`),
      getRawTodayData(`${sources} game "official" OR "announcement" OR "trailer"`)
    ]);

    const rawList = [
      ...hwRaw.map(a => ({ ...a, type: 'hardware' })),
      ...gameRaw.map(a => ({ ...a, type: 'game' }))
    ];

    let addedCount = 0;
    let log = [];

    for (const article of rawList) {
      if (addedCount >= 4) break;

      // Kontrola, jestli už v DB není anglický originál nebo podobný název
      const isDuplicate = blacklist.some(existing => 
        existing.includes(article.title.toLowerCase().substring(0, 15)) || 
        article.title.toLowerCase().includes(existing.substring(0, 15))
      );

      if (isDuplicate) continue;

      // AI PŘEKLAD
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Jsi překladatel pro Hardware Guru. Udělej z anglického titulku úderný český název. Vrať striktně JSON: { \"title\": \"...\" }"
          },
          { role: "user", content: `Original Title: ${article.title}\nSnippet: ${article.snippet}` }
        ],
        response_format: { type: "json_object" }
      });

      const processed = JSON.parse(completion.choices[0].message.content);
      const czechTitle = processed.title.trim();

      // Sekundární kontrola českého názvu
      if (blacklist.includes(czechTitle.toLowerCase())) continue;

      // ZÁPIS
      const { data } = await supabase.from('content_plan').insert({
        title: czechTitle,
        release_date: todayISO,
        type: article.type,
        status: 'planned'
      }).select();

      if (data) {
        addedCount++;
        blacklist.push(czechTitle.toLowerCase());
        log.push({ original: article.title, czech: czechTitle });
      }
    }

    return NextResponse.json({ status: 'DONE', added: addedCount, db_zapis: log });

  } catch (err) {
    return NextResponse.json({ error: err.message });
  }
}
