import { Router } from 'express';
import { healthController } from '../controllers';
import { asyncHandler } from '../middleware';

const router = Router();

/**
 * Health Routes
 * 
 * GET /api/health      - Comprehensive health check
 * GET /api/health/ping - Simple ping
 */

// Comprehensive health check
router.get(
    '/',
    asyncHandler(healthController.check.bind(healthController))
);

// Simple ping
router.get(
    '/ping',
    healthController.ping.bind(healthController)
);

export default router;
