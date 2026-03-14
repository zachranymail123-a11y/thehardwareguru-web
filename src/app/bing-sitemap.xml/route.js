export const revalidate = 3600; 

export async function GET() {
  const baseUrl = 'https://thehardwareguru.cz';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let cpuCount = 50; 
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/cpus?select=count`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Prefer': 'count=exact' },
      cache: 'no-store'
    });
    cpuCount = parseInt(res.headers.get('content-range')?.split('/')[1] || "50", 10);
  } catch (e) {
    console.error("Index count fetch failed", e);
  }

  const chunksNeeded = Math.ceil(cpuCount / 5);
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  
  // Ukazujeme na naše existující dynamické chunky (Bing si je stáhne jako nové, protože k nim přišel z nového indexu)
  const namedMaps = ['pages', 'posts', 'cpu', 'gpu', 'duels', 'upgrades'];
  namedMaps.forEach(m => {
    xml += `  <sitemap>\n    <loc>${baseUrl}/guru-sitemap/${m}.xml</loc>\n  </sitemap>\n`;
  });
  
  for (let i = 1; i <= chunksNeeded; i++) {
    xml += `  <sitemap>\n    <loc>${baseUrl}/guru-sitemap/${i}.xml</loc>\n  </sitemap>\n`;
  }
  
  xml += `</sitemapindex>`;
  
  return new Response(xml, { 
    headers: { 
      'Content-Type': 'application/xml; charset=utf-8', 
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600' 
    } 
  });
}
