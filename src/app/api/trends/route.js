import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GURU TRENDS ENGINE V1.1 - DUPLICATE PROTECTION
 * Cesta: src/app/api/trends/route.js
 * 🛡️ LOGIKA: 
 * 1. Stáhne denní trendy z Google RSS (CZ a US).
 * 2. Načte existující hry z DB, aby zamezil duplicitám.
 * 3. Ověří každý trend přes Wikipedia API.
 * 4. Pokud Wikipedia potvrdí, že jde o hru a NENÍ v DB, zařadí ji do Top 3.
 */

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Pomocná funkce pro slugify (shodná s DB triggerem)
const slugify = (text) => 
  text?.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/\-+/g, '-')
    .replace(/^-+|-+$/g, '') || '';

async function isGameOnWiki(query) {
  const langs = ['cs', 'en'];
  for (const lang of langs) {
    try {
      const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query.replace(/\s+/g, '_'))}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        const text = (data.extract || '').toLowerCase();
        // Hledáme klíčová slova potvrzující herní tématiku
        if (text.includes('videohra') || text.includes('video game') || text.includes('herní série') || text.includes('game series')) {
          return true;
        }
      }
    } catch (e) {
      continue;
    }
  }
  return false;
}

export async function GET() {
  try {
    // 1. Získání existujících her z DB pro kontrolu duplicit
    const { data: existingGames } = await supabase.from('games').select('slug');
    const existingSlugs = new Set(existingGames?.map(g => g.slug) || []);

    // 2. Získání trendů z Google RSS
    const regions = ['CZ', 'US'];
    let candidates = new Set();

    for (const geo of regions) {
      const rssUrl = `https://trends.google.com/trends/trendingsearches/daily/rss?geo=${geo}`;
      const res = await fetch(rssUrl);
      const xml = await res.text();
      
      const matches = xml.match(/<title>(.*?)<\/title>/g);
      if (matches) {
        matches.forEach(m => {
          const title = m.replace(/<\/?title>/g, '').trim();
          if (title !== 'Daily Search Trends' && title.length > 2) {
            candidates.add(title);
          }
        });
      }
    }

    const gameTrends = [];
    const candidateList = Array.from(candidates);

    // 3. Filtrace a validace (přeskakujeme to, co už máme)
    for (const item of candidateList) {
      const currentSlug = slugify(item);
      
      // 🛡️ GURU DUPLICATE CHECK: Pokud už slug v DB máme, zahodíme ho
      if (existingSlugs.has(currentSlug)) {
        continue;
      }

      // 🛡️ WIKI CHECK: Ověříme, zda jde o hru
      if (await isGameOnWiki(item)) {
        gameTrends.push(item);
      }

      // Potřebujeme jen top 3 nové hry
      if (gameTrends.length >= 3) break;
    }

    return NextResponse.json({ success: true, data: gameTrends });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
