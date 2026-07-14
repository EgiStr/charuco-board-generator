import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel handles both static & server rendering natively
  // No need for `output: "export"` — Vercel's builder optimizes automatically

  // Skip trailing slash issues
  trailingSlash: true,
};

export default nextConfig;
