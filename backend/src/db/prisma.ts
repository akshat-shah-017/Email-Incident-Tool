import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

// Create Prisma client singleton
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: [
            { level: 'warn', emit: 'event' },
            { level: 'error', emit: 'event' },
        ],
    });

// Attach event listeners for logging
prisma.$on('warn' as never, (e: { message: string }) => {
    logger.warn('Prisma warning:', e.message);
});

prisma.$on('error' as never, (e: { message: string }) => {
    logger.error('Prisma error:', e.message);
});

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

// Database connection test
export async function connectDatabase(): Promise<void> {
    try {
        await prisma.$connect();
        logger.info('✅ Database connected successfully');
    } catch (error) {
        logger.error('❌ Failed to connect to database:', error);
        throw error;
    }
}

// Graceful disconnect
export async function disconnectDatabase(): Promise<void> {
    await prisma.$disconnect();
    logger.info('Database disconnected');
}

export default prisma;
