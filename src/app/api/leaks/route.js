import { NextResponse } from 'next/server';
import { XMLParser } from "fast-xml-parser";
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GURU INTEL ENGINE V11.6 - SDK STABILITY & DEDUPLICATION
 * - Použití oficiálního OpenAI SDK (stejně jako u tweaků).
 * - Striktní separace zdrojů (Leaks, HW, Game).
 * - Neúprosná kontrola duplicit proti DB a cross-category.
 */

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const LEAK_SOURCES = [
  { name: "Reddit GL&R", url: "https://www.reddit.com/r/GamingLeaksAndRumours/new/.rss", type: "leaks" },
  { name: "Chiphell", url: "https://www.chiphell.com/forum.php?mod=rss&fid=224", type: "leaks" },
  { name: "ResetEra", url: "https://www.resetera.com/forums/gaming-forum.7/index.rss", type: "leaks" },
  { name: "Insider Gaming", url: "https://insider-gaming.com/feed/", type: "leaks" },
  { name: "VGC", url: "https://www.videogameschronicle.com/feed/", type: "leaks" },
  { name: "N4G", url: "https://n4g.com/rss/news", type: "leaks" }
];

const HW_SOURCES = [
  { name: "VideoCardz", url: "https://videocardz.com/feed", type: "hw" },
  { name: "Tom's Hardware", url: "https://www.tomshardware.com/feeds.xml", type: "hw" },
  { name: "Wccftech HW", url: "https://wccftech.com/category/hardware/feed/", type: "hw" }
];

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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Používáme admin klíč pro bypass RLS při kontrole duplicit
);

// 🛡️ SDK AI SCORER - Fix pro choices undefined
const getAIScores = async (titles) => {
  if (!process.env.OPENAI_API_KEY || titles.length === 0) return {};
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Jsi HW/Game insider. Ohodnoť viralitu (0-100). Vrať JSON { scores: [{ title, score }] }" },
        { role: "user", content: JSON.stringify(titles) }
      ],
      response_format: { type: "json_object" }
    });
    
    const content = completion.choices[0]?.message?.content;
    if (!content) return {};

    const parsed = JSON.parse(content);
    const scoreMap = {};
    (parsed.scores || []).forEach(item => { 
      if (item.title) scoreMap[item.title.toLowerCase().trim()] = item.score; 
    });
    return scoreMap;
  } catch (err) { 
    console.error("Guru AI Scoring Error:", err.message);
    return {}; 
  }
};

export async function GET() {
  const debug = { ai_active: false, ai_status: "pending", db_filtered: 0, cross_duplicates: 0 };

  try {
    // 🛡️ GURU DB SHIELD: Načtení všech titulů pro filtraci
    const { data: existingPosts } = await supabase.from('posts').select('title, title_en');
    const dbTitles = new Set((existingPosts || []).flatMap(p => [
      p.title?.toLowerCase().trim(),
      p.title_en?.toLowerCase().trim()
    ]).filter(Boolean));

    const fetchItems = async (sources) => {
      const results = await Promise.all(sources.map(async (src) => {
        try {
          const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(src.url)}&api_key=${process.env.RSS2JSON_API_KEY || ''}&t=${Date.now()}`, { 
            headers: BROWSER_HEADERS,
            next: { revalidate: 0 } 
          });
          const json = await res.json();
          if (json.status === 'ok') {
            return (json.items || []).map(item => ({
              title: item.title,
              link: item.link,
              description: item.description,
              source: src.name,
              intelType: src.type,
              pubDate: item.pubDate,
              image_url: item.enclosure?.link || item.thumbnail || null
            }));
          }
          return [];
        } catch (e) { return []; }
      }));
      return results.flat();
    };

    const [leaksRaw, hwRaw, gamesRaw] = await Promise.all([
      fetchItems(LEAK_SOURCES),
      fetchItems(HW_SOURCES),
      fetchItems(GAME_SOURCES)
    ]);

    const combined = [...leaksRaw, ...hwRaw, ...gamesRaw];
    const uniqueMap = new Map();
    
    // 🚀 GURU CROSS-CATEGORY DEDUPLICATION
    combined.forEach(item => {
      if (!item.title) return;
      const key = item.title.toLowerCase().trim();
      
      if (dbTitles.has(key)) {
        debug.db_filtered++;
        return;
      }

      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      } else {
        debug.cross_duplicates++;
      }
    });

    const finalItems = Array.from(uniqueMap.values());

    // AI SCORING přes SDK
    const titlesForAI = finalItems.slice(0, 40).map(i => i.title);
    const aiScores = await getAIScores(titlesForAI);
    
    if (Object.keys(aiScores).length > 0) {
      debug.ai_active = true;
      debug.ai_status = "success";
      finalItems.forEach(i => { 
        i.viral_score = aiScores[i.title.toLowerCase().trim()] || 50; 
      });
    }

    finalItems.sort((a, b) => (b.viral_score || 0) - (a.viral_score || 0));

    return NextResponse.json({ 
      success: true, 
      count: finalItems.length, 
      data: finalItems, 
      _debug: debug 
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
