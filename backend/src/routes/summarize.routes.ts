import { Router } from 'express';
import { summarizeController } from '../controllers';
import { asyncHandler, validate, summarizeSchema } from '../middleware';

const router = Router();

/**
 * Summarize Routes
 * 
 * POST /api/summarize       - Generate AI summary
 * GET  /api/summarize/status - Check AI service status
 */

// Generate AI summary
router.post(
    '/',
    validate({ body: summarizeSchema }),
    asyncHandler(summarizeController.summarize.bind(summarizeController))
);

// Get AI service status
router.get(
    '/status',
    summarizeController.getStatus.bind(summarizeController)
);

export default router;
