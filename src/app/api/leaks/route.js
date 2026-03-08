import { NextResponse } from 'next/server';
import { XMLParser } from "fast-xml-parser";
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GURU INTEL ENGINE V13.0 - NUCLEAR DIRECT XML & SYNC
 * - Fix: Přímé nativní čtení XML přes fast-xml-parser (konec blokování z rss2json).
 * - Fix: Křížová kontrola duplicity (Cross-category Leaks > HW > Game).
 * - Fix: Absolutní antiduplicita napřímo vůči DB tabulkám 'posts' a 'content_plan'.
 * - Fix: 100% Davinci Image Fallback pro všechny články bez obrázku.
 */

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 🚀 TVOJE ZDROJE (STRIKTNĚ ROZDĚLENÉ)
const LEAK_SOURCES = [
  { name: "Reddit GL&R", url: "https://www.reddit.com/r/GamingLeaksAndRumours/new/.rss", type: "leaks" },
  { name: "Insider Gaming", url: "https://insider-gaming.com/feed/", type: "leaks" },
  { name: "Reddit SteamDB", url: "https://www.reddit.com/r/SteamDB/new/.rss", type: "leaks" }
];

const HW_SOURCES = [
  { name: "VideoCardz", url: "https://videocardz.com/feed", type: "hw" },
  { name: "TechPowerUp", url: "https://www.techpowerup.com/rss/news", type: "hw" },
  { name: "Chiphell", url: "https://www.chiphell.com/forum.php?mod=rss&fid=224", type: "hw" },
  { name: "Guru3D", url: "https://www.guru3d.com/news/rss/", type: "hw" }
];

const GAME_SOURCES = [
  { name: "MP1st", url: "https://mp1st.com/feed", type: "game" },
  { name: "DSOGaming", url: "https://www.dsogaming.com/feed/", type: "game" },
  { name: "SteamDB Blog", url: "https://steamdb.info/blog/rss/", type: "game" }
];

// 🛠️ NATIVNÍ PARSER
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  cdataPropName: "__cdata"
});

const extractText = (node) => {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (node.__cdata) return node.__cdata;
  if (node['#text']) return node['#text'];
  return String(node);
};

const getLink = (item) => {
  if (typeof item.link === 'string') return item.link;
  if (item.link && item.link['@_href']) return item.link['@_href'];
  if (typeof item.id === 'string' && item.id.startsWith('http')) return item.id;
  return '';
};

const extractImage = (item) => {
  if (item['media:content'] && item['media:content']['@_url']) return item['media:content']['@_url'];
  if (item['media:thumbnail'] && item['media:thumbnail']['@_url']) return item['media:thumbnail']['@_url'];
  if (item.enclosure && item.enclosure['@_url']) return item.enclosure['@_url'];
  
  // Detekce v HTML popisu
  const content = extractText(item['content:encoded'] || item.content || item.description || item.summary);
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/i);
  if (imgMatch && imgMatch[1]) return imgMatch[1];
  
  return null;
};

// 🛡️ SDK AI SCORER
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
    (parsed.scores || []).forEach(item => { if (item.title) scoreMap[item.title.toLowerCase().trim()] = item.score; });
    return scoreMap;
  } catch (err) { 
    console.error("Guru AI Scoring Error:", err.message);
    return {}; 
  }
};

export async function GET() {
  const debug = { db_filtered: 0, cross_duplicates: 0, failed_feeds: [] };
  
  // 🚀 GURU: 100% GARANTOVANÝ OBRÁZEK Z TVÉ DATABÁZE
  const fallbackImage = `${process.env.NEXT_PUBLIC_SUPABASE_URL || ''}/storage/v1/object/public/images/davinci_prompt__a_high_tech__cinematic_placeholder_for_a_g.png`;

  try {
    // 🛡️ GURU NUKLEÁRNÍ SHIELD: Napřímo čte 'posts' i 'content_plan'
    const [postsRes, planRes] = await Promise.all([
      supabase.from('posts').select('title, title_en'),
      supabase.from('content_plan').select('title, title_en') // Přidáno čtení content_plan!
    ]);

    const dbTitles = new Set([
      ...(postsRes.data || []).flatMap(p => [p.title?.toLowerCase().trim(), p.title_en?.toLowerCase().trim()]),
      ...(planRes.data || []).flatMap(p => [p.title?.toLowerCase().trim(), p.title_en?.toLowerCase().trim()])
    ].filter(Boolean));

    const fetchItems = async (sources) => {
      const results = await Promise.all(sources.map(async (src) => {
        try {
          const res = await fetch(src.url, { 
            headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/xml, text/xml' },
            cache: 'no-store'
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          
          const xml = await res.text();
          const parsed = parser.parse(xml);
          
          let rawItems = [];
          if (parsed?.rss?.channel?.item) {
            rawItems = Array.isArray(parsed.rss.channel.item) ? parsed.rss.channel.item : [parsed.rss.channel.item];
          } else if (parsed?.feed?.entry) {
            rawItems = Array.isArray(parsed.feed.entry) ? parsed.feed.entry : [parsed.feed.entry];
          }

          return rawItems.slice(0, 15).map(item => ({
            title: extractText(item.title).replace(/<[^>]*>?/gm, '').trim(),
            link: getLink(item),
            description: extractText(item.description || item.summary || item.content).replace(/<[^>]*>?/gm, '').substring(0, 200),
            source: src.name,
            intelType: src.type,
            pubDate: extractText(item.pubDate || item.published || item.updated),
            // KAZDY CLANEK ktery nema svuj obrazek dostane fallback
            image_url: extractImage(item) || fallbackImage
          }));
        } catch (e) { 
          debug.failed_feeds.push(src.name);
          return []; 
        }
      }));
      return results.flat();
    };

    // Stahujeme postupně
    const [leaksRaw, hwRaw, gamesRaw] = await Promise.all([
      fetchItems(LEAK_SOURCES),
      fetchItems(HW_SOURCES),
      fetchItems(GAME_SOURCES)
    ]);

    // 🚀 GURU CROSS-CATEGORY DEDUPLICATION: Leaks mají prioritu
    const combined = [...leaksRaw, ...hwRaw, ...gamesRaw];
    const uniqueMap = new Map();
    
    combined.forEach(item => {
      if (!item.title) return;
      const key = item.title.toLowerCase().trim();
      
      // 1. Ochrana proti Posts a Content Plan
      if (dbTitles.has(key)) {
        debug.db_filtered++;
        return;
      }

      // 2. Křížová ochrana (pokud to už je v leacích, nepřidá se to do Game)
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      } else {
        debug.cross_duplicates++;
      }
    });

    const finalItems = Array.from(uniqueMap.values());

    // AI SCORING
    const titlesForAI = finalItems.slice(0, 30).map(i => i.title);
    const aiScores = await getAIScores(titlesForAI);
    
    finalItems.forEach(i => { 
      i.viral_score = aiScores[i.title.toLowerCase().trim()] || 50; 
    });
    finalItems.sort((a, b) => b.viral_score - a.viral_score);

    return NextResponse.json({ success: true, count: finalItems.length, data: finalItems, _debug: debug });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
