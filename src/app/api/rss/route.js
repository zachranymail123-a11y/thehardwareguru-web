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

    // 1. GURU FETCH: Stáhneme data ze VŠECH čtyř tabulek najednou
    const [tipyRes, postsRes, tweakyRes, slovnikRes] = await Promise.all([
      supabase.from('tipy').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('tweaky').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('slovnik').select('*').order('created_at', { ascending: false }).limit(15)
    ]);

    const allItems = [];

    // 2. FORMÁTOVÁNÍ KLASIKY (Tipy, Články, Tweaky)
    (tipyRes.data || []).forEach(item => {
      allItems.push({
        title: `[Tip] ${item.title}`,
        description: item.description,
        url: `${siteUrl}/tipy/${item.slug}`,
        date: item.created_at,
        image: item.image_url
      });
    });

    (postsRes.data || []).forEach(item => {
      allItems.push({
        title: `[Článek] ${item.title}`,
        description: item.description,
        url: `${siteUrl}/clanky/${item.slug}`,
        date: item.created_at,
        image: item.image_url
      });
    });

    (tweakyRes.data || []).forEach(item => {
      allItems.push({
        title: `[Tweak] ${item.title}`,
        description: item.desc || item.description,
        url: `${siteUrl}/tweaky/${item.slug}`,
        date: item.created_at,
        image: item.image_url
      });
    });

    // 3. GURU BILINGUAL LOGIKA (Slovník CZ + EN)
    (slovnikRes.data || []).forEach(item => {
      // Česká verze
      if (item.slug) {
        allItems.push({
          title: `[Slovník] ${item.title}`,
          description: item.description || item.seo_description,
          url: `${siteUrl}/slovnik/${item.slug}`,
          date: item.created_at,
          image: item.image_url
        });
      }
      // Anglická verze (vystřelíme ji jako samostatnou novinku pro globální zásah)
      if (item.slug_en) {
        allItems.push({
          title: `[Dictionary] ${item.title_en || item.title}`,
          description: item.description_en || item.seo_description_en || item.description,
          url: `${siteUrl}/en/slovnik/${item.slug_en}`,
          date: item.created_at,
          image: item.image_url
        });
      }
    });

    // 4. Sjednocení a seřazení od nejnovějšího
    const finalFeed = allItems
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 40);

    // 5. XML KONSTRUKCE
    let rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Hardware Guru | Global Tech Feed</title>
    <link>${siteUrl}</link>
    <description>Všechny novinky, hardware tipy, tweaky a bilingvální slovník na jednom místě.</description>
    <language>cs</language>
    <atom:link href="${siteUrl}/api/rss" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`;

    finalFeed.forEach((item) => {
      // Bezpečné ošetření speciálních znaků pomocí CDATA (lepšé pro HTML v popisu)
      rss += `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${item.url}</link>
      <guid isPermaLink="true">${item.url}</guid>
      <pubDate>${new Date(item.date).toUTCString()}</pubDate>
      <description><![CDATA[${item.description || ''}]]></description>
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
    console.error("GURU RSS ERROR:", error);
    return new NextResponse("Chyba při generování feedu", { status: 500 });
  }
}
