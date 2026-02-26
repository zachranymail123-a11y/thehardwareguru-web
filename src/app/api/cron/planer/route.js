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
    body: JSON.stringify({ q: query, tbs: "qdr:h12", num: 20 })
  });
  const data = await res.json();
  return data.organic || [];
}

export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const now = new Date();
  const todayISO = now.toISOString().split('T')[0];

  try {
    // 1. SBĚR DAT ZE SERPERU
    const sources = "site:videocardz.com OR site:techpowerup.com OR site:wccftech.com OR site:ign.com OR site:vgc.com OR site:pcgamer.com OR site:tomshardware.com";
    const [hwRaw, gameRaw] = await Promise.all([
      getRawTodayData(`${sources} hardware GPU CPU leak benchmark`),
      getRawTodayData(`${sources} game "official" OR "announcement" OR "trailer"`)
    ]);

    const rawList = [
      ...hwRaw.map(a => ({ ...a, type: 'hardware' })),
      ...gameRaw.map(a => ({ ...a, type: 'game' }))
    ];

    // 2. NAČTENÍ HISTORIE (48h) PRO TVRDOU KONTROLU DUPLICITY
    const { data: existing } = await supabase
      .from('content_plan')
      .select('title')
      .gte('release_date', new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString().split('T')[0]);
    
    // Vytvoření blacklistu z existujících názvů (bez mezer v proměnné!)
    const usedPhrases = existing ? existing.map(e => e.title.toLowerCase().substring(0, 15)) : [];

    let addedCount = 0;
    let log = [];

    for (const article of rawList) {
      if (addedCount >= 4) break;

      // Unikátní otisk z anglického titulku
      const slug = article.title.toLowerCase().substring(0, 15);
      
      // KONTROLA DUPLICITY PŘED VOLÁNÍM AI
      if (usedPhrases.some(p => slug.includes(p) || p.includes(slug))) continue;

      // 3. PŘEKLAD PŘES OPENAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Jsi překladatel pro Hardware Guru. Udělej z anglického titulku úderný český název. Vrať JSON: { \"title\": \"...\" }"
          },
          { role: "user", content: `Original: ${article.title}` }
        ],
        response_format: { type: "json_object" }
      });

      const processed = JSON.parse(completion.choices[0].message.content);
      const czechTitle = processed.title.trim();

      // ZÁPIS DO DATABÁZE
      const { data } = await supabase.from('content_plan').insert({
        title: czechTitle,
        release_date: todayISO,
        type: article.type,
        status: 'planned'
      }).select();

      if (data) {
        addedCount++;
        usedPhrases.push(slug); // Přidáme slug, aby se neopakovalo téma v rámci jednoho běhu
        log.push({ original: article.title, czech: czechTitle });
      }
    }

    return NextResponse.json({ status: 'DONE', added: addedCount, db_zapis: log });

  } catch (err) {
    return NextResponse.json({ error: err.message });
  }
}
