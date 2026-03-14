/**
 * GURU SEO ENGINE - BING EXCLUSIVE INDEX V1.6 (PARITY SYNC)
 * Cesta: src/app/bing-sitemap.xml/route.js
 * 🚀 CÍL: Resetovat "paměť" Bingu a vynutit crawl kompletní 200k+ matice.
 * 🛡️ FIX 1: Výpočet chunků synchronizován s Chunkerem (limit 2 CPU per chunk).
 * 🛡️ FIX 2: Používá SUPABASE_SERVICE_ROLE_KEY pro neprůstřelné sčítání řádků.
 */

export const revalidate = 3600; 

export async function GET() {
  const baseUrl = 'https://thehardwareguru.cz';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // GURU: Service Role Key je nutný pro stabilní dotaz na count bez RLS limitů
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let cpuCount = 50; 
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
    cpuCount = parseInt(rangeHeader?.split('/')[1] || "50", 10);
  } catch (e) {
    console.error("Bing count fetch failed:", e);
  }

  // 🚀 SYNC: Chunker používá limit 2 CPU na soubor. Index musí odpovídat!
  const chunksNeeded = Math.max(25, Math.ceil(cpuCount / 2));
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  
  // 1. ZÁKLADNÍ SEKCE (Čerstvá identita pro Bing)
  const namedMaps = ['pages', 'posts', 'cpu', 'gpu', 'duels', 'upgrades'];
  namedMaps.forEach(m => {
    xml += `  <sitemap>\n    <loc>${baseUrl}/bing-sitemap/${m}.xml</loc>\n  </sitemap>\n`;
  });
  
  // 2. TISÍCE CHUNKŮ BOTTLENECK MATICE
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
