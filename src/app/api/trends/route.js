import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GURU TRENDS ENGINE V2.5 - HEURISTIC & WIKI FIX
 * Cesta: src/app/api/trends/route.js
 * 🛡️ FIX 1: Zvýšen timeout na 5000ms pro pomalé odpovědi z Wikipedie.
 * 🛡️ FIX 2: Extrémně rozšířená klíčová slova pro Wiki text ('rpg', 'sandbox', 'fps' atd.).
 * 🛡️ FIX 3: Rychlý heuristický pre-filtr, který okamžitě propustí zjevné herní názvy (GTA, Xbox, Steam).
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const slugify = (text) => 
  text?.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/\-+/g, '-')
    .replace(/^-+|-+$/g, '') || '';

async function isGameOnWiki(query) {
  const headers = { 'User-Agent': 'TheHardwareGuruBot/1.0 (https://thehardwareguru.cz/)' };
  const langs = ['en', 'cs'];
  
  for (const lang of langs) {
    try {
      const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query.replace(/\s+/g, '_'))}`;
      // 🚀 GURU FIX: Timeout zvednut na 5s (Vercel bývá občas pomalý)
      const res = await fetch(url, { headers, signal: AbortSignal.timeout(5000) });
      
      if (res.ok) {
        const data = await res.json();
        const text = (data.extract || '').toLowerCase();
        
        // 🚀 GURU FIX: Mnohem širší definice herního obsahu na Wiki
        const keywords = [
          'video game', 'videohra', 'game', 'gaming', 'sandbox game',
          'role-playing', 'rpg', 'fps', 'shooter', 'simulator', 'multiplayer',
          'herní série', 'game series'
        ];
        
        if (keywords.some(kw => text.includes(kw))) {
            return true;
        }
      }
    } catch (e) {
      // Timeout nebo network error - přeskočíme na další jazyk
      continue;
    }
  }
  return false;
}

export async function GET() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. Získání existujících her pro deduplikaci
    const { data: existingGames } = await supabase.from('games').select('slug');
    const existingSlugs = new Set(existingGames?.map(g => g.slug) || []);

    // 2. Fetch trendů z Google RSS
    const regions = ['CZ', 'US'];
    let candidates = new Set();

    for (const geo of regions) {
      try {
          const rssUrl = `https://trends.google.com/trends/trendingsearches/daily/rss?geo=${geo}`;
          const res = await fetch(rssUrl, { 
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
              next: { revalidate: 3600 } 
          });
          
          if (res.ok) {
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
      } catch (err) {
          console.error(`Chyba načítání RSS pro ${geo}:`, err);
      }
    }

    const gameTrends = [];
    const candidateList = Array.from(candidates);

    // 🚀 GURU FIX: Produkční Heuristický Filtr (zachytí to co Wiki nezná)
    const gameKeywords = [
      'game', 'gaming', 'steam', 'playstation', 'xbox', 'nintendo',
      'fortnite', 'minecraft', 'gta', 'call of duty', 'battlefield',
      'cyberpunk', 'witcher', 'esports', 'rpg', 'fps', 'mmo'
    ];

    // 3. Filtrace a validace (Heuristika -> Wikipedia)
    for (const item of candidateList) {
      const currentSlug = slugify(item);
      
      // Pokud už hru máme v databázi, okamžitě ignorujeme
      if (existingSlugs.has(currentSlug)) continue;

      const lowerItem = item.toLowerCase();

      // KROK A: Rychlý heuristický check (propustí ihned, bez čekání na Wiki)
      if (gameKeywords.some(k => lowerItem.includes(k))) {
         gameTrends.push(item);
         if (gameTrends.length >= 3) break;
         continue; // Skok na další kandidát, Wiki už nevoláme
      }

      // KROK B: Pokud Heuristika selže, zkusíme detailní ověření přes Wikipedii
      if (await isGameOnWiki(item)) {
        gameTrends.push(item);
      }
      
      if (gameTrends.length >= 3) break;
    }

    // 4. Záchranná brzda (pokud je Google RSS prázdné nebo plné politiky)
    if (gameTrends.length === 0) {
        const fallbackGames = [
            'Monster Hunter Wilds', 
            'Grand Theft Auto VI', 
            'DOOM The Dark Ages', 
            'Civilization VII', 
            'Ghost of Yotei', 
            'Fable 4',
            'Mafia The Old Country'
        ];
        
        for (const fb of fallbackGames) {
            if (!existingSlugs.has(slugify(fb))) {
                gameTrends.push(fb);
            }
            if (gameTrends.length >= 3) break;
        }
    }

    return NextResponse.json({ success: true, data: gameTrends });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
