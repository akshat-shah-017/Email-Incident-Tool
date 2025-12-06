import { createApp } from './app';
import config, { validateConfig } from './config';
import { connectDatabase, disconnectDatabase } from './db';
import { logger, ensureDir } from './utils';

/**
 * Start the server
 */
async function startServer(): Promise<void> {
    try {
        // Validate configuration
        validateConfig();
        logger.info('Configuration validated');

        // Ensure logs directory exists
        await ensureDir('./logs');

        // Connect to database
        await connectDatabase();

        // Create Express app
        const app = await createApp();

        // Start listening
        const server = app.listen(config.port, () => {
            logger.info(`🚀 Server running on port ${config.port}`);
            logger.info(`📄 Environment: ${config.nodeEnv}`);
            logger.info(`🔗 API: http://localhost:${config.port}/api`);
            logger.info(`❤️  Health: http://localhost:${config.port}/api/health`);
        });

        // Graceful shutdown handlers
        const gracefulShutdown = async (signal: string) => {
            logger.info(`${signal} received, starting graceful shutdown...`);

            server.close(async () => {
                logger.info('HTTP server closed');

                await disconnectDatabase();
                logger.info('Database disconnected');

                process.exit(0);
            });

            // Force exit after 10 seconds
            setTimeout(() => {
                logger.error('Could not close connections in time, forcefully shutting down');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            logger.error('Uncaught Exception:', error);
            process.exit(1);
        });

        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
        });

    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server
startServer();
