import { NextResponse } from 'next/server';
import googleTrends from 'google-trends-api';

/**
 * GURU TREND PREDICTOR ENGINE V1.0
 * Cesta: src/app/api/predictor/route.js
 * 🚀 CÍL: Agregace signálů ze Steamu, Google Trends, Redditu a YouTube.
 * 🛡️ FORMULE: growth * 4 + youtube * 0.0001 + reddit * 5 - players * 0.05
 */

export const dynamic = 'force-dynamic';

async function getSteamGames() {
  try {
    const res = await fetch("https://steamspy.com/api.php?request=top100in2weeks", { cache: 'no-store' });
    const data = await res.json();
    return Object.values(data)
      .slice(0, 30)
      .map(g => ({ name: g.name, players: g.average_2weeks }));
  } catch (e) { return []; }
}

async function getGoogleTrendGrowth(game) {
  try {
    const result = await googleTrends.interestOverTime({
      keyword: game,
      startTime: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    });
    const data = JSON.parse(result).default.timelineData;
    if (!data.length) return 0;
    const first = data[0].value[0];
    const last = data[data.length - 1].value[0];
    return last - first;
  } catch { return 0; }
}

async function getYoutubeActivity(game) {
  const query = encodeURIComponent(game + " gameplay");
  const url = `https://www.youtube.com/results?search_query=${query}`;
  try {
    const r = await fetch(url, { cache: 'no-store' });
    const text = await r.text();
    return text.length; // Proxy pro hustotu výsledků
  } catch { return 0; }
}

async function getRedditMentions(game) {
  const query = encodeURIComponent(game);
  const url = `https://www.reddit.com/search.json?q=${query}&sort=new`;
  try {
    const r = await fetch(url, { headers: { "User-Agent": "guru-trend-bot" } });
    const data = await r.json();
    return data.data?.children?.length || 0;
  } catch { return 0; }
}

function calculateTrendScore(players, growth, youtube, reddit) {
  // GURU FORMULE: Odměňuje růst a komunitu, penalizuje už "přežranou" popularitu
  return (growth * 4) + (youtube * 0.0001) + (reddit * 5) - (players * 0.05);
}

export async function GET() {
  try {
    const steamGames = await getSteamGames();
    if (!steamGames.length) throw new Error("Steam API nedostupné");

    const results = [];

    // Paralelní zpracování signálů (omezeno na 15 her pro rychlost Vercelu)
    const processedGames = steamGames.slice(0, 15);

    for (const g of processedGames) {
      const [growth, youtube, reddit] = await Promise.all([
        getGoogleTrendGrowth(g.name),
        getYoutubeActivity(g.name),
        getRedditMentions(g.name)
      ]);

      const score = calculateTrendScore(g.players, growth, youtube, reddit);

      results.push({
        game: g.name,
        steam_players: g.players,
        trend_growth: growth,
        youtube_activity: youtube,
        reddit_mentions: reddit,
        trend_score: Math.round(score * 10) / 10 // Zaokrouhlení na 1 des. místo
      });
    }

    results.sort((a, b) => b.trend_score - a.trend_score);

    return NextResponse.json({
      success: true,
      data: results.slice(0, 10),
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
