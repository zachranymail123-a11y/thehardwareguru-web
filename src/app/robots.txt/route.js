/**
 * GURU ROBOTS ENGINE V4.4 (FULL SITEMAP MODE)
 * Cesta: src/app/robots.txt/route.js
 * 🚀 CÍL: Přidány všechny dílčí sitemapy natvrdo, aby je Bingbot bez problému našel.
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

# Mapy webu (Všechny dílčí mapy vypsané natvrdo pro pomalejší boty)
Sitemap: https://thehardwareguru.cz/guru-sitemap/pages.xml
Sitemap: https://thehardwareguru.cz/guru-sitemap/posts.xml
Sitemap: https://thehardwareguru.cz/guru-sitemap/cpu.xml
Sitemap: https://thehardwareguru.cz/guru-sitemap/gpu.xml
Sitemap: https://thehardwareguru.cz/guru-sitemap/duels.xml
Sitemap: https://thehardwareguru.cz/guru-sitemap/upgrades.xml
Sitemap: https://thehardwareguru.cz/guru-sitemap/1.xml
Sitemap: https://thehardwareguru.cz/guru-sitemap/2.xml
Sitemap: https://thehardwareguru.cz/guru-sitemap/3.xml
Sitemap: https://thehardwareguru.cz/guru-sitemap/4.xml
Sitemap: https://thehardwareguru.cz/guru-sitemap/5.xml
Sitemap: https://thehardwareguru.cz/guru-sitemap/6.xml
Sitemap: https://thehardwareguru.cz/guru-sitemap/7.xml
Sitemap: https://thehardwareguru.cz/guru-sitemap/8.xml
Sitemap: https://thehardwareguru.cz/guru-sitemap/9.xml
Sitemap: https://thehardwareguru.cz/guru-sitemap/10.xml
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
