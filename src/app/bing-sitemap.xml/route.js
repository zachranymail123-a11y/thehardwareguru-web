import { NextResponse } from 'next/server';

export const revalidate = 86400; // Cache na 24 hodin

export async function GET() {
  // Bing nesnáší tisíce sitemap, ale miluje velké soubory (až 50 000 URL na sitemapu).
  // Uděláme fixně 10 chunků, což nám krásně a bezpečně pokryje všechny tvé tabulky.
  const CHUNKS = 10;
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (let i = 1; i <= CHUNKS; i++) {
    xml += `  <sitemap>\n    <loc>https://thehardwareguru.cz/bing-sitemap/${i}.xml</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n  </sitemap>\n`;
  }

  xml += `</sitemapindex>`;
  
  return new NextResponse(xml, { 
    headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate' } 
  });
}
