import { NextResponse } from 'next/server';
import { XMLParser } from "fast-xml-parser";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GURU INTEL ENGINE V10.8 - STRIKTNÍ SEPARACE ZDROJŮ
 * Definované zdroje pro každý radar zvlášť.
 */

// 📂 1. LEAKS & RUMORS (Pouze ty, které jsi přikázal)
const LEAK_SOURCES = [
  { name: "Reddit GL&R", url: "https://www.reddit.com/r/GamingLeaksAndRumours/new/.rss", type: "leaks" },
  { name: "Chiphell", url: "https://www.chiphell.com/forum.php?mod=rss&fid=224", type: "leaks" },
  { name: "ResetEra", url: "https://www.resetera.com/forums/gaming-forum.7/index.rss", type: "leaks" },
  { name: "Insider Gaming", url: "https://insider-gaming.com/feed/", type: "leaks" },
  { name: "VGC", url: "https://www.videogameschronicle.com/feed/", type: "leaks" },
  { name: "N4G", url: "https://n4g.com/rss/news", type: "leaks" }
];

// 📂 2. HARDWARE RADAR (Čistý křemík)
const HW_SOURCES = [
  { name: "VideoCardz", url: "https://videocardz.com/feed", type: "hw" },
  { name: "Tom's Hardware", url: "https://www.tomshardware.com/feeds.xml", type: "hw" },
  { name: "Wccftech HW", url: "https://wccftech.com/category/hardware/feed/", type: "hw" }
];

// 📂 3. GAMING RADAR (AAA tituly a konzole)
const GAME_SOURCES = [
  { name: "IGN", url: "https://feeds.ign.com/ign/games-all", type: "game" },
  { name: "GameSpot", url: "https://www.gamespot.com/feeds/news/", type: "game" },
  { name: "Wccftech Game", url: "https://wccftech.com/category/games/feed/", type: "game" }
];

const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Accept": "application/rss+xml, application/xml, application/json",
  "Cache-Control": "no-cache"
};

const getAIScores = async (titles, apiKey) => {
  if (!apiKey) return {};
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: "Jsi HW/Game insider. Ohodnoť viralitu (0-100). Vrať JSON { scores: [{ title, score }] }" }, { role: "user", content: JSON.stringify(titles) }],
        response_format: { type: "json_object" }
      })
    });
    const result = await response.json();
    const parsed = JSON.parse(result.choices[0].message.content);
    const scoreMap = {};
    (parsed.scores || []).forEach(item => { scoreMap[item.title.toLowerCase().trim()] = item.score; });
    return scoreMap;
  } catch (err) { return {}; }
};

export async function GET() {
  const parser = new XMLParser({ ignoreAttributes: false, trimValues: true });
  const allData = [];
  const debug = { ai_active: false, ai_status: "pending" };
  const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;

  const fetchItems = async (sources) => {
    const results = await Promise.all(sources.map(async (src) => {
      try {
        const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(src.url)}&t=${Date.now()}`, { headers: BROWSER_HEADERS });
        const json = await res.json();
        return (json.items || []).map(item => ({
          title: item.title,
          link: item.link,
          description: item.description,
          source: src.name,
          intelType: src.type,
          pubDate: item.pubDate,
          image_url: item.enclosure?.link || item.thumbnail || null
        }));
      } catch (e) { return []; }
    }));
    return results.flat();
  };

  try {
    const [leaks, hw, games] = await Promise.all([
      fetchItems(LEAK_SOURCES),
      fetchItems(HW_SOURCES),
      fetchItems(GAME_SOURCES)
    ]);

    const combined = [...leaks, ...hw, ...games];
    const uniqueMap = new Map();
    combined.forEach(i => { if (i.title) uniqueMap.set(i.title.toLowerCase().trim(), i); });
    const finalItems = Array.from(uniqueMap.values());

    const titlesForAI = finalItems.slice(0, 40).map(i => i.title);
    const aiScores = await getAIScores(titlesForAI, apiKey);
    
    if (Object.keys(aiScores).length > 0) {
      debug.ai_active = true;
      debug.ai_status = "success";
      finalItems.forEach(i => { i.viral_score = aiScores[i.title.toLowerCase().trim()] || 50; });
    }

    return NextResponse.json({ success: true, count: finalItems.length, data: finalItems, _debug: debug });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
