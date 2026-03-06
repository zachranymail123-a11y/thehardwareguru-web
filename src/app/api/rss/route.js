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

    // 1. GURU FETCH: Stáhneme data ze VŠECH pěti tabulek
    const [postsRes, tipyRes, tweakyRes, radyRes, slovnikRes] = await Promise.all([
      supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('tipy').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('tweaky').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('rady').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('slovnik').select('*').order('created_at', { ascending: false }).limit(15)
    ]);

    const allItems = [];

    // Konfigurace pro mapování sekcí
    const sections = [
      { data: postsRes.data, czPrefix: '[Článek]', enPrefix: '[Article]', path: 'clanky' },
      { data: tipyRes.data, czPrefix: '[Tip]', enPrefix: '[Tip]', path: 'tipy' },
      { data: tweakyRes.data, czPrefix: '[Tweak]', enPrefix: '[Tweak]', path: 'tweaky' },
      { data: radyRes.data, czPrefix: '[Rada]', enPrefix: '[Guide]', path: 'rady' },
      { data: slovnikRes.data, czPrefix: '[Slovník]', enPrefix: '[Dictionary]', path: 'slovnik' }
    ];

    // 2. GURU DUAL-LANG MAPPING ENGINE
    sections.forEach(({ data, czPrefix, enPrefix, path }) => {
      (data || []).forEach(item => {
        // --- ČESKÁ POLOŽKA (Vždy) ---
        allItems.push({
          title: `${czPrefix} ${item.title}`,
          description: item.seo_description || item.description || '',
          url: `${siteUrl}/${path}/${item.slug}`,
          date: item.created_at,
          image: item.image_url,
          lang: 'cs'
        });

        // --- ANGLICKÁ POLOŽKA (Pouze pokud existuje překlad) ---
        if (item.title_en) {
          const enSlug = item.slug_en || item.slug;
          allItems.push({
            title: `${enPrefix} ${item.title_en}`,
            description: item.description_en || item.seo_description_en || '',
            url: `${siteUrl}/en/${path}/${enSlug}`,
            date: item.created_at,
            image: item.image_url,
            lang: 'en'
          });
        }
      });
    });

    // 3. Sjednocení a seřazení od nejnovějšího (Limit 50 pro Google/RSS čtečky)
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
