// next.config.ts
import type { NextConfig } from "next";

const basePath = process.env.APP_BASE_PATH && process.env.APP_BASE_PATH !== "/"
  ? process.env.APP_BASE_PATH.replace(/\/$/, "")
  : "/frime-admin";

const nextConfig: NextConfig = {
  basePath,
  output: "standalone",
  outputFileTracingExcludes: {
    "/*": [
      "./backup.dump",
      "./backup.sql",
      "./docs/**",
      "./eslint.config.mjs",
      "./frimecraft-admin.zip",
      "./hooks/**",
      "./middleware.ts",
      "./next.configdev.ts",
      "./next.config.ts",
      "./package-lock.json",
      "./postcss.config.mjs",
      "./prisma.config.ts",
      "./prisma/**",
      "./README.md",
      "./src/**",
      "./standalone.zip",
      "./tailwind.config.js",
      "./tsconfig.json",
      "./tsconfig.tsbuildinfo",
      "./components.json",
    ],
  },
  outputFileTracingIncludes: {
    "/*": [
      "./node_modules/@img/sharp-*/**/*",
      "./node_modules/@prisma/**",
      "./node_modules/.prisma/client/**",
      "./node_modules/pg*/**",
      "./node_modules/postgres-*/**",
      "./node_modules/split2/**",
    ],
  },
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
  serverExternalPackages: ["@prisma/client", "pg", "sharp"],

  experimental: {
    serverActions: {
      bodySizeLimit: "20mb", 
    },
  },
};

export default nextConfig;