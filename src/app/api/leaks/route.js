import { NextResponse } from 'next/server';
import { XMLParser } from "fast-xml-parser";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GURU BACKEND ENGINE - LEAKS & RUMORS SUPREME BYPASS V4.0
 * Funkce: Pokročilé maskování prohlížeče a řetězová rotace proxy.
 */

const REDDIT_URL = "https://www.reddit.com/r/GamingLeaksAndRumours/new.json?limit=25";
const CHIPHELL_URL = "https://www.chiphell.com/forum.php?mod=rss&fid=224";

// Reálný fingerprint prohlížeče Chrome 122
const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,application/json;q=0.8,*/*;q=0.7",
  "Accept-Language": "en-US,en;q=0.9,cs;q=0.8",
  "Cache-Control": "no-cache",
  "Pragma": "no-cache",
  "Referer": "https://www.google.com/",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Upgrade-Insecure-Requests": "1"
};

// Řetězec proxy serverů (Direct -> CorsProxy -> AllOrigins)
const proxyChain = [
  (u) => u, // Přímý pokus
  (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
  (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`
];

async function advancedFetch(url) {
  let errors = [];
  
  for (const proxyFn of proxyChain) {
    const target = proxyFn(url);
    try {
      const res = await fetch(target, { 
        headers: BROWSER_HEADERS,
        cache: 'no-store'
      });

      if (res.ok) {
        const text = await res.text();
        // Kontrola, zda jsme nedostali prázdný nebo chybový HTML balast
        if (text && text.length > 200 && !text.includes("Cloudflare to restrict access")) {
          return { ok: true, data: text };
        }
      }
      errors.push(`${target} -> Status ${res.status}`);
    } catch (e) {
      errors.push(`${target} -> ${e.message}`);
    }
  }
  return { ok: false, errors };
}

export async function GET() {
  const leaks = [];
  const debug = { reddit: {}, chiphell: {} };
  const parser = new XMLParser({ ignoreAttributes: false, trimValues: true });

  // 1. REDDIT BYPASS
  const redditFetch = await advancedFetch(REDDIT_URL);
  debug.reddit.ok = redditFetch.ok;
  debug.reddit.errors = redditFetch.errors;

  if (redditFetch.ok) {
    try {
      const json = JSON.parse(redditFetch.data);
      (json?.data?.children || []).forEach(p => {
        leaks.push({
          title: p.data.title,
          link: `https://reddit.com${p.data.permalink}`,
          description: p.data.selftext || p.data.title,
          source: "Reddit Leaks",
          intelType: "leaks",
          pubDate: new Date(p.data.created_utc * 1000).toISOString()
        });
      });
    } catch (e) { debug.reddit.parseError = e.message; }
  }

  // 2. CHIPHELL BYPASS + SPAM FILTER
  const chiphellFetch = await advancedFetch(CHIPHELL_URL);
  debug.chiphell.ok = chiphellFetch.ok;
  debug.chiphell.errors = chiphellFetch.errors;

  if (chiphellFetch.ok) {
    try {
      const json = parser.parse(chiphellFetch.data);
      const items = json?.rss?.channel?.item || [];
      const chipArray = Array.isArray(items) ? items : [items];
      
      chipArray.forEach(i => {
        if (!i?.title) return;
        const t = i.title.toString();
        // Tvrdý filtr na "Denní přihlášení" (每日签到)
        const isSpam = /签到|每日|回复|领取|Check-in|Daily/.test(t);
        if (!isSpam) {
          leaks.push({
            title: i.title,
            link: i.link,
            description: i.description || i.title,
            source: "Chiphell",
            intelType: "leaks",
            pubDate: i.pubDate ? new Date(i.pubDate).toISOString() : new Date().toISOString()
          });
        }
      });
    } catch (e) { debug.chiphell.parseError = e.message; }
  }

  // Finální srovnání
  leaks.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  return NextResponse.json({
    success: true,
    count: leaks.length,
    data: leaks,
    _debug: debug // Logování pro případ, že count bude zase 0
  });
}
