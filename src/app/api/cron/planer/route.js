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
      num: 8 // Bereme trochu víc pro případ duplicit
    })
  });
  const data = await res.json();
  return data.organic || [];
}

export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  try {
    const sources = "site:videocardz.com OR site:techpowerup.com OR site:wccftech.com OR site:ign.com OR site:vgc.com OR site:pcgamer.com OR site:tomshardware.com";
    
    const [hwRaw, gameRaw] = await Promise.all([
      getRawTodayData(`${sources} hardware GPU CPU leak benchmark`),
      getRawTodayData(`${sources} game "official" OR "announcement" OR "trailer"`)
    ]);

    const selectedArticles = [
      ...hwRaw.slice(0, 3).map(a => ({ ...a, type: 'hardware' })),
      ...gameRaw.slice(0, 3).map(a => ({ ...a, type: 'game' }))
    ];

    if (selectedArticles.length === 0) {
      return NextResponse.json({ status: 'CHYBA', message: 'Google nic nenašel.' });
    }

    let addedCount = 0;
    let log = [];

    // Načteme si dnešní už existující názvy pro bleskovou kontrolu
    const { data: todayExisting } = await supabase
      .from('content_plan')
      .select('title')
      .eq('release_date', todayStr);
    
    const existingTitles = todayExisting ? todayExisting.map(item => item.title.toLowerCase()) : [];

    for (const article of selectedArticles) {
      // 1. PŘEKLAD (stále nutný pro kontrolu finálního českého názvu)
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Jsi překladatel pro web Hardware Guru. Udělej z anglického titulku úderný český název. Vrať striktně JSON: { \"title\": \"...\" }"
          },
          { role: "user", content: `Název: ${article.title}\nSnippet: ${article.snippet}` }
        ],
        response_format: { type: "json_object" }
      });

      const processed = JSON.parse(completion.choices[0].message.content);
      const czechTitle = processed.title.trim();

      // 2. KONTROLA DUPLICITY ČESKÉHO NÁZVU (Klíčová oprava)
      // Kontrolujeme, jestli se název už v DB nevyskytuje (case-insensitive)
      if (existingTitles.includes(czechTitle.toLowerCase())) continue;

      // 3. ZÁPIS DO DB
      const { data, error } = await supabase.from('content_plan').insert({
        title: czechTitle,
        release_date: todayStr,
        type: article.type,
        status: 'planned'
      }).select();

      if (data) {
        addedCount++;
        existingTitles.push(czechTitle.toLowerCase()); // Přidáme do seznamu pro další iteraci v tomto běhu
        log.push({ original: article.title, czech: czechTitle, type: article.type });
      }
      
      // Stopka na 4 článcích (2 HW + 2 Game ideálně, ale bereme co je unikátní)
      if (addedCount >= 4) break;
    }

    return NextResponse.json({ status: 'DONE', added: addedCount, db_zapis: log });

  } catch (err) {
    return NextResponse.json({ error: err.message });
  }
}
