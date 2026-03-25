import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 86400; // Cache na 24 hodin

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function GET() {
  try {
    // Vezmeme počet CPU jako referenci pro rozpad do chunků
    const { count, error } = await supabase
      .from('cpus')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    // 🚀 CHATGPT FIX 1: Změna chunk size z 5 na 500
    const CHUNK_SIZE = 500;
    const totalItems = count || 0;
    const chunksNeeded = Math.max(1, Math.ceil(totalItems / CHUNK_SIZE));

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (let i = 1; i <= chunksNeeded; i++) {
      xml += `  <sitemap>\n`;
      xml += `    <loc>https://thehardwareguru.cz/bing-sitemap/${i}.xml</loc>\n`;
      xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
      xml += `  </sitemap>\n`;
    }

    xml += `</sitemapindex>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate'
      }
    });
  } catch (err) {
    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></sitemapindex>`, {
      headers: { 'Content-Type': 'application/xml' }
    });
  }
}
