import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Hide development indicators in production
  devIndicators: {
    // Position for development indicators (if any are shown)
    position: 'bottom-right',
  },

  // Hide React DevTools in production
  reactStrictMode: true,
};

export default nextConfig;
