/**
 * GURU ROBOTS ENGINE V4.1 (API ROUTE VERSION)
 * Ścieżka: src/app/robots.txt/route.js
 * 🛡️ CEL: Tekstowy wariant robots.txt w 100% zgodny z zasadami SEO i ochroną.
 * 🛡️ POPRAWKA: Usunięto starą mapę bing-sitemap.xml.
 */

export const revalidate = 86400;

export async function GET() {
  const robots = `# GURU ROBOTS CONFIG - thehardwareguru.cz
User-agent: *
Allow: /
Crawl-delay: 1

# Administracja i API
Disallow: /api/
Disallow: /admin/

# Mapy witryny (zgodnie ze standardami tylko XML)
Sitemap: https://thehardwareguru.cz/guru-sitemap.xml
Sitemap: https://thehardwareguru.cz/latest.xml

# Ochrona przed AI
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
