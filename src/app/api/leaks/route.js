import { NextResponse } from 'next/server';
import { XMLParser } from "fast-xml-parser";

// 强制动态渲染，禁用 Vercel 缓存以获取最新数据
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GURU 后端引擎 - 泄露与传闻核能屏蔽 V8.3
 * 路径: src/app/api/leaks/route.js
 * 功能: 深度扫描 Reddit 和 Chiphell，自动过滤中文垃圾信息。
 */

// 数据源配置：优先使用 JSON 接口，RSS 作为备份
const REDDIT_SOURCES = [
  "https://www.reddit.com/r/GamingLeaksAndRumours/new.json?limit=35",
  "https://www.reddit.com/r/GamingLeaksAndRumours/.rss"
];

const CHIPHELL_RSS = "https://www.chiphell.com/forum.php?mod=rss&fid=224";

// 模拟真实浏览器指纹以绕过 Cloudflare 验证
const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9,cs;q=0.8",
  "Cache-Control": "no-cache",
  "Pragma": "no-cache",
  "Referer": "https://www.google.com/",
  "Upgrade-Insecure-Requests": "1"
};

// 垃圾信息黑名单：自动删除包含这些词的 Chiphell 帖子
const SPAM_BLACKLIST = [
  '签到', '每日', '回复', '领取', 'Check-in', 'Daily', 'posted', '版块', '积分', '奖励', '金币', '任务', '申请'
];

/**
 * 递归提取 XML 对象中的深层文本内容
 * 处理 CDATA 和嵌套的 #text 节点
 */
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

/**
 * 带有超时保护的 Fetch 函数
 * 防止服务器请求挂起
 */
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

/**
 * 获取并识别 Reddit 数据格式（JSON 或 RSS）
 */
async function fetchReddit() {
  for (const url of REDDIT_SOURCES) {
    try {
      const res = await fetchWithTimeout(url, { headers: BROWSER_HEADERS, cache: "no-store" });
      if (!res.ok) continue;

      const text = await res.text();
      if (text.length > 200) {
        const isJson = url.includes("json") && text.trim().startsWith('{');
        const isXml = text.includes('<?xml') || text.includes('<rss') || text.includes('<feed');
        
        if (isJson || isXml) {
          return { type: isJson ? "json" : "rss", data: text };
        }
      }
    } catch (e) {
      console.warn(`GURU 警告: Reddit 抓取失败 (${url})`);
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
    chiphell_final_count: 0,
    chiphell_first_raw: "" 
  };
  
  const parser = new XMLParser({ 
    ignoreAttributes: false, 
    trimValues: true,
    attributeNamePrefix: "@_",
    parseAttributeValue: true
  });

  try {
    // --- 1. REDDIT 抓取引擎 ---
    const redditResult = await fetchReddit();
    if (redditResult) {
      try {
        if (redditResult.type === "json") {
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
            }
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

    // --- 2. CHIPHELL 抓取引擎（深度过滤） ---
    try {
      const res = await fetchWithTimeout(CHIPHELL_RSS, { headers: BROWSER_HEADERS, cache: "no-store" });
      if (res.ok) {
        const xml = await res.text();
        const json = parser.parse(xml);
        const items = json?.rss?.channel?.item || [];
        const itemsArray = Array.isArray(items) ? items : [items];
        debug.chiphell_raw_count = itemsArray.length;

        if (itemsArray.length > 0) {
          debug.chiphell_first_raw = getDeepText(itemsArray[0].title).substring(0, 50);
        }

        itemsArray.forEach(item => {
          if (!item) return;
          
          let t = getDeepText(item.title);
          // 清理 CDATA 标签和前后空格
          t = t.toString().replace(/<!\[CDATA\[|\]\]>/g, "").trim();
          
          let l = getDeepText(item.link);
          
          // 运行垃圾信息过滤器
          const isSpam = SPAM_BLACKLIST.some(term => t.includes(term));
          
          // 只有非垃圾信息且标题长度超过 6 个字符的内容才会被录用
          if (!isSpam && t.length > 6 && !t.includes("[object Object]")) {
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

    // 按发布日期从新到旧排序
    leaks.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    // 返回格式化的 JSON 响应
    return NextResponse.json({
      success: true,
      count: leaks.length,
      data: leaks.slice(0, 50),
      _debug: debug
    });

  } catch (err) {
    // 关键错误处理，防止 API 崩溃
    return NextResponse.json({
      success: false, count: 0, data: [], error: err.message
    });
  }
}
