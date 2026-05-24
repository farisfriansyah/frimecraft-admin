// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
      }
    ],
  },
  
  // MENCEGAH TURBOPACK MERUSAK ADAPTER CLIENT DI SISI SERVER ROUTER
  serverExternalPackages: ["@prisma/client", "pg"],

  experimental: {
    serverActions: {
      bodySizeLimit: "20mb", 
    },
  },
};

export default nextConfig;