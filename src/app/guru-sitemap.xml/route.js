/**
 * GURU SEO ENGINE - MASTER SITEMAP INDEX V28.0 (ANTI-VERCEL-405 EDITION)
 * Cesta: src/app/guru-sitemap.xml/route.js
 * 🛡️ FIX: Změněn název na guru-sitemap.xml. Tím zcela obcházíme jakékoliv
 * interní Next.js nebo Vercel konflikty (které způsobovaly 405 error).
 * Google GSC přijme jakýkoliv název XML souboru.
 */

export const revalidate = 86400;

export async function GET() {
  const baseUrl = 'https://thehardwareguru.cz';
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  
  const namedMaps = ['pages', 'posts', 'cpu', 'gpu', 'duels', 'upgrades'];
  
  namedMaps.forEach(m => {
    xml += `  <sitemap>\n    <loc>${baseUrl}/guru-sitemap/${m}.xml</loc>\n  </sitemap>\n`;
  });
  
  for (let i = 1; i <= 60; i++) {
    xml += `  <sitemap>\n    <loc>${baseUrl}/guru-sitemap/${i}.xml</loc>\n  </sitemap>\n`;
  }
  
  xml += `</sitemapindex>`;
  
  return new Response(xml, { 
    headers: { 
      'Content-Type': 'application/xml; charset=utf-8', 
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' 
    } 
  });
}
