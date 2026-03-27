/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Ochrana proti nasazení rozbitého webu (Klíčové pro Bing trust)
  typescript: {
    ignoreBuildErrors: false, 
  },

  eslint: {
    ignoreDuringBuilds: false,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'luepzmdwgrbtnevlznbx.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'kick.com',
      },
      {
        protocol: 'https',
        hostname: 'www.kick.com',
      },
      {
        protocol: 'https',
        hostname: '*.kick.com', 
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ],
  },

  // ✅ Automatické přesměrování z www na non-www (SEO standard)
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.thehardwareguru.cz',
          },
        ],
        destination: 'https://thehardwareguru.cz/:path*',
        permanent: true,
      },
    ];
  },

  // ✅ Hardcore SEO & Performance hlavičky pro Bing a Google
  async headers() {
    return [
      {
        // Aplikujeme na vše kromě API, interních Next souborů, favicony a sitemapy
        source: '/((?!api|_next|favicon.ico|robots.txt|sitemap.xml).*)',
        headers: [
          {
            // Maximální rychlost z CDN, žádné zasekávání v browseru uživatele
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=120',
          },
          {
            // Povolení DNS Prefetch pro rychlejší navigaci
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            // Bezpečnostní trust signály
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
