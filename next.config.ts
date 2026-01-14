import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/images/:path*',
        destination: 'https://urmaardoyujvikbejzeg.supabase.co/storage/v1/object/public/watermelon-images/:path*',
      },
    ];
  },
};

export default nextConfig;
