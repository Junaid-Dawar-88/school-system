import { PrismaClient } from "./generated/prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaAdapterType: string | undefined;
};

const ADAPTER_KEY = "PrismaNeonHttp";

function createPrismaClient() {
  const adapter = new PrismaNeonHttp(process.env.DATABASE_URL!, {
    arrayMode: false,
    fullResults: true,
  });
  return new PrismaClient({ adapter });
}

// Invalidate cached client if adapter changed
if (globalForPrisma.prismaAdapterType !== ADAPTER_KEY) {
  globalForPrisma.prisma = undefined;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaAdapterType = ADAPTER_KEY;
}
