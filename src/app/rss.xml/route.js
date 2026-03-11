import { createClient } from '@supabase/supabase-js';

/**
 * GURU RSS ENGINE V20.9 - FINAL GSC COMPLIANCE
 * Cesta: src/app/rss.xml/route.js
 * 🛡️ FIX 1: Striktní sjednocení na doménu BEZ www.
 * 🛡️ FIX 2: Self-link v atom:link musí přesně odpovídat URL v GSC (rss.xml).
 * 🛡️ FIX 3: CDATA pro titulky a popisy pro eliminaci XML chyb při speciálních znacích.
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const baseUrl = 'https://thehardwareguru.cz';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET() {
  try {
    // Taháme 20 nejnovějších článků
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    const now = new Date().toUTCString();

    let xml = `<?xml version="1.0" encoding="UTF-8" ?>\n`;
    xml += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">\n`;
    xml += `  <channel>\n`;
    xml += `    <title><![CDATA[The Hardware Guru - Global Feed]]></title>\n`;
    xml += `    <link>${baseUrl}</link>\n`;
    xml += `    <description><![CDATA[Nejnovější HW tipy, herní slevy a benchmarky z Hardware Guru základny.]]></description>\n`;
    xml += `    <language>cs-cz</language>\n`;
    xml += `    <lastBuildDate>${now}</lastBuildDate>\n`;
    
    // 🚀 GURU CRITICAL FIX: Tento odkaz musí být přesně na /rss.xml
    xml += `    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />\n`;

    posts?.forEach(p => {
      const link = `${baseUrl}/clanky/${p.slug}`;
      xml += `    <item>\n`;
      xml += `      <title><![CDATA[${p.title}]]></title>\n`;
      xml += `      <link>${link}</link>\n`;
      xml += `      <guid isPermaLink="true">${link}</guid>\n`;
      xml += `      <pubDate>${new Date(p.created_at).toUTCString()}</pubDate>\n`;
      xml += `      <description><![CDATA[${p.description || p.seo_description || ''}]]></description>\n`;
      if (p.image_url) {
        xml += `      <media:content url="${p.image_url}" medium="image" />\n`;
      }
      xml += `    </item>\n`;
    });

    xml += `  </channel>\n</rss>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600'
      }
    });
  } catch (e) {
    console.error("RSS Generation Error:", e);
    return new Response('Error generating RSS', { status: 500 });
  }
}
