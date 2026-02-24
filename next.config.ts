import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for development
  reactStrictMode: true,

  // Experimental features
  experimental: {
    // Enable server actions
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // Environment variables available to the browser
  env: {
    NEXT_PUBLIC_APP_NAME: "Aegis GRC",
    NEXT_PUBLIC_APP_VERSION: "0.1.0",
  },
};

export default nextConfig;
