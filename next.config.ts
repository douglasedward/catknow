import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.thecatapi.com',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: '**.media.tumblr.com',
        port: '',
        pathname: '/**'
      }
    ]
  }
};

export default nextConfig;
