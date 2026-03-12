import { createClient } from '@supabase/supabase-js';

/**
 * GURU RSS ENGINE V23.3 - MAIN SEO FEED (ARTICLES, NEWS)
 * Cesta: src/app/rss.xml/route.js
 * 🚀 CÍL: Hlavní feed pro redakční obsah (články, novinky).
 * 🛡️ FIX 1: revalidate = 3600 (Cache na 1 hodinu).
 * 🛡️ FIX 2: Přidán tag <generator>The Hardware Guru RSS Engine</generator>.
 * 🛡️ FIX 3: Content-Type je striktně 'application/rss+xml; charset=utf-8' (GSC standard).
 */

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 🚀 GURU FIX: 1h Cache

const baseUrl = 'https://thehardwareguru.cz';

// Používáme POUZE veřejný klíč
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Dekódování HTML entit před escapováním (prevence &amp;amp;)
const decodeHtml = (str) => {
  if (!str) return '';
  return str.toString().replace(/&amp;/g, '&');
};

const xmlEscape = (str = '') => {
  if (!str) return '';
  return str.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

const safeCDATA = (str = '') =>
  str.toString().replace(/]]>/g, ']]]]><![CDATA[>');

export async function GET() {
  try {
    // 🚀 Taháme POUZE redakční obsah (Články a novinky)
    const { data: postsRes, error } = await supabase
      .from('posts')
      .select('id, slug, title, description, seo_description, image_url, created_at')
      .order('created_at', { ascending: false })
      .limit(60);

    if (error) throw error;

    const items = [];

    postsRes?.forEach(p => {
        items.push({
            title: p.title || '',
            link: `${baseUrl}/clanky/${p.slug}`,
            desc: p.description || p.seo_description || '',
            image: p.image_url,
            date: p.created_at
        });
    });

    const now = new Date().toUTCString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<rss version="2.0"
      xmlns:atom="http://www.w3.org/2005/Atom"
      xmlns:media="http://search.yahoo.com/mrss/"
      xmlns:content="http://purl.org/rss/1.0/modules/content/"
      xmlns:dc="http://purl.org/dc/elements/1.1/">\n`;

    xml += `<channel>\n`;
    xml += `  <title><![CDATA[${safeCDATA('The Hardware Guru - Articles & News')}]]></title>\n`;
    xml += `  <link>${baseUrl}/</link>\n`;
    xml += `  <description><![CDATA[${safeCDATA('Nejnovější HW tipy a herní novinky z Hardware Guru základny.')}]]></description>\n`;
    xml += `  <language>cs</language>\n`;
    xml += `  <generator>The Hardware Guru RSS Engine</generator>\n`; // 🚀 GURU FIX
    xml += `  <ttl>60</ttl>\n`; 
    xml += `  <lastBuildDate>${now}</lastBuildDate>\n`;
    
    xml += `  <atom:link href="${xmlEscape(`${baseUrl}/rss.xml`)}" rel="self" type="application/rss+xml" />\n`;

    items.forEach(item => {
      const link = item.link;
      const title = safeCDATA(item.title);
      const desc = safeCDATA(item.desc);
      const image = item.image ? xmlEscape(decodeHtml(item.image)) : null;
      const pubDate = new Date(item.date).toUTCString();

      xml += `  <item>\n`;
      xml += `    <title><![CDATA[${title}]]></title>\n`;
      xml += `    <link>${xmlEscape(link)}</link>\n`;
      xml += `    <guid isPermaLink="true">${xmlEscape(link)}</guid>\n`;
      xml += `    <pubDate>${pubDate}</pubDate>\n`;
      xml += `    <dc:creator><![CDATA[Guru Team]]></dc:creator>\n`;
      xml += `    <description><![CDATA[${desc}]]></description>\n`;
      xml += `    <content:encoded><![CDATA[${desc}]]></content:encoded>\n`;

      if (image) {
        xml += `    <media:content url="${image}" medium="image" />\n`;
        xml += `    <enclosure url="${image}" length="0" type="image/jpeg" />\n`;
      }
      xml += `  </item>\n`;
    });

    xml += `</channel></rss>`;

    return new Response(xml, {
      headers: {
        // 🚀 GURU FIX: Zpět striktně na application/rss+xml; charset=utf-8
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600'
      }
    });

  } catch (error) {
    console.error('RSS ENGINE ERROR:', error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Error</title><description>${xmlEscape(error.message)}</description></channel></rss>`,
      { status: 500, headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } }
    );
  }
}
