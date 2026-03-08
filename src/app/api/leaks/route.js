import { NextResponse } from 'next/server';
import { XMLParser } from "fast-xml-parser";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GURU BACKEND ENGINE - LEAKS & RUMORS NUCLEAR SHIELD V6.0
 * Cesta: src/app/api/leaks/route.js
 * Oprava: Eliminace 500 chyb, oprava parsování Redditu a totální čistka spamu.
 */

const REDDIT_RSS = "https://www.reddit.com/r/GamingLeaksAndRumours/new/.rss";
const CHIPHELL_RSS = "https://www.chiphell.com/forum.php?mod=rss&fid=224";

const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Accept": "application/xml, text/xml, */*",
  "Referer": "https://www.google.com/"
};

// Pomocná funkce pro bezpečné stažení dat
async function safeFetchRaw(url) {
  try {
    // 1. Pokus: Přímý dotaz přes AllOrigins Wrapper (nejstabilnější pro Vercel)
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}&t=${Date.now()}`;
    const res = await fetch(proxyUrl, { cache: 'no-store' });
    
    if (res.ok) {
      const json = await res.json();
      if (json.contents) return json.contents;
    }
  } catch (e) {
    console.error(`Guru Fetch Error: ${e.message}`);
  }
  return null;
}

export async function GET() {
  const leaks = [];
  const debug = { reddit: "pending", chiphell: "pending" };
  
  const parser = new XMLParser({ 
    ignoreAttributes: false, 
    trimValues: true,
    attributeNamePrefix: "@_"
  });

  try {
    // --- 1. REDDIT ENGINE ---
    const redditRaw = await safeFetchRaw(REDDIT_RSS);
    if (redditRaw) {
      try {
        const json = parser.parse(redditRaw);
        // Reddit Atom feed používá <entry>, klasické RSS <item>
        const entries = json?.feed?.entry || json?.rss?.channel?.item || [];
        const entriesArray = Array.isArray(entries) ? entries : [entries];

        entriesArray.forEach(entry => {
          const title = entry.title?.["#text"] || entry.title || "";
          let link = "";
          
          if (entry.link?.["@_href"]) link = entry.link["@_href"];
          else if (entry.link) link = entry.link;

          const date = entry.updated || entry.pubDate || new Date().toISOString();
          
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
      } catch (pErr) { debug.reddit = `parse_error: ${pErr.message}`; }
    } else { debug.reddit = "fetch_failed"; }

    // --- 2. CHIPHELL ENGINE + SPAM GUARD ---
    const chiphellRaw = await safeFetchRaw(CHIPHELL_RSS);
    if (chiphellRaw) {
      try {
        const json = parser.parse(chiphellRaw);
        const items = json?.rss?.channel?.item || [];
        const itemsArray = Array.isArray(items) ? items : [items];

        itemsArray.forEach(item => {
          if (!item?.title) return;
          const t = item.title.toString();
          
          // 🚀 GURU SUPREME SPAM FILTER (每日签到, 回复, 签到 atd.)
          const spamTerms = ['签到', '每日', '回复', '领取', 'Check-in', 'Daily', 'posted', '版块'];
          const isSpam = spamTerms.some(term => t.includes(term));
          
          if (!isSpam && t.length > 8) {
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
      } catch (pErr) { debug.chiphell = `parse_error: ${pErr.message}`; }
    } else { debug.chiphell = "fetch_failed"; }

    // Sestupně podle data
    leaks.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    return NextResponse.json({
      success: true,
      count: leaks.length,
      data: leaks.slice(0, 50),
      _debug: debug
    });

  } catch (criticalErr) {
    // Totální záchranná brzda - API nikdy nesmí vrátit 500
    return NextResponse.json({
      success: false,
      count: 0,
      data: [],
      error: criticalErr.message
    });
  }
}
