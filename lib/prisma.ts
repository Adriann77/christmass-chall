import { PrismaClient } from '@prisma/client';
import type { Prisma } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prisma Client configuration optimized for serverless environments
const prismaClientOptions: Prisma.PrismaClientOptions = {
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty' as Prisma.ErrorFormat,
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(prismaClientOptions);

// In production (Vercel), we still want to reuse the same instance
// to avoid creating multiple connections in serverless functions
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}

export default prisma;
