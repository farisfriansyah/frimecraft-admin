// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // Memperbaiki warning deprecation sekalian
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
  // Tambahkan konfigurasi di bawah ini untuk memperbesar batas upload gambar
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb", // Mengubah batas maksimal file menjadi 20 MB
    },
  },
};

export default nextConfig;