import { NextResponse } from 'next/server';
import { XMLParser } from "fast-xml-parser";

// 强制动态渲染，确保 Guru 获得秒级更新的数据
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GURU 后端引擎 - 泄露与传闻核能屏蔽 V8.6 (ULTIMATE PROXY ROTATION)
 * 路径: src/app/api/leaks/route.js
 * 功能: 修复 Chiphell 抓取失败问题，通过增强型代理轮询绕过 Cloudflare 封锁。
 */

// 1. 全球数据源配置
const REDDIT_URL = "https://www.reddit.com/r/GamingLeaksAndRumours/new.json?limit=40";
const REDDIT_RSS = "https://www.reddit.com/r/GamingLeaksAndRumours/.rss";

const CHIPHELL_SOURCES = [
  "https://www.chiphell.com/forum.php?mod=rss&fid=183", // 传闻与爆料 (Rumors)
  "https://www.chiphell.com/forum.php?mod=rss&fid=52"   // 硬件资讯 (Hardware Info)
];

const GLOBAL_FEEDS = [
  "https://videocardz.com/feed",
  "https://wccftech.com/feed"
];

// 2. 模拟真实浏览器指纹 (Supreme Spoofing)
const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9,cs;q=0.8,zh-CN;q=0.7,zh;q=0.6", // 增加中文支持以绕过检测
  "Cache-Control": "no-cache",
  "Referer": "https://www.google.com/",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Upgrade-Insecure-Requests": "1"
};

// 3. 硬件关键词白名单 (优先通过)
const HARDWARE_KEYWORDS = [
  "NVIDIA", "AMD", "Intel", "RTX", "Ryzen", "Core", "GPU", "CPU", "Zen", 
  "RDNA", "Ada", "Blackwell", "Arrow Lake", "Snapdragon", "Apple M", "GeForce", "Radeon", "PlayStation", "Xbox", "Switch"
];

// 4. 垃圾信息黑名单
const SPAM_BLACKLIST = ['签到', '每日', '回复', '领取', 'Check-in', 'Daily', 'posted', '积分', '奖励', '任务', '申请'];

/**
 * 递归提取文本
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
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/\[.*?\]/g, "")
    .trim();
};

/**
 * GURU SUPREME FETCH - 增强型代理轮询逻辑
 * 支持多种代理接口以应对 Chiphell 的严苛封锁
 */
async function supremeProxyFetch(url, isJson = false) {
  const proxies = [
    { name: 'Direct', fn: (u) => u },
    { name: 'AllOrigins-Raw', fn: (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}&t=${Date.now()}` },
    { name: 'Codetabs', fn: (u) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}` },
    { name: 'CorsProxy', fn: (u) => `https://corsproxy.io/?${encodeURIComponent(u)}` },
    { name: 'AllOrigins-Get', fn: (u) => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}&t=${Date.now()}` }
  ];

  for (const proxy of proxies) {
    try {
      const target = proxy.fn(url);
      const res = await fetch(target, { headers: BROWSER_HEADERS, cache: "no-store", next: { revalidate: 0 } });
      
      if (res.ok) {
        let text = await res.text();
        
        // 如果是 AllOrigins-Get 包装器，需要解析内部内容
        if (proxy.name === 'AllOrigins-Get') {
          try {
            const wrapper = JSON.parse(text);
            if (wrapper.contents) text = wrapper.contents;
          } catch (e) { continue; }
        }

        if (text && text.length > 200) {
          if (isJson && (text.trim().startsWith('{') || text.trim().startsWith('['))) return { type: 'json', data: text };
          if (!isJson && (text.includes('<?xml') || text.includes('<rss') || text.includes('<feed'))) return { type: 'xml', data: text };
        }
      }
    } catch (e) {
      console.warn(`GURU Proxy ${proxy.name} failed for ${url}`);
    }
  }
  return null;
}

export async function GET() {
  const leaks = [];
  const debug = { reddit: 0, chiphell: 0, global: 0, sources_failed: [] };
  
  const parser = new XMLParser({ 
    ignoreAttributes: false, trimValues: true, attributeNamePrefix: "@_", parseAttributeValue: true
  });

  try {
    // --- A. REDDIT 引擎 (JSON First, RSS Fallback) ---
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
    } else {
       const redditRss = await supremeProxyFetch(REDDIT_RSS, false);
       if (redditRss) {
         const json = parser.parse(redditRss.data);
         const entries = json?.feed?.entry || [];
         const arr = Array.isArray(entries) ? entries : [entries];
         arr.forEach(entry => {
           const title = getDeepText(entry.title);
           if (title && title !== "GamingLeaksAndRumours") {
             leaks.push({
               title, link: entry.link?.["@_href"] || "", description: title,
               source: "Reddit Leaks", intelType: "leaks", pubDate: entry.updated || new Date().toISOString()
             });
             debug.reddit++;
           }
         });
       } else { debug.sources_failed.push("reddit_total_block"); }
    }

    // --- B. CHIPHELL 引擎 (智能代理白名单模式) ---
    for (const url of CHIPHELL_SOURCES) {
      const chipResult = await supremeProxyFetch(url, false);
      if (chipResult) {
        try {
          const json = parser.parse(chipResult.data);
          const items = json?.rss?.channel?.item || [];
          const itemsArray = Array.isArray(items) ? items : [items];
          
          itemsArray.forEach(item => {
            if (!item) return;
            let t = cleanTitle(getDeepText(item.title));
            const isSpam = SPAM_BLACKLIST.some(term => t.includes(term));
            const isHardware = HARDWARE_KEYWORDS.some(k => t.toLowerCase().includes(k.toLowerCase()));
            
            if (!isSpam && (isHardware || t.length > 20) && t.length > 5) {
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

    // --- C. 全球顶级硬件站引擎 (VideoCardz / Wccftech) ---
    for (const url of GLOBAL_FEEDS) {
      try {
        const res = await fetch(url, { headers: BROWSER_HEADERS, cache: "no-store" });
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

    // 全局去重并按日期排序
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
