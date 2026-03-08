import { NextResponse } from 'next/server';
import { XMLParser } from "fast-xml-parser";
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GURU INTEL ENGINE V14.0 - SEMANTIC DEDUPLICATION & ROBUST FETCH
 * - FIX: Sémantická analýza klíčových slov. Řeší situaci, kdy různé weby použijí jiný název.
 * - FIX: Kompletní křížová duplicita a stoprocentní zohlednění 'posts' i 'content_plan'.
 * - FIX: Timeouty pro stahování RSS (Zabraňuje výpadku HW radaru, pokud zdroj neodpovídá).
 * - ZACHOVÁNO: Nativní XML parser, AI skórování, Davinci fallback.
 */

// 🚀 GURU FIX: Zajišťuje, že API nepadne na Vercelu
const openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 🚀 ZDROJE PŘESNĚ PODLE TVÉHO ZADÁNÍ
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
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", cdataPropName: "__cdata" });

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
  const content = extractText(item['content:encoded'] || item.content || item.description || item.summary);
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/i);
  if (imgMatch && imgMatch[1]) return imgMatch[1];
  return null;
};

// 🛡️ GURU SEMANTIC ENGINE: Rozloží titulky na hlavní klíčová slova
const STOP_WORDS = new Set(['this', 'that', 'with', 'from', 'will', 'over', 'game', 'play', 'about', 'more', 'than', 'have', 'been', 'which', 'what', 'when', 'just', 'only', 'after', 'first', 'adds', 'adds']);

const tokenize = (str) => {
  if (!str) return new Set();
  // Necháme jen čistá písmena a čísla
  const words = str.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/);
  return new Set(
    words
      .filter(w => w.length >= 3 && !STOP_WORDS.has(w))
      .map(w => (w.length > 4 && w.endsWith('s')) ? w.slice(0, -1) : w) // Ořez množného čísla (players -> player)
  );
};

const isSemanticDuplicate = (tokens1, tokens2) => {
  if (tokens1.size === 0 || tokens2.size === 0) return false;
  let matches = 0;
  for (const w of tokens1) {
    if (tokens2.has(w)) matches++;
  }
  // Pokud sdílí 3 hlavní keywords NEBO přes 60% společných slov = DUPLICITA!
  const threshold = Math.min(3, Math.ceil(Math.min(tokens1.size, tokens2.size) * 0.6));
  return matches >= threshold;
};

// 🚀 ROBUSTNÍ FETCH S TIMEOUTEM (Proti zamrznutí)
const fetchWithTimeout = async (url, timeout = 6000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { 
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml' 
      },
      signal: controller.signal,
      cache: 'no-store'
    });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
};

// 🛡️ SDK AI SCORER
const getAIScores = async (titles) => {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey || titles.length === 0) return {};
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
  } catch (err) { return {}; }
};


export async function GET() {
  const debug = { db_filtered: 0, cross_duplicates: 0, failed_feeds: [] };
  const fallbackImage = `${process.env.NEXT_PUBLIC_SUPABASE_URL || ''}/storage/v1/object/public/images/davinci_prompt__a_high_tech__cinematic_placeholder_for_a_g.png`;

  try {
    // 🛡️ 1. GURU DOUBLE SHIELD: Čte 'posts' a 'content_plan'
    const [postsRes, planRes] = await Promise.all([
      supabase.from('posts').select('title, title_en').limit(5000),
      supabase.from('content_plan').select('title, title_en').limit(5000)
    ]);

    // Předžvýkání titulátků z DB na klíčová slova
    const dbTokensList = [
      ...(postsRes.data || []),
      ...(planRes.data || [])
    ].flatMap(p => [tokenize(p.title), tokenize(p.title_en)]).filter(set => set.size > 0);

    const fetchItems = async (sources) => {
      const results = await Promise.all(sources.map(async (src) => {
        try {
          const res = await fetchWithTimeout(src.url);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          
          const xml = await res.text();
          const parsed = parser.parse(xml);
          
          let rawItems = [];
          if (parsed?.rss?.channel?.item) rawItems = Array.isArray(parsed.rss.channel.item) ? parsed.rss.channel.item : [parsed.rss.channel.item];
          else if (parsed?.feed?.entry) rawItems = Array.isArray(parsed.feed.entry) ? parsed.feed.entry : [parsed.feed.entry];

          return rawItems.slice(0, 15).map(item => ({
            title: extractText(item.title).replace(/<[^>]*>?/gm, '').trim(),
            link: getLink(item),
            description: extractText(item.description || item.summary || item.content).replace(/<[^>]*>?/gm, '').substring(0, 200),
            source: src.name,
            intelType: src.type,
            pubDate: extractText(item.pubDate || item.published || item.updated),
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

    // 🚀 2. GURU SÉMANTICKÁ DEDUPLIKACE (Křížová & Databázová)
    const combined = [...leaksRaw, ...hwRaw, ...gamesRaw];
    const uniqueItems = [];
    
    for (const item of combined) {
      if (!item.title) continue;
      const itemTokens = tokenize(item.title);
      if (itemTokens.size === 0) continue;
      
      let isDupe = false;
      
      // A) Ochrana proti vydaným článkům v DB (posts + content_plan)
      for (const dbTokens of dbTokensList) {
          if (isSemanticDuplicate(itemTokens, dbTokens)) {
              isDupe = true;
              debug.db_filtered++;
              break;
          }
      }
      if (isDupe) continue;

      // B) Ochrana proti křížové duplicitě (Leaks mají přednost, cokoliv dalšího se stejnými klíčovými slovy zahazujeme)
      for (const accepted of uniqueItems) {
          if (isSemanticDuplicate(itemTokens, accepted.tokens)) {
              isDupe = true;
              debug.cross_duplicates++;
              break;
          }
      }
      if (isDupe) continue;

      // Pokud projde, uložíme ho včetně jeho tokenů
      uniqueItems.push({ ...item, tokens: itemTokens });
    }

    // Odstranění tokenů před odesláním na frontend
    const finalItems = uniqueItems.map(i => {
        const { tokens, ...rest } = i;
        return rest;
    });

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
