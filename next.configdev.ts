// next.config.ts
import type { NextConfig } from "next";

const basePath = process.env.APP_BASE_PATH && process.env.APP_BASE_PATH !== "/"
  ? process.env.APP_BASE_PATH.replace(/\/$/, "")
  : "/frime-admin";

const nextConfig: NextConfig = {
  basePath,
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'frimecraft.com',
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