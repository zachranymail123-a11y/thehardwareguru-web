/**
 * GURU SEO ENGINE - BING EXCLUSIVE INDEX V1.3
 * Cesta: src/app/bing-sitemap.xml/route.js
 * 🚀 CÍL: Resetovat "paměť" Bingu a vynutit hluboký crawl všech 119k+ stránek.
 * 🛡️ FIX 1: Dynamický výpočet chunků pro Bottleneck matici (všechny kombinace).
 * 🛡️ FIX 2: Přidány explicitní mapy pro 'duels' a 'upgrades', které v indexu chyběly.
 */

export const revalidate = 3600; 

export async function GET() {
  const baseUrl = 'https://thehardwareguru.cz';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
    console.error("Sitemap index count fetch failed", e);
  }

  // Bing preferuje menší sitemapy. 5 CPU na chunk vytvoří cca 5-6 tisíc URL na soubor.
  const chunksNeeded = Math.ceil(cpuCount / 5);
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  
  // 1. ZÁKLADNÍ STRUKTURÁLNÍ MAPY
  // Obsahují Pages, Posts (Články), CPU profily, GPU profily, Duely a Upgrady.
  const namedMaps = ['pages', 'posts', 'cpu', 'gpu', 'duels', 'upgrades'];
  namedMaps.forEach(m => {
    xml += `  <sitemap>\n    <loc>${baseUrl}/bing-sitemap/${m}.xml</loc>\n  </sitemap>\n`;
  });
  
  // 2. DYNAMICKÁ MATICE (Bottleneck Combinations)
  // Generujeme chunky 1 až N, aby Bing mohl procházet celou matici HW kombinací.
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
