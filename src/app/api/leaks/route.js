import { NextResponse } from 'next/server';
import { XMLParser } from "fast-xml-parser";

export const dynamic = 'force-dynamic';

/**
 * GURU BACKEND ENGINE - LEAKS & RUMORS BYPASS
 * Bezpečně stahuje data ze zdrojů, které blokují klientské proxy (Reddit, Chiphell).
 */

const REDDIT_URL = "https://www.reddit.com/r/GamingLeaksAndRumours/new.json?limit=20";
const CHIPHELL_URL = "https://www.chiphell.com/forum.php?mod=rss&fid=224";

// Fallback proxy (AllOrigins) v případě tuhé ochrany od Cloudflare nebo IP banu
const proxies = {
  allOrigins: (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
};

async function fetchWithFallback(url) {
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) NextLeaksBot/1.0",
    "Accept": "*/*",
  };

  // 1. Přímý pokus o stažení dat (funguje lokálně, někdy na Vercelu)
  try {
    const res = await fetch(url, { headers, next: { revalidate: 300 } });
    if (res.ok) return await res.text();
  } catch (e) {
    // Tichý pád, zkusíme proxy
  }

  // 2. Fallback přes free proxy, pokud nás zdroj zablokuje (Vercel IP ban)
  try {
    const res = await fetch(proxies.allOrigins(url), { next: { revalidate: 300 } });
    if (res.ok) return await res.text();
  } catch (e) {
    // Úplné selhání
  }

  return null;
}

export async function GET() {
  const leaks = [];
  const parser = new XMLParser({ ignoreAttributes: false });

  // ----------------------------------
  // 1. REDDIT FETCH (Nativní JSON endpoint bypass)
  // ----------------------------------
  try {
    const redditRaw = await fetchWithFallback(REDDIT_URL);
    if (redditRaw) {
      const redditData = JSON.parse(redditRaw);
      const redditPosts = (redditData?.data?.children || []).map((p) => ({
        title: p.data.title,
        link: `https://reddit.com${p.data.permalink}`,
        description: p.data.selftext || p.data.title,
        source: "Reddit Leaks",
        intelType: "leaks", // Zajištěno mapování na tvůj Admin
        pubDate: new Date(p.data.created_utc * 1000).toISOString()
      }));
      leaks.push(...redditPosts);
    }
  } catch (err) {
    console.warn("Guru Backend: Reddit fetch failed:", err);
  }

  // ----------------------------------
  // 2. CHIPHELL FETCH (Anti-Cloudflare zpracování RSS)
  // ----------------------------------
  try {
    const chiphellRaw = await fetchWithFallback(CHIPHELL_URL);
    if (chiphellRaw) {
      const chipJson = parser.parse(chiphellRaw);
      const items = chipJson?.rss?.channel?.item || [];
      const chipArray = Array.isArray(items) ? items : [items];

      const chipPosts = chipArray.filter(i => i && i.title).map((item) => ({
        title: item.title,
        link: item.link,
        description: item.description || item.title,
        source: "Chiphell",
        intelType: "leaks",
        pubDate: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString()
      }));
      leaks.push(...chipPosts);
    }
  } catch (err) {
    console.warn("Guru Backend: Chiphell fetch failed:", err);
  }

  // ----------------------------------
  // SORT & RESPONSE
  // ----------------------------------
  // Seřazení od nejnovějších
  leaks.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  return NextResponse.json({
    success: true,
    count: leaks.length,
    data: leaks,
  });
}
