import { NextResponse } from 'next/server';
import { XMLParser } from "fast-xml-parser";

export const dynamic = 'force-dynamic';

/**
 * GURU BACKEND ENGINE - LEAKS & RUMORS BYPASS
 * Ošetřeno proti čínskému spamu z fóra a zajištěno spolehlivé parsování Redditu.
 */

const REDDIT_URL = "https://www.reddit.com/r/GamingLeaksAndRumours/new.json?limit=20";
const CHIPHELL_URL = "https://www.chiphell.com/forum.php?mod=rss&fid=224";

// Spolehlivá proxy, která data zabalí do JSON objektu (obchází 403 a 429 z Vercelu)
const proxies = {
  allOrigins: (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
};

export async function GET() {
  const leaks = [];
  const parser = new XMLParser({ ignoreAttributes: false });

  // ----------------------------------
  // 1. REDDIT FETCH (Anti-Ban Bypass)
  // ----------------------------------
  try {
    let redditData = null;
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      "Accept": "application/json",
    };

    const res = await fetch(REDDIT_URL, { headers, next: { revalidate: 300 } });
    if (res.ok) {
      redditData = await res.json();
    } else {
      // 🚀 GURU FIX: Pokud Reddit zablokuje přímý dotaz z Vercelu, jdeme přes robustní Proxy
      const proxyRes = await fetch(proxies.allOrigins(REDDIT_URL), { next: { revalidate: 300 } });
      if (proxyRes.ok) {
        const proxyJson = await proxyRes.json();
        // Proxy vrátí data jako string uvnitř 'contents'
        redditData = JSON.parse(proxyJson.contents);
      }
    }

    if (redditData?.data?.children) {
      const redditPosts = redditData.data.children.map((p) => ({
        title: p.data.title,
        link: `https://reddit.com${p.data.permalink}`,
        description: p.data.selftext || p.data.title,
        source: "Reddit Leaks",
        intelType: "leaks",
        pubDate: new Date(p.data.created_utc * 1000).toISOString()
      }));
      leaks.push(...redditPosts);
    }
  } catch (err) {
    console.warn("Guru Backend: Reddit fetch failed:", err);
  }

  // ----------------------------------
  // 2. CHIPHELL FETCH (Anti-Spam Filter)
  // ----------------------------------
  try {
    let chiphellRaw = null;
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      "Accept": "application/rss+xml,application/xml",
      "Accept-Language": "en-US,en;q=0.9",
    };

    const res = await fetch(CHIPHELL_URL, { headers, next: { revalidate: 600 } });
    if (res.ok) {
      chiphellRaw = await res.text();
    } else {
      const proxyRes = await fetch(proxies.allOrigins(CHIPHELL_URL), { next: { revalidate: 600 } });
      if (proxyRes.ok) {
        const proxyJson = await proxyRes.json();
        chiphellRaw = proxyJson.contents; // Proxy vrací XML jako string
      }
    }

    if (chiphellRaw) {
      const chipJson = parser.parse(chiphellRaw);
      const items = chipJson?.rss?.channel?.item || [];
      const chipArray = Array.isArray(items) ? items : [items];

      const chipPosts = chipArray
        .filter(i => i && i.title)
        // 🚀 GURU FIX: Tvrdý filtr na čínský spam "每日签到" a další nesmysly!
        .filter(i => !i.title.includes('签到') && !i.title.includes('每日') && !i.title.includes('回复'))
        .map((item) => ({
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
  // Srovnáme od nejnovějšího
  leaks.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  return NextResponse.json({
    success: true,
    count: leaks.length,
    data: leaks,
  });
}
