import { PrismaClient } from "@prisma/client";

// Prevent multiple instances of Prisma Client in dev (Next.js hot reload)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// If you see engineType "client" errors, ensure no env var forces Rust-free engine:
// Remove PRISMA_CLIENT_ENGINE_TYPE or set it to "binary" in your environment.

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
