import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERPER_API_KEY = process.env.SERPER_API_KEY;

// Pomocná funkce pro vyčištění textu na klíčová slova
function getKeywords(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3);
}

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
    // 1. NAČTENÍ VŠEHO DNEŠNÍHO (Tvrdá data pro srovnání)
    const { data: existingToday } = await supabase
      .from('content_plan')
      .select('title')
      .gte('release_date', todayISO);
    
    // Vytvoříme sadu klíčových slov ze všech dnešních článků
    const forbiddenKeywords = new Set(
      existingToday ? existingToday.flatMap(e => getKeywords(e.title)) : []
    );

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

      // 2. SÉMANTICKÁ KONTROLA ORIGINÁLU
      const articleKeywords = getKeywords(article.title);
      // Pokud se víc než 50% klíčových slov shodne s tím, co už máme, je to duplicita
      const matches = articleKeywords.filter(word => forbiddenKeywords.has(word)).length;
      if (matches > (articleKeywords.length * 0.5)) continue;

      // 3. AI PŘEKLAD
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
      const czechKeywords = getKeywords(czechTitle);

      // 4. POSLEDNÍ POJISTKA NA ČESKÝ NÁZEV
      const czechMatches = czechKeywords.filter(word => forbiddenKeywords.has(word)).length;
      if (czechMatches > (czechKeywords.length * 0.4)) continue;

      // ZÁPIS DO DB
      const { data, error } = await supabase.from('content_plan').insert({
        title: czechTitle,
        release_date: todayISO,
        type: article.type,
        status: 'planned'
      }).select();

      if (data) {
        addedCount++;
        // Ihned přidáme klíčová slova do blacklistu, aby další článek v cyklu nebyl stejný
        czechKeywords.forEach(word => forbiddenKeywords.add(word));
        log.push({ original: article.title, czech: czechTitle });
      }
    }

    return NextResponse.json({ status: 'DONE', added: addedCount, db_zapis: log });

  } catch (err) {
    return NextResponse.json({ error: err.message });
  }
}
