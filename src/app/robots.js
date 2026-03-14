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
          'Bytespider',
          'BingPreview',
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
