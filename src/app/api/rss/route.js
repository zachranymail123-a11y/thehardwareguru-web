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

    // 1. Stáhneme data ze TŘÍ tabulek najednou (Tipy, Články a nově i Tweaky)
    const [tipyResponse, postsResponse, tweakyResponse] = await Promise.all([
      supabase.from('tipy').select('*').order('created_at', { ascending: false }).limit(15),
      supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(15),
      supabase.from('tweaky').select('*').order('created_at', { ascending: false }).limit(15) // TADY JE PŘIDANÁ TVOJE NOVÁ SEKCE
    ]);

    // 2. Sjednotíme formát, protože každá sekce má jinou URL na webu
    const formattedTipy = (tipyResponse.data || []).map(item => ({
      title: item.title,
      description: item.description,
      url: `${siteUrl}/tipy/${item.slug}`,
      date: item.created_at,
      image: item.image_url
    }));

    const formattedPosts = (postsResponse.data || []).map(item => ({
      title: item.title,
      description: item.description,
      url: `${siteUrl}/clanky/${item.slug}`, 
      date: item.created_at,
      image: item.image_url
    }));

    // 2.5 Naformátujeme novou sekci Tweaky
    const formattedTweaky = (tweakyResponse.data || []).map(item => ({
      title: item.title,
      description: item.desc || item.description, // Pojistka, kdybys sloupec nazval zkráceně
      url: `${siteUrl}/tweaky/${item.slug}`,
      date: item.created_at,
      image: item.image_url
    }));

    // 3. Spojíme to VŠECHNO dohromady a seřadíme od nejnovějšího po nejstarší
    const allContent = [...formattedTipy, ...formattedPosts, ...formattedTweaky]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 30); // Ořízneme to na 30 nejnovějších věcí celkově

    // 4. Začátek XML
    let rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Hardware Guru | Všechny Novinky, Tipy a Tweaky</title>
    <link>${siteUrl}</link>
    <description>Nejnovější hardware novinky, články, návody, optimalizace her a tipy od Guru.</description>
    <language>cs</language>
    <atom:link href="${siteUrl}/api/rss" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`;

    // 5. Vložení všech položek
    allContent.forEach((item) => {
      // Ošetření speciálních znaků pro XML
      const cleanTitle = (item.title || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const cleanDesc = (item.description || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      rss += `
    <item>
      <title>${cleanTitle}</title>
      <link>${item.url}</link>
      <guid isPermaLink="true">${item.url}</guid>
      <pubDate>${new Date(item.date).toUTCString()}</pubDate>
      <description>${cleanDesc}</description>
      ${item.image ? `<media:content url="${item.image}" medium="image" />` : ''}
    </item>`;
    });

    rss += `
  </channel>
</rss>`;

    return new NextResponse(rss, {
      headers: { 'Content-Type': 'application/xml' },
    });

  } catch (error) {
    console.error("Chyba při generování sjednoceného RSS:", error);
    return new NextResponse("Chyba při generování feedu", { status: 500 });
  }
}
