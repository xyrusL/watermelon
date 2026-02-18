import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed rewrites - using direct Supabase URLs instead to save Vercel bandwidth
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
