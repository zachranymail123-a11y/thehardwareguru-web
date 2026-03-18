/**
 * GURU ROBOTS ENGINE V4.3 (ADSENSE APPROVAL MODE)
 * Cesta: src/app/robots.txt/route.js
 * 🛡️ STRATEGIE: Skrýt automatický balast před manuální kontrolou AdSense.
 * 🛡️ AKCE: Dočasně zakomentovány dynamické sitemapy pro hladké schválení.
 */

export const revalidate = 86400;

export async function GET() {
  const robots = `# GURU ROBOTS CONFIG - thehardwareguru.cz
User-agent: *
Allow: /
Crawl-delay: 1

# Administrace a API
Disallow: /api/
Disallow: /admin/

# Mapy webu (Hlavní mapy pro schválení)
Sitemap: https://thehardwareguru.cz/guru-sitemap.xml
Sitemap: https://thehardwareguru.cz/latest.xml

# Dynamické mapy (AKTIVOVAT AŽ PO SCHVÁLENÍ ADSENSE)
# Sitemap: https://thehardwareguru.cz/sitemap-hity.xml
# Sitemap: https://thehardwareguru.cz/rss-comparisons.xml

# Ochrana před AI (Zákaz vykrádání obsahu)
User-agent: GPTBot
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: PerplexityBot
Disallow: /

User-agent: BingAI
Disallow: /

User-agent: Bytespider
Disallow: /

# Roboty SEO
User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /
`;

  return new Response(robots, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600'
    },
  });
}
