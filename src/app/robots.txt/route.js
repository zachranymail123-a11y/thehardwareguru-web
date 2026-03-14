export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'],
        crawlDelay: 1,
      },

      // AI crawlers
      {
        userAgent: [
          'GPTBot',
          'ClaudeBot',
          'CCBot',
          'anthropic-ai',
          'PerplexityBot',
          'Bytespider',
          'Google-Extended',
          'BingPreview'
        ],
        disallow: '/',
      },

      // SEO crawlers
      {
        userAgent: [
          'AhrefsBot',
          'SemrushBot'
        ],
        disallow: '/',
      }
    ],

    sitemap: 'https://thehardwareguru.cz/guru-sitemap.xml',
  };
}
