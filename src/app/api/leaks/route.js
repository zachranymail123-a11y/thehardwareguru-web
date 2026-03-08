import { NextResponse } from 'next/server';
import { XMLParser } from "fast-xml-parser";

// 强制动态渲染，确保 Guru 获得秒级更新的数据
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GURU 后端引擎 - 泄露与传闻核能屏蔽 V8.4 (WHITELIST & MULTI-SOURCE)
 * 路径: src/app/api/leaks/route.js
 * 功能: 全球硬件泄露汇总系统，支持智能清洗和关键词优先。
 */

// 1. 全球数据源配置
const REDDIT_SOURCES = [
  "https://www.reddit.com/r/GamingLeaksAndRumours/new.json?limit=30",
  "https://www.reddit.com/r/hardware/new.json?limit=20"
];

const CHIPHELL_SOURCES = [
  "https://www.chiphell.com/forum.php?mod=rss&fid=183", // 传闻与爆料 (Rumors)
  "https://www.chiphell.com/forum.php?mod=rss&fid=52"   // 硬件资讯 (Hardware Info)
];

const GLOBAL_FEEDS = [
  "https://videocardz.com/feed",
  "https://wccftech.com/feed"
];

// 2. 模拟真实浏览器指纹
const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9,cs;q=0.8",
  "Cache-Control": "no-cache",
  "Referer": "https://www.google.com/"
};

// 3. 硬件关键词白名单 (优先通过)
const HARDWARE_KEYWORDS = [
  "NVIDIA", "AMD", "Intel", "RTX", "Ryzen", "Core", "GPU", "CPU", "Zen", 
  "RDNA", "Ada", "Blackwell", "Arrow Lake", "Snapdragon", "Apple M", "GeForce", "Radeon"
];

// 4. 垃圾信息黑名单 (严防 每日签到)
const SPAM_BLACKLIST = ['签到', '每日', '回复', '领取', 'Check-in', 'Daily', 'posted', '积分', '奖励', '任务', '申请'];

/**
 * 递归提取文本并清洗标题
 */
const getDeepText = (obj) => {
  if (!obj) return "";
  if (typeof obj === 'string') return obj;
  if (obj["#text"]) return String(obj["#text"]);
  if (obj["cdata"]) return String(obj["cdata"]);
  if (Array.isArray(obj)) return obj.map(getDeepText).join(" ");
  if (typeof obj === 'object') {
    return Object.values(obj).map(val => getDeepText(val)).join(" ");
  }
  return String(obj);
};

const cleanTitle = (t) => {
  return t
    .replace(/<!\[CDATA\[|\]\]>/g, "") // 清理 CDATA
    .replace(/\[.*?\]/g, "")           // 清理 [显卡] 等前缀
    .trim();
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

export async function GET() {
  const leaks = [];
  const debug = { reddit: 0, chiphell: 0, global: 0, sources_total: 0 };
  
  const parser = new XMLParser({ 
    ignoreAttributes: false, trimValues: true, attributeNamePrefix: "@_"
  });

  try {
    // --- A. REDDIT 引擎 ---
    for (const url of REDDIT_SOURCES) {
      try {
        const res = await fetchWithTimeout(url, { headers: BROWSER_HEADERS, cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
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
        }
      } catch (e) { console.error(`Reddit Error: ${url}`); }
    }

    // --- B. CHIPHELL 引擎 (智能白名单模式) ---
    for (const url of CHIPHELL_SOURCES) {
      try {
        const res = await fetchWithTimeout(url, { headers: BROWSER_HEADERS, cache: "no-store" });
        if (res.ok) {
          const xml = await res.text();
          const json = parser.parse(xml);
          const items = json?.rss?.channel?.item || [];
          const itemsArray = Array.isArray(items) ? items : [items];
          
          itemsArray.forEach(item => {
            if (!item) return;
            let t = cleanTitle(getDeepText(item.title));
            
            const isSpam = SPAM_BLACKLIST.some(term => t.includes(term));
            const isHardware = HARDWARE_KEYWORDS.some(k => t.toLowerCase().includes(k.toLowerCase()));
            
            // 只有非垃圾且包含硬件关键词，或长度足够的标题才会被允许
            if (!isSpam && (isHardware || t.length > 15) && t.length > 5) {
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
        }
      } catch (e) { console.error(`Chiphell Error: ${url}`); }
    }

    // --- C. 全球顶级硬件站引擎 (VideoCardz / Wccftech) ---
    for (const url of GLOBAL_FEEDS) {
      try {
        const res = await fetchWithTimeout(url, { headers: BROWSER_HEADERS, cache: "no-store" });
        if (res.ok) {
          const xml = await res.text();
          const json = parser.parse(xml);
          const items = json?.rss?.channel?.item || [];
          const itemsArray = Array.isArray(items) ? items : [items];
          
          itemsArray.forEach(item => {
            const t = cleanTitle(getDeepText(item.title));
            if (t) {
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
      } catch (e) { console.error(`Global Feed Error: ${url}`); }
    }

    // 全局去重：基于标题进行清理
    const uniqueLeaks = Array.from(new Map(leaks.map(item => [item.title.toLowerCase(), item])).values());
    uniqueLeaks.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    return NextResponse.json({
      success: true,
      count: uniqueLeaks.length,
      data: uniqueLeaks.slice(0, 80),
      _debug: debug
    });

  } catch (err) {
    return NextResponse.json({ success: false, count: 0, data: [], error: err.message });
  }
}
