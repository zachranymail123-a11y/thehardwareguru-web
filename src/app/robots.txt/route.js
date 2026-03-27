/**
 * GURU ROBOTS ENGINE V5.0 (FINAL CRAWL SIGNAL OPTIMIZATION)
 * Cesta: src/app/robots.txt/route.js
 * 🚀 CÍL: Odstranění brzd (Crawl-delay) a plná propustnost pro Bing/Google crawlery.
 */

export const revalidate = 86400;

export async function GET() {
  const robots = `# GURU ROBOTS CONFIG - thehardwareguru.cz
User-agent: *
Allow: /

# Administrace a API
Disallow: /api/
Disallow: /admin/

# Hlavní indexy map webu
Sitemap: https://thehardwareguru.cz/guru-sitemap.xml
Sitemap: https://thehardwareguru.cz/latest.xml
Sitemap: https://thehardwareguru.cz/sitemap-hity.xml

# RSS Feedy (podpora rychlé indexace)
Sitemap: https://thehardwareguru.cz/rss.xml
Sitemap: https://thehardwareguru.cz/rss-comparisons.xml

# Ochrana před AI
User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: Google-Extended
Disallow: /
`;

  return new Response(robots, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600'
    },
  });
}
