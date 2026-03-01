/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'luepzmdwgrbtnevlznbx.supabase.co', // Tvoje Supabase
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com', // YouTube náhledovky
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com', // YouTube náhledy (pro live streamy) [cite: 2026-02-25]
      },
      {
        protocol: 'https',
        hostname: 'kick.com', // Hlavní doména Kicku [cite: 2026-02-28]
      },
      {
        protocol: 'https',
        hostname: '*.kick.com', // Subdomény Kicku pro obrázky [cite: 2026-02-28]
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // Záložní fotka
      }
    ],
  },
};

module.exports = nextConfig;
