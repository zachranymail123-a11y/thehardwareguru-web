import { createClient } from '@supabase/supabase-js';

/**
 * GURU SEO ENGINE - MASTER SITEMAP INDEX V39.0 (ENTERPRISE EDITION)
 * Cesta: src/app/guru-sitemap.xml/route.js
 * 🛡️ FIX 1: Opraven výpočet countu přes nativní Supabase API (zamezuje NaN a null chybám).
 * 🛡️ FIX 2: Přidán tag <lastmod> s aktuálním datem pro agresivnější crawl prioritu.
 * 🛡️ FIX 3: Přidána latest.xml sitemap přímo do hlavního indexu.
 */

export const revalidate = 3600; 

export async function GET() {
  const baseUrl = 'https://thehardwareguru.cz';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Inicializace klienta pro bezpečný exact count
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
  });

  let cpuCount = 50; // Bezpečný fallback
  try {
    // 🚀 GURU FIX: Zlatý standard pro počítání řádků v Supabase
    const { count, error } = await supabase
      .from('cpus')
      .select('*', { count: 'exact', head: true });
      
    if (!error && count) {
      cpuCount = count;
    }
  } catch (e) {
    console.error("Index count fetch failed", e);
  }

  // Musí se shodovat s limitem v chunkeru (5 CPU per chunk)
  const chunksNeeded = Math.max(1, Math.ceil(cpuCount / 5));
  
  // Získání dnešního data ve formátu YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  
  // 1. ZÁKLADNÍ SITEMAPY
  const namedMaps = ['pages', 'posts', 'cpu', 'gpu', 'duels', 'upgrades'];
  namedMaps.forEach(m => {
    xml += `  <sitemap>\n    <loc>${baseUrl}/guru-sitemap/${m}.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n`;
  });
  
  // 2. PROGRAMMATICKÉ CHUNKY (Matice Bottlenecku)
  for (let i = 1; i <= chunksNeeded; i++) {
    xml += `  <sitemap>\n    <loc>${baseUrl}/guru-sitemap/${i}.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n`;
  }

  // 3. FRESH SITEMAP (Latest.xml)
  xml += `  <sitemap>\n    <loc>${baseUrl}/latest.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n`;
  
  xml += `</sitemapindex>`;
  
  return new Response(xml, { 
    headers: { 
      'Content-Type': 'application/xml; charset=utf-8', 
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600' 
    } 
  });
}
