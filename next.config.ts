import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for Vercel deployment
  output: "export",

  // Optimize images
  images: {
    unoptimized: true,
  },

  // Skip trailing slash issues
  trailingSlash: true,
};

export default nextConfig;
