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

  // Environment variables that will be available to the browser
  env: {
    DATABASE_URL: process.env.DATABASE_URL || "postgres://27f91cda97116c5c750e8bb46f085615bf165e9e3eb9e3eae566b59f09536cc9:sk_BGOJ2HjrGU4R70JpQAK1D@db.prisma.io:5432/postgres?sslmode=require",
  },
};

export default nextConfig;
