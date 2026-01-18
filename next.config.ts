import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['recharts', 'lucide-react'],
  },
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'resources.premierleague.com',
        port: '',
        pathname: '/premierleague/photos/players/**',
      },
    ],
  },
  output: 'standalone',
};

export default nextConfig;
