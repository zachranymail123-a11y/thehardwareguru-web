/**
 * GURU ROBOTS ENGINE V2.1
 * Cesta: src/app/robots.txt/route.js
 * 🚀 CÍL: Perfektní indexace, eliminace duplicit a ochrana před AI crawlery.
 * 🛡️ FIX: Zahrnuje Cache-Control a přidává Sitemapu i RSS Feed discovery pro Googlebot.
 */

export async function GET() {
  const robots = `# GURU ROBOTS CONFIG - thehardwareguru.cz
User-agent: *
Allow: /

# Blokování systémových cest, které Google nemá indexovat
Disallow: /api/
Disallow: /_next/
Disallow: /admin/
Disallow: /static/

# Prevence duplicitního obsahu: Blokujeme URL s query parametry
# To zabrání indexaci filtrů nebo vyhledávání, které by dělaly bordel v GSC
Disallow: /*?*

# Speciální pravidla pro sitemapy (Kritické pro GSC)
Sitemap: https://thehardwareguru.cz/sitemap.xml

# RSS Discovery (Zajišťuje nejrychlejší objevování nových URL přes Google Feed crawler)
Feed: https://thehardwareguru.cz/rss.xml
Feed: https://thehardwareguru.cz/rss-comparisons.xml

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
