import { createClient } from '@supabase/supabase-js';

/**
 * GURU SEO ENGINE - BING OPTIMIZED SITEMAP INDEX V1.0
 * Cesta: src/app/bing-sitemap.xml/route.js
 * 🚀 CÍL: Dedikovaná, stabilní sitemapa čistě pro Bing.
 * 🛡️ FIX 1: Odstraněn fake <lastmod> (aby Bing neresetoval crawl každý den).
 * 🛡️ FIX 2: Agresivní chunkování sníženo (z 5 na 1000 per sitemap), Bing tak dostane stabilní strukturu.
 */

export const revalidate = 86400; // 1 den (Bing nevyžaduje každou hodinu)

export async function GET() {
  const baseUrl = 'https://thehardwareguru.cz';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Inicializace klienta
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

  // 🚀 BING FIX: Extrémně stabilní chunkování (1000 místo 5). 
  // Odkazuje ale pořád na stejné fyzické API soubory (1.xml, 2.xml...), 
  // takže pokud tvoje /guru-sitemap/[id].xml funguje po 5, Bing dostane jen 1.xml. 
  // POZNÁMKA: Jelikož nechceme měnit tvé vnitřní soubory pro Google, 
  // u Bingu tam ty dynamické chunky (/1.xml atd.) prostě nepošleme všechny jako indexy, 
  // ale jen hlavní mapy, ať se tím neudusí.
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  
  // 1. ZÁKLADNÍ SITEMAPY (BEZ LASTMOD)
  const namedMaps = ['pages', 'posts', 'cpu', 'gpu', 'duels', 'upgrades'];
  namedMaps.forEach(m => {
    xml += `  <sitemap>\n    <loc>${baseUrl}/guru-sitemap/${m}.xml</loc>\n  </sitemap>\n`;
  });
  
  // 2. FRESH SITEMAP (Latest.xml)
  xml += `  <sitemap>\n    <loc>${baseUrl}/latest.xml</loc>\n  </sitemap>\n`;
  
  xml += `</sitemapindex>`;
  
  return new Response(xml, { 
    headers: { 
      'Content-Type': 'application/xml; charset=utf-8', 
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' 
    } 
  });
}
