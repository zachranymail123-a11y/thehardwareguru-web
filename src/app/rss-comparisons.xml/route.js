import { createClient } from '@supabase/supabase-js';

/**
 * GURU RSS ENGINE V24.0 - PROGRAMMATIC SEO FEED (DUELS, UPGRADES & GTA 6)
 * Cesta: src/app/rss-comparisons.xml/route.js
 * 🛡️ UPDATE: Přidáno automatické krmení RSS z uživatelských GTA 6 predikcí.
 */

export const dynamic = 'force-dynamic';
export const revalidate = 1800; // Zrychleno na 30 minut pro bleskovou indexaci hitů

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
    const [gpuDuelsRes, cpuDuelsRes, gpuUpgRes, cpuUpgRes, gtaHitsRes] = await Promise.all([
      supabase.from('gpu_duels').select('slug, title_cs, seo_description_cs, created_at').order('created_at', { ascending: false }).limit(20),
      supabase.from('cpu_duels').select('slug, title_cs, seo_description_cs, created_at').order('created_at', { ascending: false }).limit(20),
      supabase.from('gpu_upgrades').select('slug, title_cs, seo_description_cs, created_at').order('created_at', { ascending: false }).limit(20),
      supabase.from('cpu_upgrades').select('slug, title_cs, seo_description_cs, created_at').order('created_at', { ascending: false }).limit(20),
      supabase.from('generated_predictions').select('slug_base, full_url, last_requested').order('last_requested', { ascending: false }).limit(40)
    ]);

    const items = [];

    // 1. GPU DUELY
    gpuDuelsRes.data?.forEach(d => {
        items.push({
            title: d.title_cs || `Srovnání grafik: ${d.slug.replace(/-/g, ' ')}`,
            link: `${baseUrl}/gpuvs/${d.slug}`,
            desc: d.seo_description_cs || `Detailní srovnání výkonu a parametrů pro ${d.slug.replace(/-/g, ' ')}.`,
            date: d.created_at
        });
    });

    // 2. CPU DUELY
    cpuDuelsRes.data?.forEach(d => {
        items.push({
            title: d.title_cs || `Srovnání procesorů: ${d.slug.replace(/-/g, ' ')}`,
            link: `${baseUrl}/cpuvs/${d.slug}`,
            desc: d.seo_description_cs || `Detailní srovnání výkonu a parametrů pro ${d.slug.replace(/-/g, ' ')}.`,
            date: d.created_at
        });
    });

    // 3. GTA VI PREDIKCE (Hity od uživatelů)
    gtaHitsRes.data?.forEach(h => {
        items.push({
            title: `GTA VI VÝKON: ${h.slug_base.toUpperCase().replace(/-/g, ' ')}`,
            link: h.full_url,
            desc: `Nová predikce herního výkonu v GTA VI pro konfiguraci ${h.slug_base.replace(/-/g, ' ')}. Zjisti, kolik FPS vytáhne tvoje PC!`,
            date: h.last_requested
        });
    });

    // 4. UPGRADY
    gpuUpgRes.data?.forEach(u => {
        items.push({
            title: u.title_cs || `Upgrade analýza: ${u.slug.replace(/-/g, ' ')}`,
            link: `${baseUrl}/gpu-upgrade/${u.slug}`,
            desc: u.seo_description_cs || `Analýza přechodu a nárůstu herního výkonu pro ${u.slug.replace(/-/g, ' ')}.`,
            date: u.created_at
        });
    });

    items.sort((a, b) => new Date(b.date) - new Date(a.date));
    const finalItems = items.slice(0, 100); 

    const now = new Date().toUTCString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<rss version="2.0"
      xmlns:atom="http://www.w3.org/2005/Atom"
      xmlns:dc="http://purl.org/dc/elements/1.1/"
      xmlns:content="http://purl.org/rss/1.0/modules/content/">\n`;

    xml += `<channel>\n`;
    xml += `  <title><![CDATA[${safeCDATA('The Hardware Guru - Comparisons & Live Predictions')}]]></title>\n`;
    xml += `  <link>${baseUrl}/</link>\n`;
    xml += `  <description><![CDATA[${safeCDATA('Nejnovější GPU/CPU duely, upgrady a live predikce výkonu GTA VI.')}]]></description>\n`;
    xml += `  <language>cs</language>\n`;
    xml += `  <lastBuildDate>${now}</lastBuildDate>\n`;
    xml += `  <atom:link href="${xmlEscape(`${baseUrl}/rss-comparisons.xml`)}" rel="self" type="application/rss+xml" />\n`;

    finalItems.forEach(item => {
      xml += `  <item>\n`;
      xml += `    <title><![CDATA[${safeCDATA(item.title)}]]></title>\n`;
      xml += `    <link>${xmlEscape(item.link)}</link>\n`;
      xml += `    <guid isPermaLink="true">${xmlEscape(item.link)}</guid>\n`;
      xml += `    <pubDate>${new Date(item.date).toUTCString()}</pubDate>\n`;
      xml += `    <dc:creator><![CDATA[Guru Engine]]></dc:creator>\n`;
      xml += `    <description><![CDATA[${safeCDATA(item.desc)}]]></description>\n`;
      xml += `    <content:encoded><![CDATA[${safeCDATA(item.desc)}]]></content:encoded>\n`;
      xml += `  </item>\n`;
    });

    xml += `</channel></rss>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=600'
      }
    });

  } catch (error) {
    console.error('RSS COMPARISONS ENGINE ERROR:', error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Error</title></channel></rss>`,
      { status: 500, headers: { 'Content-Type': 'application/xml; charset=utf-8' } }
    );
  }
}
