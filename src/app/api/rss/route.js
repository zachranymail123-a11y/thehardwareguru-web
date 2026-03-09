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
 * GURU RSS FEED ENGINE V5.1 (XML VALIDATION FIX)
 * Cesta: src/app/api/rss/route.js
 * 🛡️ FIX: Escapování ampersandů v URL adresách pro validní XML.
 */
export async function GET() {
  try {
    const siteUrl = 'https://www.thehardwareguru.cz';

    // 1. GURU FETCH: Paralelné načítanie všetkých tabuliek
    const [postsRes, tipyRes, tweakyRes, radyRes, slovnikRes, mikroRes, dealsRes, duelsRes] = await Promise.all([
      supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('tipy').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('tweaky').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('rady').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('slovnik').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('mikrorecenze').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('game_deals').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('gpu_duels').select('*').order('created_at', { ascending: false }).limit(10)
    ]);

    const allItems = [];

    // Helper pro escapování ampersandů v URL, které XML nesnese
    const escapeXmlUrl = (url) => url ? url.replace(/&/g, '&amp;') : '';

    // --- 🛡️ GURU MAPPING LOGIC ---

    // A) ČLÁNKY & OČAKÁVANÉ HRY
    (postsRes.data || []).forEach(item => {
      const isExpected = item.type === 'expected';
      const path = isExpected ? 'ocekavane-hry' : 'clanky';
      
      if (item.title) {
        allItems.push({
          title: `${isExpected ? '[Očekávané]' : '[Článek]'} ${item.title}`,
          description: item.description || item.seo_description || '',
          url: `${siteUrl}/cs/${path}/${item.slug}`,
          date: item.created_at,
          image: item.image_url,
          lang: 'cs'
        });
      }
      if (item.title_en) {
        allItems.push({
          title: `${isExpected ? '[Expected]' : '[Article]'} ${item.title_en}`,
          description: item.description_en || item.seo_description_en || '',
          url: `${siteUrl}/en/${path}/${item.slug_en || item.slug}`,
          date: item.created_at,
          image: item.image_url,
          lang: 'en'
        });
      }
    });

    // B) SLEVY (GAME DEALS)
    (dealsRes.data || []).forEach(item => {
      if (item.title) {
        allItems.push({
          title: `[Sleva] ${item.title} (${item.price_cs})`,
          description: item.description_cs || '',
          url: item.affiliate_link || `${siteUrl}/cs/deals`,
          date: item.created_at,
          image: item.image_url,
          lang: 'cs'
        });
        allItems.push({
          title: `[Deal] ${item.title} (${item.price_en})`,
          description: item.description_en || item.description_cs || '',
          url: item.affiliate_link || `${siteUrl}/en/deals`,
          date: item.created_at,
          image: item.image_url,
          lang: 'en'
        });
      }
    });

    // C) GPU DUELY (VERSUS ENGINE)
    (duelsRes.data || []).forEach(item => {
      if (item.title_cs) {
        allItems.push({
          title: `[Duel] ${item.title_cs}`,
          description: item.seo_description_cs || '',
          url: `${siteUrl}/cs/gpuvs/${item.slug}`,
          date: item.created_at,
          lang: 'cs'
        });
      }
      if (item.title_en) {
        allItems.push({
          title: `[VS Battle] ${item.title_en}`,
          description: item.seo_description_en || '',
          url: `${siteUrl}/en/gpuvs/${item.slug_en || 'en-' + item.slug}`,
          date: item.created_at,
          lang: 'en'
        });
      }
    });

    // D) OSTATNÉ (Tipy, Tweaky, Rady, Slovník)
    const sections = [
      { data: tipyRes.data, czPrefix: '[Tip]', path: 'tipy' },
      { data: tweakyRes.data, czPrefix: '[Tweak]', path: 'tweaky' },
      { data: radyRes.data, czPrefix: '[Rada]', path: 'rady' },
      { data: slovnikRes.data, czPrefix: '[Slovník]', path: 'slovnik' }
    ];

    sections.forEach(({ data, czPrefix, path }) => {
      (data || []).forEach(item => {
        if (item.title) {
          allItems.push({
            title: `${czPrefix} ${item.title}`,
            description: item.description || '',
            url: `${siteUrl}/cs/${path}/${item.slug}`,
            date: item.created_at,
            image: item.image_url,
            lang: 'cs'
          });
        }
        if (item.title_en) {
          allItems.push({
            title: `[EN] ${item.title_en}`,
            description: item.description_en || '',
            url: `${siteUrl}/en/${path}/${item.slug_en || item.slug}`,
            date: item.created_at,
            image: item.image_url,
            lang: 'en'
          });
        }
      });
    });

    // Zoraďovanie od najnovšieho po najstaršie
    const sortedItems = allItems.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 50);

    // Generovanie XML
    let rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Hardware Guru - Global Feed</title>
    <link>${siteUrl}</link>
    <description>Najnovšie HW tipy, herné slevy a GPU duely z Hardware Guru základne.</description>
    <language>cs</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/api/rss" rel="self" type="application/rss+xml" />`;

    sortedItems.forEach((item) => {
      // 🚀 GURU FIX: Escapujeme URL a Image URL, aby '&' nezhodilo XML validáciu
      const safeUrl = escapeXmlUrl(item.url);
      const safeImg = escapeXmlUrl(item.image);

      rss += `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${safeUrl}</link>
      <guid>${safeUrl}</guid>
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
