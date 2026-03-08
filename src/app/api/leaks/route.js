import { NextResponse } from 'next/server';
import { XMLParser } from "fast-xml-parser";

export const dynamic = 'force-dynamic';

/**
 * GURU BACKEND ENGINE - LEAKS & RUMORS FINAL BYPASS
 * Cesta: src/app/api/leaks/route.js
 * Funkce: Eliminace 404, obcházení blokací a filtrace čínského spamu.
 */

const REDDIT_URL = "https://www.reddit.com/r/GamingLeaksAndRumours/new.json?limit=25";
const CHIPHELL_URL = "https://www.chiphell.com/forum.php?mod=rss&fid=224";

// Proxy fallback pro obejití banů na IP Vercelu
const proxy = (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}&t=${Date.now()}`;

async function safeFetch(url) {
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 GuruBot/3.0",
    "Accept": "*/*",
  };

  // Pokus 1: Přímý fetch ze serveru
  try {
    const res = await fetch(url, { headers, cache: 'no-store' });
    if (res.ok) return await res.text();
  } catch (e) {
    console.error(`Direct fetch failed for ${url}`);
  }

  // Pokus 2: Fallback přes AllOrigins Proxy
  try {
    const res = await fetch(proxy(url), { cache: 'no-store' });
    if (res.ok) return await res.text();
  } catch (e) {
    console.error(`Proxy fetch failed for ${url}`);
  }

  return null;
}

export async function GET() {
  const leaks = [];
  const parser = new XMLParser({ ignoreAttributes: false, trimValues: true });

  // --- 1. REDDIT ---
  try {
    const redditRaw = await safeFetch(REDDIT_URL);
    if (redditRaw) {
      const json = JSON.parse(redditRaw);
      const posts = json?.data?.children?.map((p) => ({
        title: p.data.title,
        link: `https://reddit.com${p.data.permalink}`,
        pubDate: new Date(p.data.created_utc * 1000).toISOString(),
        description: p.data.selftext || p.data.title,
        source: "Reddit Leaks",
        intelType: "leaks",
      })) || [];
      leaks.push(...posts);
    }
  } catch (err) {
    console.error("Reddit processing error:", err);
  }

  // --- 2. CHIPHELL ---
  try {
    const xml = await safeFetch(CHIPHELL_URL);
    if (xml) {
      const json = parser.parse(xml);
      const items = json?.rss?.channel?.item || [];
      const chipArray = Array.isArray(items) ? items : [items];

      const posts = chipArray
        .filter(i => i && i.title)
        // 🚀 GURU ANTI-SPAM FILTER: Odstranění "Denních přihlášení" a balastu
        .filter(i => {
          const t = i.title.toString();
          const spamTerms = ['签到', '每日', '回复', '帖', '领取', 'Check-in', 'Daily'];
          return !spamTerms.some(term => t.includes(term));
        })
        .map((i) => ({
          title: i.title,
          link: i.link,
          pubDate: i.pubDate ? new Date(i.pubDate).toISOString() : new Date().toISOString(),
          description: i.description || i.title,
          source: "Chiphell",
          intelType: "leaks",
        }));
      leaks.push(...posts);
    }
  } catch (err) {
    console.error("Chiphell processing error:", err);
  }

  // --- SORT & RESPONSE ---
  leaks.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  return NextResponse.json({
    success: true,
    count: leaks.length,
    data: leaks,
  });
}
