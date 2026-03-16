import { NextResponse } from 'next/server';

/**
 * GURU TREND PREDICTOR ENGINE V3.1 (MODERN ONLY & FAIL-SAFE EDITION)
 * Cesta: src/app/api/predictor/route.js
 * 🛡️ FIX 1: Zmírněn agresivní filtr, který mazal hry při výpadku sociálních sítí.
 * 🛡️ FIX 2: Přidáno základní skóre z IGDB popularity, aby trend_score nikdy nebylo 0.
 * 🛡️ FIX 3: Implementován Ultimate Fallback - pokud IGDB nebo klíče selžou, radar vždy ukáže data.
 */

export const dynamic = 'force-dynamic';

// --- GURU CONFIG ---
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

// 🚀 Záchranná síť (Fallback), pokud selžou API klíče nebo spojení na IGDB
const FALLBACK_GAMES = [
    { name: "Grand Theft Auto VI", total_rating_count: 15000 },
    { name: "Monster Hunter Wilds", total_rating_count: 8500 },
    { name: "Kingdom Come: Deliverance II", total_rating_count: 7200 },
    { name: "DOOM: The Dark Ages", total_rating_count: 6100 },
    { name: "Mafia: The Old Country", total_rating_count: 5900 },
    { name: "Death Stranding 2: On The Beach", total_rating_count: 5400 },
    { name: "Ghost of Yōtei", total_rating_count: 5100 },
    { name: "Fable", total_rating_count: 4800 },
    { name: "Gears of War: E-Day", total_rating_count: 4200 },
    { name: "Marvel's Wolverine", total_rating_count: 3900 },
    { name: "Light No Fire", total_rating_count: 3500 },
    { name: "Perfect Dark", total_rating_count: 3100 }
];

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
  if (!res.ok) throw new Error("Nepodařilo se získat IGDB token");
  const json = await res.json();
  return json.access_token;
}

async function getModernGames(token) {
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
  
  if (!res.ok) throw new Error("Chyba při stahování her z IGDB");
  const data = await res.json();
  return Array.isArray(data) && data.length > 0 ? data : FALLBACK_GAMES;
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
    const ytCount = Math.min(Math.round((yt.length || 0) / 2000), 50);
    return { reddit: rCount, youtube: ytCount };
  } catch { 
    return { reddit: 0, youtube: 0 }; 
  }
}

export async function GET() {
  try {
    let modernGames = [];
    
    // Pokusíme se získat data z IGDB. Pokud selže (např. chybí klíče), nasadíme Fallback.
    try {
        const token = await getIGDBToken();
        modernGames = await getModernGames(token);
    } catch (igdbError) {
        console.warn("IGDB API selhalo, používám záchranný fallback seznam her:", igdbError.message);
        modernGames = FALLBACK_GAMES;
    }
    
    const results = await Promise.all(modernGames.slice(0, 12).map(async (g) => {
      const [trends, social] = await Promise.all([
        getGoogleTrendSignal(g.name),
        getSocialHype(g.name)
      ]);

      // GURU FORMULE V3.1: Základní skóre z počtu hodnocení zajišťuje, že score nikdy není 0
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

    // Seřadíme podle skóre
    const sortedResults = results.sort((a, b) => b.trend_score - a.trend_score);

    return NextResponse.json({
      success: true,
      data: sortedResults,
      timestamp: new Date().toISOString(),
      _mode: modernGames === FALLBACK_GAMES ? "Fallback Mode" : "Modern Only (2024+)"
    });

  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
