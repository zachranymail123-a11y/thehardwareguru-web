import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GURU FIX: Vynútená dynamika, aby sa RSS nikdy necachovalo a Make.com videl novinky hneď
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Používame service_role pre neobmedzený prístup v API
);

/**
 * GURU RSS FEED ENGINE V5.6 (DYNAMIC GAMES FIX)
 * Cesta: src/app/api/rss/route.js
 * 🚀 NEW: Automatické načítání her z tabulky 'games' pro dynamické FPS stránky.
 */
export async function GET() {
  try {
    const siteUrl = 'https://www.thehardwareguru.cz';

    // 1. GURU FETCH: Agregace všech tabulek pro maximální SEO pokrytí
    const [postsRes, tipyRes, tweakyRes, radyRes, slovnikRes, dealsRes, duelsRes, cpuDuelsRes, upgradesRes, gpusRes, gamesRes] = await Promise.all([
      supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('tipy').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('tweaky').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('rady').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('slovnik').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('game_deals').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('gpu_duels').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('cpu_duels').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('gpu_upgrades').select('*').order('created_at', { ascending: false }).limit(15),
      supabase.from('gpus').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('games').select('slug') // 🚀 GURU DYNAMIC GAMES: Fetchujeme hry z DB
    ]);

    const allItems = [];

    // Helper pro escapování ampersandů v URL
    const escapeXmlUrl = (url) => url ? url.replace(/&/g, '&amp;') : '';

    // --- 🛡️ GURU MAPPING LOGIC (Bez /cs/ prefixu) ---

    // A) ČLÁNKY & OČEKÁVANÉ HRY
    (postsRes.data || []).forEach(item => {
      const isExpected = item.type === 'expected';
      const path = isExpected ? 'ocekavane-hry' : 'clanky';
      if (item.title) {
        allItems.push({
          title: `${isExpected ? '[Očekávané]' : '[Článek]'} ${item.title}`,
          description: item.description || item.seo_description || '',
          url: `${siteUrl}/${path}/${item.slug}`,
          date: item.created_at,
          image: item.image_url,
          lang: 'cs'
        });
      }
    });

    // B) SLEVY (GAME DEALS)
    (dealsRes.data || []).forEach(item => {
      if (item.title) {
        allItems.push({
          title: `[Sleva] ${item.title} (${item.price_cs})`,
          description: item.description_cs || '',
          url: item.affiliate_link || `${siteUrl}/deals`,
          date: item.created_at,
          image: item.image_url,
          lang: 'cs'
        });
      }
    });

    // C) GPU & CPU DUELY
    const duels = [...(duelsRes.data || []), ...(cpuDuelsRes.data || [])];
    duels.forEach(item => {
      const basePath = item.slug.includes('cpu') ? 'cpuvs' : 'gpuvs';
      if (item.title_cs) {
        allItems.push({
          title: `[Duel] ${item.title_cs}`,
          description: item.seo_description_cs || '',
          url: `${siteUrl}/${basePath}/${item.slug}`,
          date: item.created_at,
          lang: 'cs'
        });
      }
    });

    // D) GPU UPGRADY
    (upgradesRes.data || []).forEach(item => {
      if (item.title_cs) {
        allItems.push({
          title: `[Upgrade] ${item.title_cs}`,
          description: item.seo_description_cs || '',
          url: `${siteUrl}/gpu-upgrade/${item.slug}`,
          date: item.created_at,
          lang: 'cs'
        });
      }
    });

    // E) GPU LANDING PAGES (FPS, Performance, Recommend) 🚀
    // Zde vytáhneme slugy her přímo z databáze a nahradíme tím hardcodovaný seznam
    const dbGames = gamesRes.data?.map(g => g.slug).filter(Boolean) || [];
    const gamesList = dbGames.length > 0 ? dbGames : ['cyberpunk-2077', 'warzone', 'starfield'];

    (gpusRes.data || []).forEach(gpu => {
      if (!gpu.slug) return;
      
      // FPS Benchmarky
      gamesList.forEach(game => {
        allItems.push({
          title: `[FPS] ${gpu.name} - ${game.replace(/-/g, ' ').toUpperCase()}`,
          description: `Testy FPS a herní výkon pro ${gpu.name} v titulu ${game}.`,
          url: `${siteUrl}/gpu-fps/${gpu.slug}/${game}`,
          date: gpu.created_at || new Date().toISOString(),
          lang: 'cs'
        });
      });

      // Performance
      allItems.push({
        title: `[Výkon] ${gpu.name} - Benchmarky a specifikace`,
        description: `Kompletní technický rozbor a herní testy grafické karty ${gpu.name}.`,
        url: `${siteUrl}/gpu-performance/${gpu.slug}`,
        date: gpu.created_at || new Date().toISOString(),
        lang: 'cs'
      });

      // Recommend
      allItems.push({
        title: `[Rada] Vyplatí se koupit ${gpu.name}?`,
        description: `Analýza cena/výkon a doporučení Guru týmu pro kartu ${gpu.name}.`,
        url: `${siteUrl}/gpu-recommend/${gpu.slug}`,
        date: gpu.created_at || new Date().toISOString(),
        lang: 'cs'
      });
    });

    // F) OSTATNÍ SEKCE
    const sections = [
      { data: tipyRes.data, prefix: '[Tip]', path: 'tipy' },
      { data: tweakyRes.data, prefix: '[Tweak]', path: 'tweaky' },
      { data: radyRes.data, prefix: '[Rada]', path: 'rady' },
      { data: slovnikRes.data, prefix: '[Slovník]', path: 'slovnik' }
    ];
    sections.forEach(({ data, prefix, path }) => {
      (data || []).forEach(item => {
        if (item.title) {
          allItems.push({
            title: `${prefix} ${item.title}`,
            description: item.description || '',
            url: `${siteUrl}/${path}/${item.slug}`,
            date: item.created_at,
            image: item.image_url,
            lang: 'cs'
          });
        }
      });
    });

    // Seřazení a limit (max 100 položek pro Google News stabilitu)
    const sortedItems = allItems.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 100);

    // Generování XML
    let rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Hardware Guru - Global Feed</title>
    <link>${siteUrl}</link>
    <description>Nejnovější HW tipy, herní slevy a GPU/CPU duely z Hardware Guru základny.</description>
    <language>cs-CZ</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/api/rss" rel="self" type="application/rss+xml" />`;

    sortedItems.forEach((item) => {
      const safeUrl = escapeXmlUrl(item.url);
      const safeImg = escapeXmlUrl(item.image);

      rss += `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${safeUrl}</link>
      <guid isPermaLink="true">${safeUrl}</guid>
      <pubDate>${new Date(item.date).toUTCString()}</pubDate>
      <description><![CDATA[${item.description}]]></description>
      ${safeImg ? `<media:content url="${safeImg}" medium="image" />` : ''}
    </item>`;
    });

    rss += `
  </channel>
</rss>`;

    return new NextResponse(rss, {
      headers: { 
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      },
    });

  } catch (error) {
    console.error("GURU RSS CRITICAL ERROR:", error);
    return new NextResponse("GURU RSS ENGINE ERROR", { status: 500 });
  }
}
