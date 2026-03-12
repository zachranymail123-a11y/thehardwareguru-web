import { createClient } from '@supabase/supabase-js';

/**
 * GURU RSS ENGINE V22.6 - CHATGPT AUTHORITATIVE FIX
 * Cesta: src/app/rss.xml/route.js
 * 🛡️ FIX 1: Odstraněn SERVICE_ROLE_KEY pro maximální bezpečnost.
 * 🛡️ FIX 2: Content-Type změněn striktně na application/rss+xml.
 * 🛡️ FIX 3: Cache-Control upravena pro lepší práci s crawlery.
 * 🛡️ FIX 4: Přidána funkce decodeHtml proti dvojitému escapování ampersandu.
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const baseUrl = 'https://thehardwareguru.cz';

// 🚀 CHATGPT FIX: Používáme POUZE veřejný klíč, abychom zamezili riziku úniku v edge runtime
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 🚀 CHATGPT FIX: Dekódování HTML entit před escapováním (prevence &amp;amp;)
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
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`id, slug, title, description, seo_description, image_url, created_at`)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) throw error;

    const now = new Date().toUTCString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<rss version="2.0"
      xmlns:atom="http://www.w3.org/2005/Atom"
      xmlns:media="http://search.yahoo.com/mrss/"
      xmlns:content="http://purl.org/rss/1.0/modules/content/"
      xmlns:dc="http://purl.org/dc/elements/1.1/">\n`;

    xml += `<channel>\n`;
    xml += `  <title><![CDATA[${safeCDATA('The Hardware Guru - Global Feed')}]]></title>\n`;
    xml += `  <link>${baseUrl}/</link>\n`;
    xml += `  <description><![CDATA[${safeCDATA('Nejnovější HW tipy, herní slevy a GPU/CPU duely z Hardware Guru základny.')}]]></description>\n`;
    xml += `  <language>cs</language>\n`;
    xml += `  <lastBuildDate>${now}</lastBuildDate>\n`;
    
    xml += `  <atom:link href="${xmlEscape(`${baseUrl}/rss.xml`)}" rel="self" type="application/rss+xml" />\n`;

    posts?.forEach(p => {
      const link = `${baseUrl}/clanky/${p.slug}`;
      const title = safeCDATA(p.title || '');
      const desc = safeCDATA(p.description || p.seo_description || '');
      
      // 🚀 CHATGPT FIX: Aplikujeme decodeHtml a teprve poté xmlEscape
      const image = p.image_url ? xmlEscape(decodeHtml(p.image_url)) : null;
      const pubDate = new Date(p.created_at).toUTCString();

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
        // 🚀 CHATGPT FIX: application/rss+xml je pro Google lepší standard
        'Content-Type': 'application/rss+xml; charset=utf-8',
        // 🚀 CHATGPT FIX: Lepší Cache-Control pro crawlery
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    });

  } catch (error) {
    console.error('RSS ENGINE ERROR:', error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Error</title><description>${xmlEscape(error.message)}</description></channel></rss>`,
      { status: 200, headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } }
    );
  }
}
