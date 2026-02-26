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
      num: 15 // Větší vzorek pro výběr unikátů
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
    const sources = "site:videocardz.com OR site:techpowerup.com OR site:wccftech.com OR site:ign.com OR site:vgc.com OR site:pcgamer.com OR site:tomshardware.com";
    
    const [hwRaw, gameRaw] = await Promise.all([
      getRawTodayData(`${sources} hardware GPU CPU leak benchmark`),
      getRawTodayData(`${sources} game "official" OR "announcement" OR "trailer"`)
    ]);

    // Spojíme a přidáme typy
    const rawList = [
      ...hwRaw.map(a => ({ ...a, type: 'hardware' })),
      ...gameRaw.map(a => ({ ...a, type: 'game' }))
    ];

    if (rawList.length === 0) return NextResponse.json({ status: 'CHYBA', message: 'Google prázdný' });

    // NAČTENÍ EXISTUJÍCÍCH TITULŮ (Anglických i Českých) PRO KONTEXT
    const { data: existing } = await supabase
      .from('content_plan')
      .select('title')
      .gte('release_date', todayISO);
    
    const blacklistedStr = existing ? existing.map(e => e.title.toLowerCase()).join(' | ') : '';

    let addedCount = 0;
    let log = [];

    for (const article of rawList) {
      if (addedCount >= 4) break; // Chceme 2+2

      const originalTitle = article.title.toLowerCase();

      // 1. KONTROLA DUPLICITY ORIGINÁLU (Před překladem)
      // Pokud už v DB máme něco s podobným názvem (nebo identickým originálem), skip.
      if (blacklistedStr.includes(originalTitle.substring(0, 20))) continue;

      // 2. PŘEKLAD A FORMÁTOVÁNÍ
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

      // 3. KONTROLA DUPLICITY ČESKÉHO VÝSLEDKU
      const { data: dupCheck } = await supabase
        .from('content_plan')
        .select('id')
        .ilike('title', `%${czechTitle.substring(0, 15)}%`) // Hledáme i částečnou shodu
        .limit(1);

      if (dupCheck && dupCheck.length > 0) continue;

      // 4. ZÁPIS
      const { data, error } = await supabase.from('content_plan').insert({
        title: czechTitle,
        release_date: todayISO,
        type: article.type,
        status: 'planned'
      }).select();

      if (data) {
        addedCount++;
        log.push({ original: article.title, czech: czechTitle });
      }
    }

    return NextResponse.json({ status: 'DONE', added: addedCount, db_zapis: log });

  } catch (err) {
    return NextResponse.json({ error: err.message });
  }
}
