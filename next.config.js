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
        hostname: 'images.unsplash.com', // Tvoje záložní fotka z page.js
      }
    ],
  },
};

module.exports = nextConfig;
