/**
 * GURU SEO ENGINE - ROBOTS GENERATOR V2.5 (NATIVE NEXT.JS)
 * Cesta: src/app/robots.js
 * 🛡️ CÍL: Ideální SEO verze s blokací AI crawlerů a SEO nástrojů.
 * 🛡️ FIX: Zahrnuje POUZE platné XML sitemapy (odstraněna stará bing-sitemap).
 * 🛡️ FIX 2: Přidán crawlDelay: 1 pro plynulý průchod Seznam a Bing botů.
 */
export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'],
        crawlDelay: 1,
      },
      {
        userAgent: [
          'GPTBot',
          'CCBot',
          'ClaudeBot',
          'anthropic-ai',
          'Google-Extended',
          'PerplexityBot',
          'BingAI',
          'Bytespider',
          'AhrefsBot',
          'SemrushBot'
        ],
        disallow: '/',
      }
    ],
    sitemap: [
      'https://thehardwareguru.cz/guru-sitemap.xml',
      'https://thehardwareguru.cz/latest.xml'
    ],
  };
}
