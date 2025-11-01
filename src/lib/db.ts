import { Prisma, PrismaClient } from '@prisma/client';

// cache global para evitar recriar client em dev e em ambientes serverless aquecidos
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// ⚠️ IMPORTANTE:
// Não chamar prisma.$executeRawUnsafe() aqui.
// Não chamar prisma.$connect() aqui.
// Não fazer nenhuma query aqui.

export { Prisma };
export default prisma;
