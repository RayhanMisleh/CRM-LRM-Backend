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

// Set a conservative statement_timeout for each new connection/session.
// This helps prevent a single long-running query from blocking a
// serverless invocation until the platform timeout. We call this
// non-blocking so it runs on cold-start and on reused clients.
try {
  // Do not await: run in background and log any error.
  prisma
    .$executeRawUnsafe("SET statement_timeout = 5000")
    .then(() => console.log('Prisma: statement_timeout set to 5000ms'))
    .catch((err) => console.error('Prisma: failed to set statement_timeout', err));
} catch (err) {
  // Safety: if something unexpected happens when scheduling the command,
  // log it but do not crash the process.
  console.error('Prisma: error scheduling statement_timeout', err);
}

export { Prisma };
export default prisma;
