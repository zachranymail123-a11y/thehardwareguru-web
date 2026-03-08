import { NextResponse } from 'next/server';
import { XMLParser } from "fast-xml-parser";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GURU BACKEND ENGINE - LEAKS & RUMORS SUPREME BYPASS V5.0
 * Cesta: src/app/api/leaks/route.js
 * Oprava: Přepnuto na RSS pro Reddit (vyšší stabilita) a vylepšené maskování.
 */

// Používáme RSS verzi pro Reddit, je méně hlídaná než .json
const REDDIT_RSS = "https://www.reddit.com/r/GamingLeaksAndRumours/new/.rss";
const CHIPHELL_RSS = "https://www.chiphell.com/forum.php?mod=rss&fid=224";

// Reálný fingerprint prohlížeče Chrome 122 s moderními Sec-CH hlavičkami
const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Accept": "application/rss+xml, application/xml, text/xml, */*",
  "Accept-Language": "en-US,en;q=0.9,cs;q=0.8",
  "Referer": "https://www.google.com/",
  "Sec-Ch-Ua": '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"Windows"',
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1"
};

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
        // Kontrola, zda text vypadá jako XML a není to Cloudflare block page
        if (text && text.includes("<?xml") || text.includes("<rss")) {
          return { ok: true, data: text };
        }
        errors.push(`${target} -> Vráceno HTML místo XML`);
      } else {
        errors.push(`${target} -> Status ${res.status}`);
      }
    } catch (e) {
      errors.push(`${target} -> ${e.message}`);
    }
  }
  return { ok: false, errors };
}

export async function GET() {
  const leaks = [];
  const debug = { reddit: {}, chiphell: {} };
  const parser = new XMLParser({ 
    ignoreAttributes: false, 
    trimValues: true,
    attributeNamePrefix: "@_"
  });

  // --- 1. REDDIT (Nyní přes RSS) ---
  const redditFetch = await advancedFetch(REDDIT_RSS);
  debug.reddit.ok = redditFetch.ok;
  debug.reddit.errors = redditFetch.errors;

  if (redditFetch.ok) {
    try {
      const json = parser.parse(redditFetch.data);
      const entries = json?.feed?.entry || json?.rss?.channel?.item || [];
      const entriesArray = Array.isArray(entries) ? entries : [entries];

      entriesArray.forEach(entry => {
        const title = entry.title?.["#text"] || entry.title || "";
        const link = entry.link?.["@_href"] || entry.link || "";
        const date = entry.updated || entry.pubDate || new Date().toISOString();
        
        if (title) {
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
    } catch (e) { debug.reddit.parseError = e.message; }
  }

  // --- 2. CHIPHELL (RSS + Spam Filter) ---
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
        // 🚀 GURU HARD-FILTER: Eliminace čínského spamu (每日签ado - denní přihlášení atd.)
        const isSpam = /签到|每日|回复|领取|Check-in|Daily|posted/.test(t);
        if (!isSpam && t.length > 5) {
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

  // Seřazení a sjednocení
  leaks.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  return NextResponse.json({
    success: true,
    count: leaks.length,
    data: leaks.slice(0, 40),
    _debug: debug
  });
}
