import { PrismaClient } from '@prisma/client';
import { getLogger } from '../utils/logger.js';

const logger = getLogger('database');

export const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
  ],
});

prisma.$on('query', (e: { query: string; duration: number }) => {
  logger.debug('Query', { query: e.query, duration: e.duration });
});

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  logger.info('Database connected');
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info('Database disconnected');
}
