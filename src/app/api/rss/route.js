import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  try {
    const siteUrl = 'https://www.thehardwareguru.cz';

    // 1. GURU FETCH: Stahujeme data ze všech 6 tabulek (přidány mikrorecenze).
    // Používáme 'created_at', který je v DB 100% přítomen a přidali jsme 'type' do posts pro správný routing.
    const [postsRes, tipyRes, tweakyRes, radyRes, slovnikRes, mikroRes] = await Promise.all([
      supabase.from('posts').select('title, slug, created_at, image_url, description, title_en, slug_en, description_en, type').order('created_at', { ascending: false }).limit(15),
      supabase.from('tipy').select('title, slug, created_at, image_url, description, title_en, slug_en, description_en').order('created_at', { ascending: false }).limit(10),
      supabase.from('tweaky').select('title, slug, created_at, image_url, description, title_en, slug_en, description_en').order('created_at', { ascending: false }).limit(10),
      supabase.from('rady').select('title, slug, created_at, image_url, description, title_en, slug_en, description_en').order('created_at', { ascending: false }).limit(10),
      supabase.from('slovnik').select('title, slug, created_at, image_url, description, title_en, slug_en, description_en').order('created_at', { ascending: false }).limit(15),
      supabase.from('mikrorecenze').select('title, slug, created_at, image_url, description, title_en, slug_en, description_en').order('created_at', { ascending: false }).limit(10)
    ]);

    const allItems = [];

    // 2A. GURU ROUTING PRO POSTS (Rozlišení Články vs Očekávané hry)
    (postsRes.data || []).forEach(item => {
      const isExpected = item.type === 'expected';
      const path = isExpected ? 'ocekavane-hry' : 'clanky';
      const czPrefix = isExpected ? '[Očekávané]' : '[Článek]';
      const enPrefix = isExpected ? '[Expected]' : '[Article]';

      // --- ČESKÁ POLOŽKA ---
      if (item.title && item.slug) {
        allItems.push({
          title: `${czPrefix} ${item.title}`,
          description: item.description || '',
          url: `${siteUrl}/${path}/${item.slug}`,
          date: item.created_at,
          image: item.image_url,
          lang: 'cs'
        });
      }

      // --- ANGLICKÁ POLOŽKA ---
      if (item.title_en) {
        const enSlug = item.slug_en || item.slug;
        allItems.push({
          title: `${enPrefix} ${item.title_en}`,
          description: item.description_en || item.description || '',
          url: `${siteUrl}/en/${path}/${enSlug}`,
          date: item.created_at,
          image: item.image_url,
          lang: 'en'
        });
      }
    });

    // 2B. Konfigurace ostatních sekcí s tvými Guru prefixy
    const sections = [
      { data: tipyRes.data, czPrefix: '[Tip]', enPrefix: '[Tip]', path: 'tipy' },
      { data: tweakyRes.data, czPrefix: '[Tweak]', enPrefix: '[Tweak]', path: 'tweaky' },
      { data: radyRes.data, czPrefix: '[Rada]', enPrefix: '[Guide]', path: 'rady' },
      { data: slovnikRes.data, czPrefix: '[Slovník]', enPrefix: '[Glossary]', path: 'slovnik' },
      { data: mikroRes.data, czPrefix: '[Recenze]', enPrefix: '[Review]', path: 'mikrorecenze' }
    ];

    // 2C. DUAL-LANG MAPPING ENGINE PRO ZBYTEK
    sections.forEach(({ data, czPrefix, enPrefix, path }) => {
      (data || []).forEach(item => {
        // --- ČESKÁ POLOŽKA ---
        if (item.title && item.slug) {
          allItems.push({
            title: `${czPrefix} ${item.title}`,
            description: item.description || '',
            url: `${siteUrl}/${path}/${item.slug}`,
            date: item.created_at,
            image: item.image_url,
            lang: 'cs'
          });
        }

        // --- ANGLICKÁ POLOŽKA (Pouze pokud existuje title_en) ---
        if (item.title_en) {
          const enSlug = item.slug_en || item.slug;
          allItems.push({
            title: `${enPrefix} ${item.title_en}`,
            description: item.description_en || item.description || '',
            url: `${siteUrl}/en/${path}/${enSlug}`,
            date: item.created_at,
            image: item.image_url,
            lang: 'en'
          });
        }
      });
    });

    // 3. Sjednocení a seřazení (Limit 50 pro stabilitu RSS čteček)
    const finalFeed = allItems
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 50);

    // 4. XML KONSTRUKCE
    let rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>The Hardware Guru | Tech, Gaming &amp; AI Global Feed</title>
    <link>${siteUrl}</link>
    <description>Hardware novinky, herní fixy, expertní rady a technický slovník v CZ i EN verzi.</description>
    <language>cs</language>
    <atom:link href="${siteUrl}/api/rss" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`;

    finalFeed.forEach((item) => {
      rss += `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${item.url}</link>
      <guid isPermaLink="true">${item.url}</guid>
      <pubDate>${new Date(item.date).toUTCString()}</pubDate>
      <description><![CDATA[${item.description}]]></description>
      <dc:language>${item.lang === 'cs' ? 'cs-cz' : 'en-us'}</dc:language>
      ${item.image ? `<media:content url="${item.image}" medium="image" />` : ''}
    </item>`;
    });

    rss += `
  </channel>
</rss>`;

    return new NextResponse(rss, {
      headers: { 
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate' 
      },
    });

  } catch (error) {
    console.error("GURU RSS CRITICAL ERROR:", error);
    return new NextResponse("Chyba při generování Guru feedu", { status: 500 });
  }
}
