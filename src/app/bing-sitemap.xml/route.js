/**
 * GURU SEO ENGINE - BING EXCLUSIVE INDEX V1.5 (CHUNKER SYNC FIX)
 * Cesta: src/app/bing-sitemap.xml/route.js
 * 🚀 CÍL: Resetovat "paměť" Bingu a vynutit crawl kompletní 119k+ matice.
 * 🛡️ FIX 1: Výpočet chunků změněn na (cpuCount / 2), aby odpovídal limitu v chunkeru.
 * 🛡️ FIX 2: Používá SUPABASE_SERVICE_ROLE_KEY pro obcházení RLS při sčítání řádků.
 * 🛡️ FIX 3: Math.max(20, ...) zajišťuje dostatečný rozsah i při dočasném výpadku DB countu.
 */

export const revalidate = 3600; 

export async function GET() {
  const baseUrl = 'https://thehardwareguru.cz';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // 🚀 GURU FIX: Service Role Key pro neomezený přístup k metadatům sitemap
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let cpuCount = 45; // Bezpečný fallback
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/cpus?select=count`, {
      headers: { 
        'apikey': supabaseKey, 
        'Authorization': `Bearer ${supabaseKey}`, 
        'Prefer': 'count=exact' 
      },
      cache: 'no-store'
    });
    const rangeHeader = res.headers.get('content-range');
    // Získání reálného počtu procesorů z hlavičky Content-Range
    cpuCount = parseInt(rangeHeader?.split('/')[1] || "45", 10);
  } catch (e) {
    console.error("Bing sitemap count fetch failed:", e);
  }

  // 🚀 GURU SYNC FIX: Chunker používá limit 2 CPU na soubor.
  // Výpočet musí být identický, aby Bing viděl všechny pod-mapy.
  const chunksNeeded = Math.max(20, Math.ceil(cpuCount / 2));
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  
  // 1. ZÁKLADNÍ STRUKTURÁLNÍ MAPY (Bing-only větev pro reset indexace)
  const namedMaps = ['pages', 'posts', 'cpu', 'gpu', 'duels', 'upgrades'];
  namedMaps.forEach(m => {
    xml += `  <sitemap>\n    <loc>${baseUrl}/bing-sitemap/${m}.xml</loc>\n  </sitemap>\n`;
  });
  
  // 2. DYNAMICKÁ MATICE (Všechny kombinace Bottlenecků po 2 CPU na chunk)
  for (let i = 1; i <= chunksNeeded; i++) {
    xml += `  <sitemap>\n    <loc>${baseUrl}/bing-sitemap/${i}.xml</loc>\n  </sitemap>\n`;
  }
  
  xml += `</sitemapindex>`;
  
  return new Response(xml, { 
    headers: { 
      'Content-Type': 'application/xml; charset=utf-8', 
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600' 
    } 
  });
}
