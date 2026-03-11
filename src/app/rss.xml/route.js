import { createClient } from '@supabase/supabase-js';

/**
 * GURU RSS ENGINE V20.6 - PRODUCTION READY
 * 🚀 FIX: Zajištěno správné kódování a hlavičky pro GSC.
 */

const baseUrl = 'https://thehardwareguru.cz';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const dynamic = 'force-dynamic';

const escapeXml = (str) => str ? str.replace(/[<>&'"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'}[c])) : '';

export async function GET() {
  try {
    const { data: posts } = await supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(20);
    const now = new Date().toUTCString();

    let xml = `<?xml version="1.0" encoding="UTF-8" ?>\n`;
    xml += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">\n`;
    xml += `  <channel>\n`;
    xml += `    <title>The Hardware Guru - Global Feed</title>\n`;
    xml += `    <link>${baseUrl}</link>\n`;
    xml += `    <description>Nejnovější HW tipy a recenze.</description>\n`;
    xml += `    <language>cs-cz</language>\n`;
    xml += `    <lastBuildDate>${now}</lastBuildDate>\n`;
    xml += `    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />\n`;

    posts?.forEach(p => {
      const link = `${baseUrl}/clanky/${p.slug}`;
      xml += `    <item>\n`;
      xml += `      <title>${escapeXml(p.title)}</title>\n`;
      xml += `      <link>${link}</link>\n`;
      xml += `      <guid isPermaLink="true">${link}</guid>\n`;
      xml += `      <pubDate>${new Date(p.created_at).toUTCString()}</pubDate>\n`;
      xml += `      <description>${escapeXml(p.description || p.seo_description)}</description>\n`;
      if (p.image_url) {
        xml += `      <media:content url="${escapeXml(p.image_url)}" medium="image" />\n`;
      }
      xml += `    </item>\n`;
    });

    xml += `  </channel>\n</rss>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600'
      }
    });
  } catch (e) {
    return new Response('Error generating RSS', { status: 500 });
  }
}
