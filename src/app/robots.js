/**
 * GURU SEO ENGINE - ROBOTS GENERATOR V2.2
 * Cesta: src/app/robots.js
 * 🛡️ CÍL: Ideální SEO verze s blokací AI crawlerů a SEO nástrojů.
 * 🛡️ FIX: Přidán crawlDelay: 1 pro plynulejší a stabilnější indexaci (zásadní pro Bing/Seznam).
 * 🚀 NEW: Kompletní SEO architektura - přidány odkazy na latest.xml a RSS feedy.
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
      'https://thehardwareguru.cz/latest.xml',
      'https://thehardwareguru.cz/rss.xml',
      'https://thehardwareguru.cz/rss-comparisons.xml'
    ],
  };
}
