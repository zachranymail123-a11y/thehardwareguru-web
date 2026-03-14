/**
 * GURU ROBOTS ENGINE V3.3 (SEZNAM SYNTAX FIX)
 * Cesta: src/app/robots.txt/route.js
 * 🛡️ FIX: Nevalidní tag 'Feed:' nahrazen standardním 'Sitemap:', aby zmizela chyba v Seznam Webmaster.
 */

export async function GET() {
  const robots = `# GURU ROBOTS CONFIG - thehardwareguru.cz
User-agent: *
Allow: /

# Administrace a API
Disallow: /api/
Disallow: /admin/

# Sitemapy a RSS feedy (Vše přes direktivu Sitemap:)
Sitemap: https://thehardwareguru.cz/guru-sitemap.xml
Sitemap: https://thehardwareguru.cz/rss.xml
Sitemap: https://thehardwareguru.cz/rss-comparisons.xml

# AI protection
User-agent: GPTBot
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: PerplexityBot
Disallow: /

# SEO crawlers
User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /
`;

  return new Response(robots, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600'
    },
  });
}
