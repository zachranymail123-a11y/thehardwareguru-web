/**
 * GURU SEO ENGINE - MASTER SITEMAP INDEX V36.0 (SMART DYNAMIC INDEX)
 * Cesta: src/app/guru-sitemap.xml/route.js
 * 🚀 FIX: Index už nevypisuje fixních 60 slotů, ale dynamicky vypočítá přesný počet 
 * podle aktuálního počtu CPU v databázi. Tím zmizí chyby GSC u prázdných souborů.
 */

export const revalidate = 3600; 

export async function GET() {
  const baseUrl = 'https://thehardwareguru.cz';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let cpuCount = 50; // Fallback
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/cpus?select=count`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Prefer': 'count=exact' },
      cache: 'no-store'
    });
    cpuCount = parseInt(res.headers.get('content-range')?.split('/')[1] || "50", 10);
  } catch (e) {
    console.error("Index count fetch failed", e);
  }

  // Musí se shodovat s limitem v chunkeru (nyní 5 CPU per chunk)
  const chunksNeeded = Math.ceil(cpuCount / 5);
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  
  const namedMaps = ['pages', 'posts', 'cpu', 'gpu', 'duels', 'upgrades'];
  namedMaps.forEach(m => {
    xml += `  <sitemap>\n    <loc>${baseUrl}/guru-sitemap/${m}.xml</loc>\n  </sitemap>\n`;
  });
  
  // Vypíšeme jen ty chunky, které mají reálná data
  for (let i = 1; i <= chunksNeeded; i++) {
    xml += `  <sitemap>\n    <loc>${baseUrl}/guru-sitemap/${i}.xml</loc>\n  </sitemap>\n`;
  }
  
  xml += `</sitemapindex>`;
  
  return new Response(xml, { 
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, s-maxage=3600' } 
  });
}
