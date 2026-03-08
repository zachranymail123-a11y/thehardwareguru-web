import { NextResponse } from 'next/server';
import { XMLParser } from "fast-xml-parser";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GURU BACKEND ENGINE - LEAKS & RUMORS NUCLEAR SHIELD V7.0
 * Cesta: src/app/api/leaks/route.js
 * Oprava: Agresivní eliminace čínského spamu a oprava parsování Redditu.
 */

const REDDIT_RSS = "https://www.reddit.com/r/GamingLeaksAndRumours/new/.rss?limit=50";
const CHIPHELL_RSS = "https://www.chiphell.com/forum.php?mod=rss&fid=224";

// Reálné hlavičky pro oklamání detekce
const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Accept": "application/xml, text/xml, */*",
  "Cache-Control": "no-cache"
};

// Seznam zakázaných slov pro Chiphell (Nuclear Spam Filter)
const SPAM_BLACKLIST = [
  '签到', '每日', '回复', '领取', 'Check-in', 'Daily', 'posted', '版块', '积分', '奖励', '领取', '金币', '任务'
];

async function fetchDataWithProxy(url) {
  // Rotace proxy pro maximální průchodnost
  const proxyMethods = [
    // 1. AllOrigins RAW (Vrací přímo text, nejlepší pro XML)
    (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}&t=${Date.now()}`,
    // 2. AllOrigins Wrapper (Vrací JSON s 'contents')
    (u) => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}&t=${Date.now()}`
  ];

  for (const method of proxyMethods) {
    try {
      const res = await fetch(method(url), { headers: BROWSER_HEADERS, cache: 'no-store' });
      if (!res.ok) continue;

      const responseData = await res.text();
      
      // Pokud je to AllOrigins Wrapper, musíme vytáhnout contents
      if (responseData.trim().startsWith('{')) {
        const json = JSON.parse(responseData);
        if (json.contents) return json.contents;
      }
      
      // Pokud to začíná jako XML, je to úspěch
      if (responseData.includes('<?xml') || responseData.includes('<rss') || responseData.includes('<feed')) {
        return responseData;
      }
    } catch (e) {
      console.error(`Proxy try failed for ${url}: ${e.message}`);
    }
  }
  return null;
}

export async function GET() {
  const leaks = [];
  const debug = { reddit: "pending", chiphell: "pending" };
  
  const parser = new XMLParser({ 
    ignoreAttributes: false, 
    trimValues: true,
    attributeNamePrefix: "@_",
    parseAttributeValue: true
  });

  try {
    // --- 1. REDDIT ENGINE (Atom Feed) ---
    const redditRaw = await fetchDataWithProxy(REDDIT_RSS);
    if (redditRaw) {
      try {
        const json = parser.parse(redditRaw);
        // Reddit používá standard Atom (<feed><entry>)
        const entries = json?.feed?.entry || [];
        const entriesArray = Array.isArray(entries) ? entries : [entries];

        entriesArray.forEach(entry => {
          const title = entry.title?.["#text"] || entry.title || "";
          const link = entry.link?.["@_href"] || entry.link || "";
          const date = entry.updated || entry.pubDate || new Date().toISOString();
          
          // Ignorujeme název subredditu jako titulek
          if (title && title !== "GamingLeaksAndRumours") {
            leaks.push({
              title: title,
              link: link,
              description: title,
              source: "Reddit Leaks",
              intelType: "leaks",
              pubDate: new Date(date).toISOString()
            });
          }
        });
        debug.reddit = "ok";
      } catch (e) { debug.reddit = `parse_error: ${e.message}`; }
    } else { debug.reddit = "fetch_failed_or_blocked"; }

    // --- 2. CHIPHELL ENGINE (RSS + Hard Filter) ---
    const chiphellRaw = await fetchDataWithProxy(CHIPHELL_RSS);
    if (chiphellRaw) {
      try {
        const json = parser.parse(chiphellRaw);
        const items = json?.rss?.channel?.item || [];
        const itemsArray = Array.isArray(items) ? items : [items];

        itemsArray.forEach(item => {
          if (!item?.title) return;
          const t = item.title.toString();
          
          // 🚀 GURU HARD FILTER - Pokud titulek obsahuje jakékoliv slovo z blacklistu, mažeme ho.
          const isSpam = SPAM_BLACKLIST.some(term => t.includes(term));
          
          if (!isSpam && t.length > 10) {
            leaks.push({
              title: t,
              link: item.link || "",
              description: item.description || t,
              source: "Chiphell",
              intelType: "leaks",
              pubDate: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString()
            });
          }
        });
        debug.chiphell = "ok";
      } catch (e) { debug.chiphell = `parse_error: ${e.message}`; }
    } else { debug.chiphell = "fetch_failed_or_blocked"; }

    // --- SJEDNOCENÍ ---
    // Seřadíme vše od nejnovějšího
    leaks.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    // Pokud nemáme nic, aspoň vrátíme úspěch s prázdným polem, aby Admin nepadal
    return NextResponse.json({
      success: true,
      count: leaks.length,
      data: leaks.slice(0, 50),
      _debug: debug
    });

  } catch (err) {
    return NextResponse.json({
      success: false,
      count: 0,
      data: [],
      error: err.message
    });
  }
}
