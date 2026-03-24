import { createClient } from '@supabase/supabase-js';

/**
 * GURU SEO ENGINE - BING OPTIMIZED SITEMAP INDEX V1.2
 * Cesta: src/app/bing-sitemap.xml/route.js
 */

export const revalidate = 86400; 

export async function GET() {
  const baseUrl = 'https://thehardwareguru.cz';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
  });

  let cpuCount = 50; 
  try {
    const { count, error } = await supabase
      .from('cpus')
      .select('*', { count: 'exact', head: true });
      
    if (!error && count) {
      cpuCount = count;
    }
  } catch (e) {
    console.error("Bing index count fetch failed", e);
  }

  // 🚀 FIX: Chunk size 50 (bezpečné pro Vercel)
  const chunksNeeded = Math.max(1, Math.ceil(cpuCount / 50));
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  
  const namedMaps = ['pages', 'posts', 'cpu', 'gpu', 'duels', 'upgrades'];
  namedMaps.forEach(m => {
    xml += `  <sitemap>\n    <loc>${baseUrl}/bing-sitemap/${m}.xml</loc>\n  </sitemap>\n`;
  });

  for (let i = 1; i <= chunksNeeded; i++) {
    xml += `  <sitemap>\n    <loc>${baseUrl}/bing-sitemap/${i}.xml</loc>\n  </sitemap>\n`;
  }
  
  xml += `  <sitemap>\n    <loc>${baseUrl}/latest.xml</loc>\n  </sitemap>\n`;
  
  xml += `</sitemapindex>`;
  
  return new Response(xml, { 
    headers: { 
      'Content-Type': 'application/xml; charset=utf-8', 
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' 
    } 
  });
}
