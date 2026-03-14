/**
 * GURU SEO ENGINE - BING EXCLUSIVE INDEX V1.4 (SERVICE ROLE FIX)
 * Cesta: src/app/bing-sitemap.xml/route.js
 * 🚀 CÍL: Resetovat "paměť" Bingu a vynutit hluboký crawl všech 119k+ stránek.
 * 🛡️ FIX 1: Odkazy <loc> nyní správně směřují na /bing-sitemap/ namísto /guru-sitemap/.
 * 🛡️ FIX 2: Používá SUPABASE_SERVICE_ROLE_KEY pro zjištění countu (obchází RLS omezení).
 * 🛡️ FIX 3: Math.max(10, ...) zajišťuje, že index nikdy nebude prázdný i při výpadku DB.
 */

export const revalidate = 3600; 

export async function GET() {
  const baseUrl = 'https://thehardwareguru.cz';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // 🚀 GURU FIX: Používáme Service Role Key, aby Bing viděl reálný počet stránek v matici!
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
    // Získání reálného počtu procesorů z hlavičky Content-Range
    cpuCount = parseInt(rangeHeader?.split('/')[1] || "50", 10);
  } catch (e) {
    console.error("Bing sitemap count fetch failed:", e);
  }

  // Bing preferuje menší sitemapy. 5 CPU na chunk vytvoří cca 5-6 tisíc URL na soubor.
  const chunksNeeded = Math.max(10, Math.ceil(cpuCount / 5));
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  
  // 1. ZÁKLADNÍ STRUKTURÁLNÍ MAPY (Prefixované /bing-sitemap/ pro reset Bingu)
  const namedMaps = ['pages', 'posts', 'cpu', 'gpu', 'duels', 'upgrades'];
  namedMaps.forEach(m => {
    xml += `  <sitemap>\n    <loc>${baseUrl}/bing-sitemap/${m}.xml</loc>\n  </sitemap>\n`;
  });
  
  // 2. DYNAMICKÁ MATICE (Všechny kombinace Bottlenecků)
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
