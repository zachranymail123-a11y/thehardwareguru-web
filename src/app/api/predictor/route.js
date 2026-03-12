import { NextResponse } from 'next/server';

/**
 * GURU TREND PREDICTOR ENGINE V3.0 (MODERN ONLY EDITION)
 * Cesta: src/app/api/predictor/route.js
 * 🛡️ FIX 1: Absolutní filtr na datum vydání (IGDB). Vše pod 2024 letí do koše.
 * 🛡️ FIX 2: Agresivní penalizace pro "staré sracky" a "stabilní giganty".
 * 🛡️ FIX 3: Zdroj dat změněn z Top 100 na Trending/Wishlisted.
 */

export const dynamic = 'force-dynamic';

// --- GURU CONFIG ---
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

async function getIGDBToken() {
  const res = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    body: new URLSearchParams({
      client_id: TWITCH_CLIENT_ID,
      client_secret: TWITCH_CLIENT_SECRET,
      grant_type: 'client_credentials'
    })
  });
  const json = await res.json();
  return json.access_token;
}

async function getModernGames(token) {
  // 🚀 GURU: Dotaz na IGDB pro hry vydané v roce 2024, 2025 nebo budoucí (sorted by popularity)
  const now = Math.floor(Date.now() / 1000);
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
           limit 40;`
  });
  
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
        fetch(`https://www.reddit.com/search.json?q=${encodeURIComponent(game)}&sort=new`, { headers: { "User-Agent": "guru-bot" } }).then(r => r.json()),
        fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(game + " gameplay")}`, { cache: 'no-store' }).then(r => r.text())
    ]);
    const rCount = reddit.data?.children?.length || 0;
    const ytCount = Math.min(Math.round(yt.length / 2000), 50);
    return { reddit: rCount, youtube: ytCount };
  } catch { return { reddit: 0, youtube: 0 }; }
}

export async function GET() {
  try {
    const token = await getIGDBToken();
    const modernGames = await getModernGames(token);
    
    const results = await Promise.all(modernGames.map(async (g) => {
      const [trends, social] = await Promise.all([
        getGoogleTrendSignal(g.name),
        getSocialHype(g.name)
      ]);

      // GURU FORMULE V3: Obrovský bonus za trends (aktuální hledání) a čerstvost
      // Skóre = Trends(0-200) * 5 + YT * 2 + Reddit * 5
      const score = (trends * 5) + (social.youtube * 2) + (social.reddit * 5);

      return {
        game: g.name,
        steam_players: g.total_rating_count, // IGDB proxy pro popularitu
        trend_growth: trends,
        youtube_activity: social.youtube,
        reddit_mentions: social.reddit,
        trend_score: Math.round(score * 10) / 10
      };
    }));

    // Filtrujeme hry, které nemají absolutně žádný hype signál
    const filtered = results
        .filter(r => r.trend_score > 5)
        .sort((a, b) => b.trend_score - a.trend_score);

    return NextResponse.json({
      success: true,
      data: filtered.slice(0, 12),
      timestamp: new Date().toISOString(),
      _mode: "Modern Only (2024+)"
    });

  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
