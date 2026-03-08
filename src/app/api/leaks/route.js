import { NextResponse } from 'next/server';
import { XMLParser } from "fast-xml-parser";

export const dynamic = 'force-dynamic';

/**
 * GURU BACKEND ENGINE - LEAKS & RUMORS SUPREME BYPASS
 * Cesta: src/app/api/leaks/route.js
 * Funkce: Agresivní obcházení blokací Redditu/Chiphellu a eliminace čínského spamu.
 */

const REDDIT_URL = "https://www.reddit.com/r/GamingLeaksAndRumours/new.json?limit=25";
const CHIPHELL_URL = "https://www.chiphell.com/forum.php?mod=rss&fid=224";

// Ultimátní proxy pro případ, že Vercel IP dostane ban
const proxies = {
  allOrigins: (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}&t=${Date.now()}`
};

export async function GET() {
  const leaks = [];
  const parser = new XMLParser({ 
    ignoreAttributes: false,
    trimValues: true
  });

  const commonHeaders = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 GuruBot/2.0",
    "Accept": "application/json, application/xml, text/xml, */*",
    "Cache-Control": "no-cache"
  };

  // ----------------------------------
  // 1. REDDIT FETCH (Nativní JSON Bypass)
  // ----------------------------------
  try {
    let redditData = null;
    
    // Pokus A: Přímý dotaz s elitním User-Agentem
    const res = await fetch(REDDIT_URL, { 
      headers: commonHeaders,
      next: { revalidate: 300 } 
    });

    if (res.ok) {
      redditData = await res.json();
    } else {
      // Pokus B: Pokud přímý dotaz selže (např. 429), použijeme AllOrigins
      const proxyRes = await fetch(proxies.allOrigins(REDDIT_URL));
      if (proxyRes.ok) {
        const proxyJson = await proxyRes.json();
        if (proxyJson.contents) {
          redditData = JSON.parse(proxyJson.contents);
        }
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
    console.error("Guru Reddit Error:", err.message);
  }

  // ----------------------------------
  // 2. CHIPHELL FETCH (Anti-Spam & XML Fix)
  // ----------------------------------
  try {
    let chiphellRaw = null;
    
    const res = await fetch(CHIPHELL_URL, { 
      headers: { ...commonHeaders, "Accept": "application/rss+xml" },
      next: { revalidate: 600 } 
    });

    if (res.ok) {
      chiphellRaw = await res.text();
    } else {
      const proxyRes = await fetch(proxies.allOrigins(CHIPHELL_URL));
      if (proxyRes.ok) {
        const proxyJson = await proxyRes.json();
        chiphellRaw = proxyJson.contents;
      }
    }

    if (chiphellRaw && chiphellRaw.length > 100) {
      const chipJson = parser.parse(chiphellRaw);
      const items = chipJson?.rss?.channel?.item || [];
      const chipArray = Array.isArray(items) ? items : [items];

      const chipPosts = chipArray
        .filter(i => i && i.title)
        // 🚀 GURU HARD-FILTER: Eliminace čínského spamu (přihlášení, odpovědi, balast)
        .filter(i => {
          const t = i.title.toString();
          // Zakázaná slova: 签到 (přihlášení), 每日 (denně), 回复 (odpověď), 帖 (příspěvek), 领取 (vyzvednout)
          const spamTerms = ['签到', '每日', '回复', '帖', '领取', 'Check-in', 'Daily'];
          return !spamTerms.some(term => t.includes(term));
        })
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
    console.error("Guru Chiphell Error:", err.message);
  }

  // ----------------------------------
  // SJEDNOCENÍ & LEŠTĚNÍ DAT
  // ----------------------------------
  // Seřadíme vše od nejnovějšího podle pubDate
  leaks.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  // Pokud by oba zdroje selhaly, nevracíme chybu, ale prázdné úspěšné pole pro stabilitu frontendu
  return NextResponse.json({
    success: true,
    count: leaks.length,
    data: leaks,
  });
}
