/**
 * GURU SEO ENGINE - BING EXCLUSIVE INDEX V1.2
 * Cesta: src/app/bing-sitemap.xml/route.js
 * 🚀 CÍL: Resetovat "paměť" Bingu. Tento index ukazuje na novou větev /bing-sitemap/[id].xml.
 * 🛡️ FIX: Odkazy <loc> nyní správně směřují na /bing-sitemap/ namísto /guru-sitemap/.
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
    // Získání reálného počtu procesorů z hlavičky Content-Range
    const rangeHeader = res.headers.get('content-range');
    cpuCount = parseInt(rangeHeader?.split('/')[1] || "50", 10);
  } catch (e) {
    console.error("Index count fetch failed", e);
  }

  // 5 CPU na jeden chunk (musí odpovídat nastavení v [id]/route.js)
  const chunksNeeded = Math.ceil(cpuCount / 5);
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  
  // 1. ZÁKLADNÍ MAPY (Bing je uvidí jako nové URL díky prefixu /bing-sitemap/)
  const namedMaps = ['pages', 'posts', 'cpu', 'gpu', 'duels', 'upgrades'];
  namedMaps.forEach(m => {
    xml += `  <sitemap>\n    <loc>${baseUrl}/bing-sitemap/${m}.xml</loc>\n  </sitemap>\n`;
  });
  
  // 2. DYNAMICKÉ CHUNKY PRO MATICI (Vše pod novou adresou)
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
