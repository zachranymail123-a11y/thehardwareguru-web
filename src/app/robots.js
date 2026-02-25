export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/', // Skryjeme API před Googlem
    },
    sitemap: 'https://www.thehardwareguru.cz/sitemap.xml',
  }
}
