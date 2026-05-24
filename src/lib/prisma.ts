// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as { 
  db: PrismaClient | undefined;
  pgPool: pg.Pool | undefined;
};

// Mengunci instans pool agar tidak terjadi kebocoran memori (connection exhaustion) saat Next.js hot reload
if (!globalForPrisma.pgPool) {
  globalForPrisma.pgPool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
}

const adapter = new PrismaPg(globalForPrisma.pgPool);

export const db = globalForPrisma.db || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.db = db;
}