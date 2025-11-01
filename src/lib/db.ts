import { Prisma, PrismaClient } from '@prisma/client';

import { env } from './env';

const createPrismaClient = () =>
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: env.NODE_ENV === 'development' ? 'pretty' : 'minimal',
  });

type GlobalWithPrisma = typeof globalThis & { prisma?: PrismaClient };

const globalForPrisma = globalThis as GlobalWithPrisma;

const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Reuse PrismaClient across lambda invocations to avoid expensive
// connection setup on every cold start. Previously the reuse was only
// enabled when NODE_ENV !== 'production'. For serverless environments
// (like Vercel) reusing the client reduces latency and helps avoid
// connection overhead that can lead to timeouts.
globalForPrisma.prisma = prisma;

let shutdownHooksRegistered = false;

const registerShutdownHooks = (client: PrismaClient) => {
  if (shutdownHooksRegistered) {
    return;
  }

  shutdownHooksRegistered = true;

  const disconnect = async () => {
    try {
      await client.$disconnect();
    } catch (error) {
      if (env.NODE_ENV !== 'test') {
        console.error('Error disconnecting Prisma client', error);
      }
    }
  };

  process.on('beforeExit', disconnect);
  process.on('SIGINT', async () => {
    await disconnect();
    process.exit(0);
  });
  process.on('SIGTERM', async () => {
    await disconnect();
    process.exit(0);
  });
};

registerShutdownHooks(prisma);

export { Prisma };
export default prisma;
