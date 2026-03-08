import { NextResponse } from 'next/server';
import { XMLParser } from "fast-xml-parser";

export const dynamic = 'force-dynamic';

/**
 * GURU BACKEND ENGINE - LEAKS & RUMORS BYPASS
 * Bezpečně stahuje data ze zdrojů, které blokují klientské proxy (Reddit, Chiphell).
 */
export async function GET() {
  const leaks = [];
  const parser = new XMLParser({ ignoreAttributes: false });

  // ------------------------------------------------
  // 1. REDDIT FETCH (Nativní JSON endpoint bypass)
  // ------------------------------------------------
  try {
    const redditRes = await fetch("https://www.reddit.com/r/GamingLeaksAndRumours/new.json?limit=20", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) NextJSLeaksBot/1.0",
        "Accept": "application/json",
      },
      next: { revalidate: 300 }, // Cache na 5 minut
    });

    if (redditRes.ok) {
      const redditData = await redditRes.json();
      const redditPosts = (redditData?.data?.children || []).map((p) => ({
        title: p.data.title,
        link: `https://reddit.com${p.data.permalink}`,
        description: p.data.selftext || p.data.title,
        source: "Reddit Leaks",
        intelType: "leaks",
      }));
      leaks.push(...redditPosts);
    }
  } catch (err) {
    console.warn("Guru Backend: Reddit fetch failed:", err);
  }

  // ------------------------------------------------
  // 2. VIDEOCARDZ FETCH (Záložní spolehlivý HW Leak zdroj)
  // ------------------------------------------------
  try {
    const vcRes = await fetch("https://videocardz.com/feed", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36"
      },
      next: { revalidate: 600 }, // Cache na 10 minut
    });

    if (vcRes.ok) {
      const vcXml = await vcRes.text();
      const vcJson = parser.parse(vcXml);
      const vcItems = vcJson?.rss?.channel?.item || [];
      // Pojistka, pokud parser vrátí objekt místo pole u 1 položky
      const vcArray = Array.isArray(vcItems) ? vcItems : [vcItems]; 
      
      const vcPosts = vcArray.filter(i => i && i.title).map((item) => ({
        title: item.title,
        link: item.link,
        description: item.description || item.title,
        source: "VideoCardz",
        intelType: "leaks",
      }));
      leaks.push(...vcPosts);
    }
  } catch (err) {
    console.warn("Guru Backend: VideoCardz fetch failed:", err);
  }

  // ------------------------------------------------
  // 3. CHIPHELL FETCH (Anti-Cloudflare hlavičky)
  // ------------------------------------------------
  try {
    const chipRes = await fetch("https://www.chiphell.com/forum.php?mod=rss&fid=224", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Accept": "application/rss+xml,application/xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      next: { revalidate: 600 },
    });

    if (chipRes.ok) {
      const chipXml = await chipRes.text();
      const chipJson = parser.parse(chipXml);
      const chipItems = chipJson?.rss?.channel?.item || [];
      const chipArray = Array.isArray(chipItems) ? chipItems : [chipItems];

      const chipPosts = chipArray.filter(i => i && i.title).map((item) => ({
        title: item.title,
        link: item.link,
        description: item.description || item.title,
        source: "Chiphell",
        intelType: "leaks",
      }));
      leaks.push(...chipPosts);
    }
  } catch (err) {
    console.warn("Guru Backend: Chiphell fetch failed:", err);
    // Pokud Chiphell trvale nasadí extrémní CF bot-fight mód,
    // bylo by zde nutné využít API proxy službu, např. api.allorigins.win
  }

  // ------------------------------------------------
  // VÝSLEDNÉ SJEDNOCENÍ DAT
  // ------------------------------------------------
  return NextResponse.json({
    success: true,
    count: leaks.length,
    data: leaks,
  });
}
