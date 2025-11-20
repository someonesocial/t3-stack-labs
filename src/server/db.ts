import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Prevent multiple instances of Prisma Client in dev (Next.js hot reload)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// If engineType "client" (Rust-free) is used (e.g. Vercel build), we must supply an adapter.
// Alternatively, set PRISMA_CLIENT_ENGINE_TYPE="binary" to force the Rust engine and avoid adapter usage.

const connectionString =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_PRISMA_URL ??
  process.env.POSTGRES_URL ??
  process.env.POSTGRES_URL_NON_POOLING;

// Fail fast in production if missing DB URL
if (!connectionString && process.env.NODE_ENV === "production") {
  throw new Error(
    "Missing PostgreSQL connection string. Set DATABASE_URL (or Vercel POSTGRES_PRISMA_URL).",
  );
}

// Create adapter only when we have a connection string; harmless locally if placeholder.
let adapter: PrismaPg | undefined;
if (connectionString) {
  const pool = new Pool({ connectionString });
  adapter = new PrismaPg(pool);
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(adapter ? { adapter } : {}),
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
