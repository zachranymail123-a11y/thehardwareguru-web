/**
 * GURU ROBOTS ENGINE V4.2 (LIVE SITEMAP UPDATE)
 * Cesta: src/app/robots.txt/route.js
 * 🛡️ CEL: Přidána dynamická sitemapa pro lidmi vygenerované GTA VI predikce.
 * 🛡️ FIX: Propojení sitemap-hity.xml pro maximální indexaci.
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

# Mapy webu (Včetně dynamických hitů)
Sitemap: https://thehardwareguru.cz/guru-sitemap.xml
Sitemap: https://thehardwareguru.cz/latest.xml
Sitemap: https://thehardwareguru.cz/sitemap-hity.xml

# Ochrana před AI (Zákaz vykrádání obsahu bez trafficu)
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

# Roboty SEO (Zákaz pro nástroje, které zbytečně vytěžují DB)
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
