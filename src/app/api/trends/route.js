import { NextResponse } from 'next/server';

/**
 * GURU TRENDS ENGINE V1.0
 * Cesta: src/app/api/trends/route.js
 * 🛡️ LOGIKA: 
 * 1. Stáhne denní trendy z Google RSS (CZ a US).
 * 2. Ověří každý trend přes Wikipedia API.
 * 3. Pokud Wikipedia potvrdí, že jde o "videohru", zařadí ji do Top 3.
 */

export const dynamic = 'force-dynamic';

async function isGameOnWiki(query) {
  const langs = ['cs', 'en'];
  for (const lang of langs) {
    try {
      const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query.replace(/\s+/g, '_'))}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        const text = (data.extract || '').toLowerCase();
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
    // Získání trendů z Google RSS (jednoduchá cesta bez pytrends)
    const regions = ['CZ', 'US'];
    let candidates = new Set();

    for (const geo of regions) {
      const rssUrl = `https://trends.google.com/trends/trendingsearches/daily/rss?geo=${geo}`;
      const res = await fetch(rssUrl);
      const xml = await res.text();
      
      // Jednoduchý regex pro vytažení <title> z RSS (titulky trendů)
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

    // Paralelní ověření přes Wikipedii (limitujeme na prvních 15 trendů pro rychlost)
    for (const item of candidateList.slice(0, 15)) {
      if (await isGameOnWiki(item)) {
        gameTrends.push(item);
      }
      if (gameTrends.length >= 3) break;
    }

    return NextResponse.json({ success: true, data: gameTrends });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
