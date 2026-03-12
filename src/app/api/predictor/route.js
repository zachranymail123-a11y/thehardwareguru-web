import { NextResponse } from 'next/server';

/**
 * GURU TREND PREDICTOR ENGINE V2.0 (BUILD-SAFE EDITION)
 * Cesta: src/app/api/predictor/route.js
 * 🛡️ FIX: Kompletně odstraněna závislost na 'google-trends-api' a 'node-fetch'.
 * 🚀 NEXT.JS 15 READY: Využívá nativní fetch a RSS parsing pro 100% úspěšný build na Vercelu.
 */

export const dynamic = 'force-dynamic';

async function getSteamGames() {
  try {
    const res = await fetch("https://steamspy.com/api.php?request=top100in2weeks", { cache: 'no-store' });
    const data = await res.json();
    return Object.values(data)
      .slice(0, 20) // Top 20 pro rychlost odezvy
      .map(g => ({ name: g.name, players: g.average_2weeks }));
  } catch (e) { return []; }
}

async function getGoogleTrendSignal(game) {
  // Skenujeme globální trendy přes RSS (Zero-dependency lookup)
  const regions = ['US', 'CZ'];
  let signal = 0;
  
  for (const geo of regions) {
    try {
      const res = await fetch(`https://trends.google.com/trends/trendingsearches/daily/rss?geo=${geo}`, { 
        cache: 'no-store',
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const xml = await res.text();
      if (xml.toLowerCase().includes(game.toLowerCase())) signal += 50;
    } catch (e) {}
  }
  return signal;
}

async function getYoutubeScore(game) {
  const query = encodeURIComponent(game + " gameplay");
  try {
    const r = await fetch(`https://www.youtube.com/results?search_query=${query}`, { cache: 'no-store' });
    const text = await r.text();
    return Math.min(Math.round(text.length / 1000), 100); // Hustota výsledků jako proxy pro aktivitu
  } catch { return 0; }
}

async function getRedditScore(game) {
  try {
    const r = await fetch(`https://www.reddit.com/search.json?q=${encodeURIComponent(game)}&sort=new`, {
      headers: { "User-Agent": "guru-trend-bot" }
    });
    const data = await r.json();
    return data.data?.children?.length || 0;
  } catch { return 0; }
}

export async function GET() {
  try {
    const steamGames = await getSteamGames();
    const results = [];

    // Paralelní zpracování pro maximální rychlost
    const analysis = await Promise.all(steamGames.map(async (g) => {
      const [trends, youtube, reddit] = await Promise.all([
        getGoogleTrendSignal(g.name),
        getYoutubeScore(g.name),
        getRedditScore(g.name)
      ]);

      // GURU FORMULE: Odměňuje hype a čerstvost, tlumí "vyhořelé" giganty
      const score = (trends * 2) + (youtube * 0.5) + (reddit * 3) - (g.players * 0.01);

      return {
        game: g.name,
        steam_players: g.players,
        trend_growth: trends,
        youtube_activity: youtube,
        reddit_mentions: reddit,
        trend_score: Math.max(0, Math.round(score * 10) / 10)
      };
    }));

    analysis.sort((a, b) => b.trend_score - a.trend_score);

    return NextResponse.json({
      success: true,
      data: analysis.slice(0, 10),
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
