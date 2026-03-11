import { createClient } from '@supabase/supabase-js';

/**
 * GURU RSS ENGINE V22.0 - PRODUCTION READY
 * Cesta: src/app/rss.xml/route.js
 * 🛡️ AUTHORITATIVE FIX (ChatGPT V22):
 * 1. validní RSS 2.0 + jmenné prostory (media, content, dc, atom)
 * 2. safeCDATA sanitizace (řeší pád na znaku ]]> v textu)
 * 3. xmlEscape pro všechny URL (řeší & v SAS tokenech OpenAI)
 * 4. optimalizovaný SELECT (šetříme RAM a CPU serveru)
 * 5. kompatibilita Google News, Bing, Discover, Feedly
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const baseUrl = 'https://thehardwareguru.cz';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * XML escape - ošetřuje speciální znaky v atributech (např. v URL)
 */
const xmlEscape = (str = '') =>
  str.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });

/**
 * CDATA safe - ošetřuje vnořené uzavírací značky CDATA, které by rozbily parser
 */
const safeCDATA = (str = '') =>
  str.replace(/]]>/g, ']]]]><![CDATA[>');

export async function GET() {
  try {
    // 🚀 Optimalizovaný fetch: netaháme zbytečné bloby, jen co potřebujeme pro feed
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        id,
        slug,
        title,
        description,
        seo_description,
        image_url,
        created_at,
        author
      `)
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
    xml += `  <title><![CDATA[${safeCDATA('The Hardware Guru')}]]></title>\n`;
    xml += `  <link>${baseUrl}/</link>\n`;
    xml += `  <description><![CDATA[${safeCDATA('Hardware novinky, benchmarky a herní tipy z Guru základny.')}]]></description>\n`;
    xml += `  <language>cs</language>\n`;
    xml += `  <lastBuildDate>${now}</lastBuildDate>\n`;
    xml += `  <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />\n`;

    posts?.forEach(p => {
      const link = `${baseUrl}/clanky/${p.slug}`;
      const title = safeCDATA(p.title || '');
      const desc = safeCDATA(p.description || p.seo_description || '');
      const image = p.image_url ? xmlEscape(p.image_url) : null;
      const pubDate = new Date(p.created_at).toUTCString();

      xml += `  <item>\n`;
      xml += `    <title><![CDATA[${title}]]></title>\n`;
      xml += `    <link>${xmlEscape(link)}</link>\n`;
      xml += `    <guid isPermaLink="true">${xmlEscape(link)}</guid>\n`;
      xml += `    <pubDate>${pubDate}</pubDate>\n`;
      xml += `    <dc:creator><![CDATA[${safeCDATA(p.author || 'Guru Team')}]]></dc:creator>\n`;
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
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=43200, stale-while-revalidate=3600'
      }
    });

  } catch (error) {
    console.error('RSS ENGINE ERROR:', error);
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><rss><channel><title>Error</title></channel></rss>',
      { 
        status: 500,
        headers: { 'Content-Type': 'application/xml; charset=utf-8' }
      }
    );
  }
}
