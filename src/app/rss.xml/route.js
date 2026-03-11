import { createClient } from '@supabase/supabase-js';

/**
 * GURU RSS ENGINE V21.1 - FINAL GSC COMPLIANCE
 * Cesta: src/app/rss.xml/route.js
 * 🛡️ FIX 1: Absolutní escapování URL adres (zejména znaků & v SAS tokenech), 
 * což řeší chybu "Dokument není dobře zformátován".
 * 🛡️ FIX 2: Content-Type nastaven na 'application/rss+xml'.
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const baseUrl = 'https://thehardwareguru.cz';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Helper pro bezpečné escapování URL a textu do XML
const xmlEscape = (str) => {
  if (!str) return '';
  return str.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

export async function GET() {
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    const now = new Date().toUTCString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">\n`;
    xml += `  <channel>\n`;
    xml += `    <title><![CDATA[The Hardware Guru]]></title>\n`;
    xml += `    <link>${baseUrl}</link>\n`;
    xml += `    <description><![CDATA[Hardware novinky, benchmarky a herní tipy.]]></description>\n`;
    xml += `    <language>cs-cz</language>\n`;
    xml += `    <lastBuildDate>${now}</lastBuildDate>\n`;
    xml += `    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />\n`;

    posts?.forEach(p => {
      const link = `${baseUrl}/clanky/${p.slug}`;
      // 🚀 GURU FIX: URL obrázku musí být escapovaná, jinak SAS tokeny s '&' rozbijí XML
      const safeImageUrl = xmlEscape(p.image_url);
      
      xml += `    <item>\n`;
      xml += `      <title><![CDATA[${p.title}]]></title>\n`;
      xml += `      <link>${link}</link>\n`;
      xml += `      <guid isPermaLink="true">${link}</guid>\n`;
      xml += `      <pubDate>${new Date(p.created_at).toUTCString()}</pubDate>\n`;
      xml += `      <description><![CDATA[${p.description || p.seo_description || ''}]]></description>\n`;
      if (p.image_url) {
        xml += `      <media:content url="${safeImageUrl}" medium="image" />\n`;
      }
      xml += `    </item>\n`;
    });

    xml += `  </channel>\n</rss>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600'
      }
    });
  } catch (e) {
    console.error("RSS ERROR:", e);
    return new Response('Error generating RSS', { status: 500 });
  }
}
