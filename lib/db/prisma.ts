import { PrismaClient } from "@prisma/client";

/**
 * Prisma client singleton. Next.js hot-reloads server modules in dev, which
 * would otherwise spawn a new PrismaClient (and a new connection pool) on
 * every edit — so we cache the instance on `globalThis` outside production.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
