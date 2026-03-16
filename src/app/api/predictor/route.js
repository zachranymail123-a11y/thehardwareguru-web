import { NextResponse } from 'next/server';

/**
 * GURU TREND PREDICTOR ENGINE V3.2 (STRICT IGDB EDITION)
 * Cesta: src/app/api/predictor/route.js
 * 🛡️ FIX 1: Odstraněn agresivní filtr trend_score > 5, který mazal všechny hry při výpadku sociálních API.
 * 🛡️ FIX 2: Odstraněn fallback (na žádost uživatele), spoléhá se výhradně na reálná IGDB data a ENV klíče.
 */

export const dynamic = 'force-dynamic';

// --- GURU CONFIG ---
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

async function getIGDBToken() {
  if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
      throw new Error("Chybí TWITCH_CLIENT_ID nebo TWITCH_CLIENT_SECRET v .env");
  }
  const res = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    body: new URLSearchParams({
      client_id: TWITCH_CLIENT_ID,
      client_secret: TWITCH_CLIENT_SECRET,
      grant_type: 'client_credentials'
    })
  });
  if (!res.ok) throw new Error("Nepodařilo se získat IGDB token. Zkontroluj platnost klíčů.");
  const json = await res.json();
  return json.access_token;
}

async function getModernGames(token) {
  // Dotaz na IGDB pro hry vydané v roce 2024, 2025 nebo budoucí (sorted by popularity)
  const date2024 = 1704067200; // 1.1.2024

  const res = await fetch('https://api.igdb.com/v4/games', {
    method: 'POST',
    headers: {
      'Client-ID': TWITCH_CLIENT_ID,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'text/plain'
    },
    body: `fields name, first_release_date, total_rating_count; 
           where first_release_date > ${date2024} & total_rating_count > 5; 
           sort total_rating_count desc; 
           limit 20;`
  });
  
  if (!res.ok) throw new Error("Chyba při stahování her z IGDB. Zkontroluj API limit nebo dotaz.");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function getGoogleTrendSignal(game) {
  const regions = ['US', 'CZ'];
  let signal = 0;
  for (const geo of regions) {
    try {
      const res = await fetch(`https://trends.google.com/trends/trendingsearches/daily/rss?geo=${geo}`, { 
        cache: 'no-store',
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const xml = await res.text();
      if (xml.toLowerCase().includes(game.toLowerCase())) signal += 100;
    } catch (e) {}
  }
  return signal;
}

async function getSocialHype(game) {
  try {
    const [reddit, yt] = await Promise.all([
        fetch(`https://www.reddit.com/search.json?q=${encodeURIComponent(game)}&sort=new`, { headers: { "User-Agent": "guru-bot-v2" } }).then(r => r.ok ? r.json() : { data: { children: [] } }),
        fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(game + " gameplay")}`, { cache: 'no-store' }).then(r => r.ok ? r.text() : "")
    ]);
    const rCount = reddit.data?.children?.length || 0;
    const ytCount = Math.min(Math.round((yt?.length || 0) / 2000), 50);
    return { reddit: rCount, youtube: ytCount };
  } catch { 
    return { reddit: 0, youtube: 0 }; 
  }
}

export async function GET() {
  try {
    const token = await getIGDBToken();
    const modernGames = await getModernGames(token);
    
    if (!modernGames || modernGames.length === 0) {
        return NextResponse.json({ success: true, data: [], _mode: "No games found from IGDB" });
    }

    const results = await Promise.all(modernGames.slice(0, 12).map(async (g) => {
      const [trends, social] = await Promise.all([
        getGoogleTrendSignal(g.name),
        getSocialHype(g.name)
      ]);

      // GURU FORMULE V3.2: Základní skóre z počtu hodnocení zajišťuje, že score nikdy není 0 ani při výpadku scraperů
      const baseScore = Math.min((g.total_rating_count || 10) * 0.1, 40); 
      const score = baseScore + (trends * 5) + (social.youtube * 2) + (social.reddit * 5);

      return {
        game: g.name,
        steam_players: g.total_rating_count || 0,
        trend_growth: trends,
        youtube_activity: social.youtube,
        reddit_mentions: social.reddit,
        trend_score: Math.round(score * 10) / 10
      };
    }));

    // Seřadíme podle skóre. Odstraněn agresivní filtr, aby se data propsala i s minimálním hype.
    const sortedResults = results.sort((a, b) => b.trend_score - a.trend_score);

    return NextResponse.json({
      success: true,
      data: sortedResults,
      timestamp: new Date().toISOString(),
      _mode: "Modern Only (2024+) - Strict IGDB"
    });

  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
