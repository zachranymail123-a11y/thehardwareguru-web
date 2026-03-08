import { NextResponse } from 'next/server';
import { XMLParser } from "fast-xml-parser";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GURU BACKEND ENGINE - LEAKS & RUMORS NUCLEAR SHIELD V8.1
 * Cesta: src/app/api/leaks/route.js
 * Oprava: Deep-text parser pro Chiphell (vytahuje text z jakkoliv vnořených objektů).
 */

const REDDIT_SOURCES = [
  "https://www.reddit.com/r/GamingLeaksAndRumours/.rss",
  "https://www.reddit.com/r/GamingLeaksAndRumours/new.json?limit=25"
];

const CHIPHELL_RSS = "https://www.chiphell.com/forum.php?mod=rss&fid=224";

const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9,cs;q=0.8",
  "Cache-Control": "no-cache",
  "Pragma": "no-cache",
  "Referer": "https://www.google.com/",
  "Upgrade-Insecure-Requests": "1"
};

const SPAM_BLACKLIST = [
  '签到', '每日', '回复', '领取', 'Check-in', 'Daily', 'posted', '版块', '积分', '奖励', '领取', '金币', '任务'
];

// 🚀 GURU RECURSIVE TEXT EXTRACTOR
const getDeepText = (obj) => {
  if (!obj) return "";
  if (typeof obj === 'string') return obj;
  if (obj["#text"]) return String(obj["#text"]);
  if (obj["cdata"]) return String(obj["cdata"]);
  if (Array.isArray(obj)) return obj.map(getDeepText).join(" ");
  if (typeof obj === 'object') {
    return Object.values(obj).map(val => typeof val === 'string' ? val : getDeepText(val)).join(" ");
  }
  return String(obj);
};

async function fetchWithTimeout(url, options = {}, ms = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

async function fetchReddit() {
  for (const url of REDDIT_SOURCES) {
    try {
      const res = await fetchWithTimeout(url, { headers: BROWSER_HEADERS, cache: "no-store" });
      if (!res.ok) continue;

      const text = await res.text();
      if (text.length > 200 && (text.includes('<?xml') || text.includes('<rss') || text.includes('<feed') || (url.includes('json') && text.trim().startsWith('{')))) {
        return { type: url.includes("json") ? "json" : "rss", data: text };
      }
    } catch (e) {
      console.warn(`Reddit fetch attempt failed for ${url}`);
    }
  }
  return null;
}

export async function GET() {
  const leaks = [];
  const debug = { 
    reddit: "pending", 
    chiphell: "pending", 
    chiphell_raw_count: 0,
    chiphell_final_count: 0 
  };
  
  const parser = new XMLParser({ 
    ignoreAttributes: false, 
    trimValues: true,
    attributeNamePrefix: "@_",
    parseAttributeValue: true
  });

  try {
    // --- 1. REDDIT ENGINE ---
    const redditResult = await fetchReddit();
    if (redditResult) {
      try {
        if (redditResult.type === "json") {
          const json = JSON.parse(redditResult.data);
          (json?.data?.children || []).forEach(post => {
            const p = post.data;
            leaks.push({
              title: p.title,
              link: `https://reddit.com${p.permalink}`,
              description: p.title,
              source: "Reddit Leaks",
              intelType: "leaks",
              pubDate: new Date(p.created_utc * 1000).toISOString()
            });
          });
        } else {
          const json = parser.parse(redditResult.data);
          const entries = json?.feed?.entry || json?.rss?.channel?.item || [];
          const arr = Array.isArray(entries) ? entries : [entries];
          
          arr.forEach(entry => {
            const title = getDeepText(entry.title);
            if (title && title !== "GamingLeaksAndRumours") {
              const link = entry.link?.["@_href"] || entry.link || "";
              const date = entry.updated || entry.pubDate || new Date().toISOString();
              leaks.push({
                title, link, description: title,
                source: "Reddit Leaks", intelType: "leaks",
                pubDate: new Date(date).toISOString()
              });
            }
          });
        }
        debug.reddit = "ok";
      } catch (e) { debug.reddit = "parse_error"; }
    } else { debug.reddit = "blocked_or_failed"; }

    // --- 2. CHIPHELL ENGINE (Supreme Deep-Parsing) ---
    try {
      const res = await fetchWithTimeout(CHIPHELL_RSS, { headers: BROWSER_HEADERS, cache: "no-store" });
      if (res.ok) {
        const xml = await res.text();
        const json = parser.parse(xml);
        const items = json?.rss?.channel?.item || [];
        const itemsArray = Array.isArray(items) ? items : [items];
        debug.chiphell_raw_count = itemsArray.length;

        itemsArray.forEach(item => {
          if (!item) return;
          
          // 🚀 GURU SUPREME EXTRACT: Vytahujeme titulky a linky z Chiphell hlubin
          let t = getDeepText(item.title);
          t = t.toString().replace(/<!\[CDATA\[|\]\]>/g, "").trim();
          
          let l = getDeepText(item.link);
          
          // 🛡️ GURU FILTR: Čistíme balast a spam
          const isSpam = SPAM_BLACKLIST.some(term => t.includes(term));
          if (!isSpam && t.length > 8 && !t.includes("[object Object]")) {
            leaks.push({
              title: t,
              link: l,
              description: t,
              source: "Chiphell",
              intelType: "leaks",
              pubDate: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString()
            });
            debug.chiphell_final_count++;
          }
        });
        debug.chiphell = "ok";
      } else { debug.chiphell = `fetch_failed: ${res.status}`; }
    } catch (e) { debug.chiphell = `error: ${e.message}`; }

    // --- SJEDNOCENÍ & FINÁLNÍ FILTR ---
    leaks.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    return NextResponse.json({
      success: true,
      count: leaks.length,
      data: leaks.slice(0, 50),
      _debug: debug
    });

  } catch (err) {
    return NextResponse.json({
      success: false, count: 0, data: [], error: err.message
    });
  }
}
