import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const SERPER_API_KEY = process.env.SERPER_API_KEY;

export async function GET() {
  headers();
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  // 1. Najdeme články, kde chybí SEO (bereme max 3 najednou, ať to nespadne na timeoutu)
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, content')
    .is('seo_description', null)
    .limit(3);

  if (error) return NextResponse.json({ error: 'Chyba DB', details: error.message });
  
  if (!posts || posts.length === 0) {
    return NextResponse.json({ message: '🦾 VŠECHNY ČLÁNKY MAJÍ DOPLNĚNÉ SEO I VIDEA! Jsi ready.' });
  }

  let results = [];

  for (const post of posts) {
    try {
      // 2. Rychlé vyhledání videa na YouTube přes Serper k tématu článku
      const res = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: `${post.title} youtube review gameplay`, num: 3 })
      });
      const searchResults = await res.json();
      const rawContext = JSON.stringify(searchResults.organic || []).substring(0, 1500);

      // 3. Pošleme stávající článek do AI, ať k němu vymyslí omáčku pro Google
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: `Jsi SEO expert pro HW web The Hardware Guru. 
            Tvůj úkol je analyzovat dodaný text článku a vrátit STRIKTNÍ JSON s chybějícími daty:
            {
              "seo_description": "Úderné SEO shrnutí článku pro Google (max 160 znaků)",
              "seo_keywords": "čárkou oddělená klíčová slova k tématu, max 8 slov",
              "youtube_url": "Najdi v datech z vyhledávání relevantní YouTube link (např. youtube.com/watch?v=...), jinak null"
            }`
          },
          { 
            role: "user", 
            content: `Název: ${post.title}\nText: ${(post.content || '').substring(0, 1500)}...\n\nData z vyhledávání pro YouTube: ${rawContext}` 
          }
        ],
        response_format: { type: "json_object" }
      });

      const aiData = JSON.parse(completion.choices[0].message.content);

      // 4. Zapíšeme ty nově vygenerované věci zpět do databáze ke stávajícímu článku
      await supabase.from('posts').update({
        seo_description: aiData.seo_description,
        seo_keywords: aiData.seo_keywords,
        youtube_url: aiData.youtube_url || null
      }).eq('id', post.id);

      results.push({ title: post.title, status: 'DOPLNĚNO', data: aiData });

    } catch (err) {
      results.push({ title: post.title, status: 'CHYBA', error: err.message });
    }
  }

  return NextResponse.json({ processed: results });
}
