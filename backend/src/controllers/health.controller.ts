import { Request, Response } from 'express';
import { prisma } from '../db';
import { aiSummarizationService } from '../services';
import { HealthCheckResponse, ApiResponse } from '../models/types';
import { logger } from '../utils';

/**
 * Health Controller
 * Handles system health check endpoints
 */
export class HealthController {
    /**
     * GET /api/health
     * Comprehensive health check
     */
    async check(req: Request, res: Response): Promise<void> {
        const health: HealthCheckResponse = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '1.0.0',
            services: {
                database: { status: 'down' },
                ai: { status: 'down' },
            },
        };

        // Check database
        try {
            await prisma.$queryRaw`SELECT 1`;
            health.services.database = { status: 'up' };
        } catch (error) {
            health.status = 'unhealthy';
            health.services.database = {
                status: 'down',
                message: 'Database connection failed',
            };
            logger.error('Health check: Database connection failed', error);
        }

        // Check AI service
        if (aiSummarizationService.isAvailable()) {
            health.services.ai = {
                status: 'up',
                message: `Providers: ${aiSummarizationService.getAvailableProviders().join(', ')}`,
            };
        } else {
            health.services.ai = {
                status: 'degraded',
                message: 'No AI API keys configured',
            };
        }

        const statusCode = health.status === 'healthy' ? 200 : 503;

        const response: ApiResponse<HealthCheckResponse> = {
            status: 'success',
            data: health,
        };

        res.status(statusCode).json(response);
    }

    /**
     * GET /api/health/ping
     * Simple ping endpoint
     */
    ping(req: Request, res: Response): void {
        res.json({
            status: 'success',
            message: 'pong',
            timestamp: new Date().toISOString(),
        });
    }
}

// Export singleton instance
export const healthController = new HealthController();
