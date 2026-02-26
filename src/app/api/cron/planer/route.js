import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERPER_API_KEY = process.env.SERPER_API_KEY;

// Funkce, která vytáhne z Googlu JENOM dnešní věci
async function getRawTodayData(query) {
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      q: query, 
      tbs: "qdr:h12", // POUZE POSLEDNÍCH 12 HODIN - NIC JINÉHO GOOGLE NEVRÁTÍ
      num: 5 
    })
  });
  const data = await res.json();
  return data.organic || [];
}

export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const now = new Date();

  try {
    // 1. STRIKTNÍ SBĚR DAT (2x HW, 2x GAME)
    const sources = "site:videocardz.com OR site:techpowerup.com OR site:wccftech.com OR site:ign.com OR site:vgc.com OR site:pcgamer.com OR site:tomshardware.com";
    
    const [hwRaw, gameRaw] = await Promise.all([
      getRawTodayData(`${sources} hardware GPU CPU leak benchmark`),
      getRawTodayData(`${sources} game "official" OR "announcement" OR "trailer"`)
    ]);

    // Vybereme první 2 unikátní kousky z každého (pokud existují)
    const selectedArticles = [
      ...hwRaw.slice(0, 2).map(a => ({ ...a, type: 'hardware' })),
      ...gameRaw.slice(0, 2).map(a => ({ ...a, type: 'game' }))
    ];

    if (selectedArticles.length === 0) {
      return NextResponse.json({ status: 'CHYBA', message: 'Google dnes nic nového nenašel.' });
    }

    let addedCount = 0;
    let log = [];

    for (const article of selectedArticles) {
      // 2. KONTROLA DUPLICITY V KÓDU (AI do toho nekecá)
      const { data: dup } = await supabase.from('content_plan').select('id').eq('title', article.title).limit(1);
      if (dup && dup.length > 0) continue;

      // 3. AI JENOM PŘELOŽÍ NÁZEV A ZKONTROLUJE TYP
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Jsi překladatel. Dostaneš anglický titulek a snippet dnešní novinky. Udělej z toho úderný český název pro web Hardware Guru. Vrať JSON: { \"title\": \"Český název\" }"
          },
          { role: "user", content: `Název: ${article.title}\nSnippet: ${article.snippet}` }
        ],
        response_format: { type: "json_object" }
      });

      const processed = JSON.parse(completion.choices[0].message.content);
      
      // 4. ZÁPIS DO DB
      const { data } = await supabase.from('content_plan').insert({
        title: processed.title,
        release_date: now.toISOString().split('T')[0],
        type: article.type,
        status: 'planned'
      }).select();

      if (data) {
        addedCount++;
        log.push({ original: article.title, czech: processed.title, type: article.type });
      }
    }

    return NextResponse.json({ status: 'DONE', added: addedCount, db_zapis: log });

  } catch (err) {
    return NextResponse.json({ error: err.message });
  }
}
