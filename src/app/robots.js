/**
 * GURU SEO ENGINE - ROBOTS GENERATOR V2.6 (NATIVE NEXT.JS)
 * Cesta: src/app/robots.js
 * 🛡️ CÍL: Ideální SEO verze s blokací AI crawlerů a SEO nástrojů.
 * 🛡️ FIX 1: Zahrnuje POUZE platné XML sitemapy (odstraněna stará bing-sitemap).
 * 🛡️ FIX 2: Přidán crawlDelay: 1 pro plynulý průchod Seznam a Bing botů.
 * 🛡️ FIX 3: Zachováno VIP povolení pro AdSense (Mediapartners-Google).
 */

export default function robots() {
  return {
    rules: [
      {
        // 1. Povolení pro VŠECHNY běžné vyhledávače (Googlebot, Seznambot, atd.)
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'],
        crawlDelay: 1, // Ochrana serveru před zahlcením
      },
      {
        // 2. 🚀 GURU VIP HACK: Explicitní povolení pro AdSense robota
        // Garantuje, že reklamy nebudou NIKDY blokovány
        userAgent: 'Mediapartners-Google',
        allow: '/',
      },
      {
        // 3. Ochrana proti AI scraperům a SEO botům, kteří kradou obsah a pálí výkon DB
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
    // 🔗 SITEMAPS: Přímé napojení pouze na aktuální dynamické master-indexy
    sitemap: [
      'https://thehardwareguru.cz/guru-sitemap.xml',
      'https://thehardwareguru.cz/latest.xml'
    ],
  };
}
