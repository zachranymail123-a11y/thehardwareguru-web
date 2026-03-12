import { createClient } from '@supabase/supabase-js';

/**
 * GURU SEO ENGINE - SITEMAP INDEX V21.1
 * Cesta: src/app/sitemap.xml/route.js
 * 🛡️ FIX 1: Přidán parametr <lastmod> k indexu přesně podle ChatGPT.
 * 🛡️ FIX 2: Zajištěna logická konzistence indexů (0 = statické stránky, 1..N = matrix).
 */

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  const baseUrl = 'https://thehardwareguru.cz';
  const now = new Date().toISOString(); 
  
  let chunks = 39; // Fallback
  
  try {
    const { count } = await supabase
      .from('cpus')
      .select('*', { count: 'exact', head: true });
      
    if (count) {
      chunks = Math.ceil(count / 2);
    }
  } catch (e) {
    console.error("GURU SITEMAP INDEX ERROR:", e);
  }
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  
  // 0. chunk - základní statické stránky, profily, články (zcela odděleno)
  xml += `  <sitemap>\n    <loc>${baseUrl}/sitemap/0.xml</loc>\n    <lastmod>${now}</lastmod>\n  </sitemap>\n`;
  
  // 1..N. chunk - dynamický bottleneck matrix (zde začínáme od jedničky)
  for (let i = 1; i <= chunks; i++) {
    xml += `  <sitemap>\n    <loc>${baseUrl}/sitemap/${i}.xml</loc>\n    <lastmod>${now}</lastmod>\n  </sitemap>\n`;
  }
  
  xml += `</sitemapindex>`;
  
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=600'
    }
  });
}
