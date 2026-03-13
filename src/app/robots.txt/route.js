/**
 * GURU ROBOTS ENGINE V3.0 (SEO CRITICAL FIX)
 * Cesta: src/app/robots.txt/route.js
 * 🚀 CÍL: Perfektní indexace a vizibilita pro Googlebota.
 * 🛡️ FIX: Odstraněno blokování /_next/, /static/ a /*?*. Googlebot nyní může správně
 * renderovat CSS a JS, což je naprosto kritické pro SEO hodnocení a Core Web Vitals.
 */

export async function GET() {
  const robots = `# GURU ROBOTS CONFIG - thehardwareguru.cz
User-agent: *
Allow: /

# Blokování administrace a interních API (aby je Google neindexoval)
Disallow: /api/
Disallow: /admin/

# Sitemapy a RSS (Zlatý standard pro GSC a Seznam)
Sitemap: https://thehardwareguru.cz/sitemap.xml
Sitemap: https://thehardwareguru.cz/rss.xml
Sitemap: https://thehardwareguru.cz/rss-comparisons.xml

# --- AI & SCRAPER PROTECTION ---
# Zákaz pro AI boty, kteří těží data bez návštěvnosti
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

# Zákaz pro otravné SEO nástroje, které zbytečně zatěžují server
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
