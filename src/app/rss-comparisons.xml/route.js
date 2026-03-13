import { createClient } from '@supabase/supabase-js';

/**
 * GURU RSS ENGINE V23.4 - PROGRAMMATIC SEO FEED (DUELS & UPGRADES)
 * Cesta: src/app/rss-comparisons.xml/route.js
 * 🛡️ FIX: Změněno Content-Type na 'application/xml' proti automatickému stahování v prohlížeči.
 */

export const dynamic = 'force-dynamic';
export const revalidate = 3600; 

const baseUrl = 'https://thehardwareguru.cz';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

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
    const [gpuDuelsRes, cpuDuelsRes, gpuUpgRes, cpuUpgRes] = await Promise.all([
      supabase.from('gpu_duels').select('slug, title_cs, seo_description_cs, created_at').order('created_at', { ascending: false }).limit(25),
      supabase.from('cpu_duels').select('slug, title_cs, seo_description_cs, created_at').order('created_at', { ascending: false }).limit(25),
      supabase.from('gpu_upgrades').select('slug, title_cs, seo_description_cs, created_at').order('created_at', { ascending: false }).limit(25),
      supabase.from('cpu_upgrades').select('slug, title_cs, seo_description_cs, created_at').order('created_at', { ascending: false }).limit(25)
    ]);

    const items = [];

    gpuDuelsRes.data?.forEach(d => {
        items.push({
            title: d.title_cs || `Srovnání grafik: ${d.slug.replace(/-/g, ' ')}`,
            link: `${baseUrl}/gpuvs/${d.slug}`,
            desc: d.seo_description_cs || `Detailní srovnání výkonu a parametrů pro ${d.slug.replace(/-/g, ' ')}.`,
            date: d.created_at
        });
    });

    cpuDuelsRes.data?.forEach(d => {
        items.push({
            title: d.title_cs || `Srovnání procesorů: ${d.slug.replace(/-/g, ' ')}`,
            link: `${baseUrl}/cpuvs/${d.slug}`,
            desc: d.seo_description_cs || `Detailní srovnání výkonu a parametrů pro ${d.slug.replace(/-/g, ' ')}.`,
            date: d.created_at
        });
    });

    gpuUpgRes.data?.forEach(u => {
        items.push({
            title: u.title_cs || `Upgrade analýza: ${u.slug.replace(/-/g, ' ')}`,
            link: `${baseUrl}/gpu-upgrade/${u.slug}`,
            desc: u.seo_description_cs || `Analýza přechodu a nárůstu herního výkonu pro ${u.slug.replace(/-/g, ' ')}.`,
            date: u.created_at
        });
    });

    cpuUpgRes.data?.forEach(u => {
        items.push({
            title: u.title_cs || `Upgrade analýza: ${u.slug.replace(/-/g, ' ')}`,
            link: `${baseUrl}/cpu-upgrade/${u.slug}`,
            desc: u.seo_description_cs || `Analýza přechodu a nárůstu výkonu procesoru pro ${u.slug.replace(/-/g, ' ')}.`,
            date: u.created_at
        });
    });

    items.sort((a, b) => new Date(b.date) - new Date(a.date));
    const finalItems = items.slice(0, 100); 

    const now = new Date().toUTCString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<rss version="2.0"
      xmlns:atom="http://www.w3.org/2005/Atom"
      xmlns:media="http://search.yahoo.com/mrss/"
      xmlns:content="http://purl.org/rss/1.0/modules/content/"
      xmlns:dc="http://purl.org/dc/elements/1.1/">\n`;

    xml += `<channel>\n`;
    xml += `  <title><![CDATA[${safeCDATA('The Hardware Guru - Comparisons & Upgrades Feed')}]]></title>\n`;
    xml += `  <link>${baseUrl}/</link>\n`;
    xml += `  <description><![CDATA[${safeCDATA('Nejnovější GPU/CPU duely a hardwarové upgrady z Hardware Guru základny.')}]]></description>\n`;
    xml += `  <language>cs</language>\n`;
    xml += `  <generator>The Hardware Guru RSS Engine</generator>\n`;
    xml += `  <ttl>60</ttl>\n`; 
    xml += `  <lastBuildDate>${now}</lastBuildDate>\n`;
    
    xml += `  <atom:link href="${xmlEscape(`${baseUrl}/rss-comparisons.xml`)}" rel="self" type="application/rss+xml" />\n`;

    finalItems.forEach(item => {
      const link = item.link;
      const title = safeCDATA(item.title);
      const desc = safeCDATA(item.desc);
      const pubDate = new Date(item.date).toUTCString();

      xml += `  <item>\n`;
      xml += `    <title><![CDATA[${title}]]></title>\n`;
      xml += `    <link>${xmlEscape(link)}</link>\n`;
      xml += `    <guid isPermaLink="true">${xmlEscape(link)}</guid>\n`;
      xml += `    <pubDate>${pubDate}</pubDate>\n`;
      xml += `    <dc:creator><![CDATA[Guru Team]]></dc:creator>\n`;
      xml += `    <description><![CDATA[${desc}]]></description>\n`;
      xml += `    <content:encoded><![CDATA[${desc}]]></content:encoded>\n`;
      xml += `  </item>\n`;
    });

    xml += `</channel></rss>`;

    return new Response(xml, {
      headers: {
        // 🚀 GURU FIX: Změněno na application/xml (Google to čte, prohlížeč to zobrazí a nestáhne)
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600'
      }
    });

  } catch (error) {
    console.error('RSS COMPARISONS ENGINE ERROR:', error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Error</title><description>${xmlEscape(error.message)}</description></channel></rss>`,
      { status: 500, headers: { 'Content-Type': 'application/xml; charset=utf-8' } }
    );
  }
}
