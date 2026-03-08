import { NextResponse } from 'next/server';
import { XMLParser } from "fast-xml-parser";

// Vynucené dynamické renderování pro čerstvá data a AI analýzu v reálném čase
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GURU BACKEND ENGINE - UNIFIED AI SCORING V8.9
 * Cesta: src/app/api/leaks/route.js
 * Funkce: Globální agregátor HW/Gaming novinek s AI scoringem pro 3 klíčové pilíře:
 * 1. Hardware Radar (NVIDIA, AMD, Intel, SoC...)
 * 2. Gaming Radar (AAA tituly, konzole, handheldy...)
 * 3. Leaks & Rumors (Průmyslové úniky, uniklé fotky, benchmarky...)
 */

// 1. GLOBÁLNÍ KONFIGURACE ZDROJŮ (Multi-Radar)
const REDDIT_URL = "https://www.reddit.com/r/GamingLeaksAndRumours/new.json?limit=40";
const CHIPHELL_SOURCES = [
  "https://www.chiphell.com/forum.php?mod=rss&fid=183", // Rumors & Leaks
  "https://www.chiphell.com/forum.php?mod=rss&fid=52"   // Hardware Info
];
const GLOBAL_FEEDS = [
  "https://videocardz.com/feed",
  "https://wccftech.com/feed"
];

const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9,cs;q=0.8,zh-CN;q=0.7",
  "Cache-Control": "no-cache",
  "Referer": "https://www.google.com/"
};

// Seznam zakázaných slov (čínský "Daily check-in" spam)
const SPAM_BLACKLIST = ['签到', '每日', '回复', '领取', 'Check-in', 'Daily', 'posted', '积分', '奖励', '任务', '申请'];

/**
 * 🧠 GURU UNIFIED AI SCORING ENGINE
 * Provádí hloubkovou analýzu virálního potenciálu napříč všemi Radary.
 */
const getAIScores = async (titles) => {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey || titles.length === 0) return {};

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Jsi Hardware Guru AI. Jsi elitní technologický insider a expert na globální trendy.
            Tvým úkolem je ohodnotit virální potenciál (skóre 0-100) pro tři sekce webu:
            
            1. HARDWARE RADAR: Zaměř se na Blackwell (RTX 50), Zen 6, Arrow Lake, Strix Halo, nové ARM čipy.
            2. GAMING RADAR: Zaměř se na PS5 Pro, Switch 2, GTA VI, Valve Deckard, Steam Deck 2, handheldy.
            3. LEAKS & RUMORS: Hodnoť vysoce uniklé fotky, benchmarky prototypů, finanční zprávy o akvizicích a zrušených projektech.
            
            Skóre 90+ dávej jen věcem, které způsobí v komunitě zemětřesení. Vracej POUZE čistý JSON: { scores: [{ title: string, score: number }] }`
          },
          {
            role: "user",
            content: `Zanalyzuj tyto tituly a vrať skóre podle aktuální důležitosti v HW/Gaming komunitě: ${JSON.stringify(titles)}`
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    const result = await response.json();
    const parsed = JSON.parse(result.choices[0].message.content);
    
    const scoreMap = {};
    parsed.scores.forEach(item => {
      scoreMap[item.title.toLowerCase()] = item.score;
    });
    return scoreMap;
  } catch (err) {
    console.error("Guru AI Scoring Error:", err);
    return {};
  }
};

const getDeepText = (obj) => {
  if (!obj) return "";
  if (typeof obj === 'string') return obj;
  if (obj["#text"]) return String(obj["#text"]);
  if (obj["cdata"]) return String(obj["cdata"]);
  if (Array.isArray(obj)) return obj.map(getDeepText).join(" ");
  if (typeof obj === 'object') return Object.values(obj).map(val => getDeepText(val)).join(" ");
  return String(obj);
};

const cleanTitle = (t) => {
  return t.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/\[.*?\]/g, "").trim();
};

/**
 * Supreme Fetch Engine - Agresivní obcházení Cloudflare proxy serverů
 */
async function supremeProxyFetch(url, isJson = false) {
  const proxies = [
    { name: 'Direct', fn: (u) => u },
    { name: 'AllOrigins-Get', fn: (u) => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}&t=${Date.now()}` },
    { name: 'Codetabs', fn: (u) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}` },
    { name: 'CorsProxy', fn: (u) => `https://corsproxy.io/?${encodeURIComponent(u)}` }
  ];

  for (const proxy of proxies) {
    try {
      const res = await fetch(proxy.fn(url), { headers: BROWSER_HEADERS, cache: "no-store" });
      if (!res.ok) continue;

      let text = await res.text();
      if (text.trim().startsWith('{')) {
        try {
          const json = JSON.parse(text);
          if (json.contents) text = json.contents;
        } catch(e) {}
      }

      if (text && text.length > 300) {
        if (isJson && (text.trim().startsWith('{') || text.trim().startsWith('['))) return { type: 'json', data: text };
        if (!isJson && (text.includes('<?xml') || text.includes('<rss') || text.includes('<feed'))) return { type: 'xml', data: text };
      }
    } catch (e) {}
  }
  return null;
}

export async function GET() {
  const leaks = [];
  const debug = { reddit: 0, chiphell: 0, global: 0, sources_failed: [], ai_active: false };
  const parser = new XMLParser({ ignoreAttributes: false, trimValues: true, attributeNamePrefix: "@_", parseAttributeValue: true });

  try {
    // --- PILÍŘ 1: REDDIT LEAKS ENGINE ---
    const redditResult = await supremeProxyFetch(REDDIT_URL, true);
    if (redditResult && redditResult.type === 'json') {
      try {
        const json = JSON.parse(redditResult.data);
        (json?.data?.children || []).forEach(post => {
          const p = post.data;
          if (p.title) {
            leaks.push({
              title: p.title,
              link: `https://reddit.com${p.permalink}`,
              description: p.selftext || p.title,
              source: "Reddit Leaks",
              intelType: "leaks",
              pubDate: new Date(p.created_utc * 1000).toISOString()
            });
            debug.reddit++;
          }
        });
      } catch (e) { debug.sources_failed.push("reddit_json_parse"); }
    } else { debug.sources_failed.push("reddit_fetch_failed"); }

    // --- PILÍŘ 2: CHIPHELL RUMORS ENGINE ---
    for (const url of CHIPHELL_SOURCES) {
      const chipResult = await supremeProxyFetch(url, false);
      if (chipResult) {
        try {
          const json = parser.parse(chipResult.data);
          const itemsArray = Array.isArray(json?.rss?.channel?.item) ? json.rss.channel.item : [json?.rss?.channel?.item];
          
          itemsArray.forEach(item => {
            if (!item) return;
            let t = cleanTitle(getDeepText(item.title));
            const isSpam = SPAM_BLACKLIST.some(term => t.includes(term));
            if (!isSpam && t.length > 8 && !t.includes("[object Object]")) {
              leaks.push({
                title: t,
                link: getDeepText(item.link),
                description: t,
                source: "Chiphell",
                intelType: "leaks",
                pubDate: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString()
              });
              debug.chiphell++;
            }
          });
        } catch (e) { debug.sources_failed.push(`chiphell_parse_${url.split('fid=')[1]}`); }
      } else { debug.sources_failed.push(`chiphell_fetch_${url.split('fid=')[1]}`); }
    }

    // --- PILÍŘ 3: GLOBAL FEED RADARS (Wccftech / VideoCardz) ---
    for (const url of GLOBAL_FEEDS) {
      try {
        const res = await fetch(url, { headers: BROWSER_HEADERS, cache: "no-store" });
        if (res.ok) {
          const xml = await res.text();
          const json = parser.parse(xml);
          const itemsArray = Array.isArray(json?.rss?.channel?.item) ? json.rss.channel.item : [json?.rss?.channel?.item];
          
          itemsArray.forEach(item => {
            const t = cleanTitle(getDeepText(item.title));
            if (t && t.length > 5) {
              leaks.push({
                title: t,
                link: getDeepText(item.link),
                description: t,
                source: url.includes("videocardz") ? "VideoCardz" : "Wccftech",
                intelType: "leaks",
                pubDate: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString()
              });
              debug.global++;
            }
          });
        }
      } catch (e) {}
    }

    // --- 🚀 GURU ANTI-DUPLICITY & FILTERING ---
    const uniqueMap = new Map();
    leaks.forEach(item => {
      const key = item.title.toLowerCase().trim();
      if (!uniqueMap.has(key)) uniqueMap.set(key, item);
    });
    const finalItems = Array.from(uniqueMap.values());

    // --- 🧠 UNIFIED AI SCORING (Hardware Radar / Gaming Radar / Leaks) ---
    const titlesForAI = finalItems.slice(0, 50).map(i => i.title);
    const aiScores = await getAIScores(titlesForAI);
    
    if (Object.keys(aiScores).length > 0) {
      debug.ai_active = true;
      finalItems.forEach(item => {
        item.viral_score = aiScores[item.title.toLowerCase()] || 45;
      });
    } else {
      // Emergency Fallback
      finalItems.forEach(item => { item.viral_score = 50; });
    }

    // Radíme nekompromisně podle AI virálního skóre, pak podle data
    finalItems.sort((a, b) => {
      if (b.viral_score !== a.viral_score) return b.viral_score - a.viral_score;
      return new Date(b.pubDate) - new Date(a.pubDate);
    });

    return NextResponse.json({
      success: true,
      count: finalItems.length,
      data: finalItems.slice(0, 100),
      _debug: debug
    });

  } catch (err) {
    return NextResponse.json({ success: false, count: 0, data: [], error: err.message });
  }
}
