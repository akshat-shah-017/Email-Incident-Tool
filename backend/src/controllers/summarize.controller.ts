import { Request, Response } from 'express';
import { aiSummarizationService } from '../services';
import { ApiResponse, SummarizationResponse } from '../models/types';
import { logger, ValidationError } from '../utils';

/**
 * Summarize Controller
 * Handles AI summarization requests
 */
export class SummarizeController {
    /**
     * POST /api/summarize
     * Generate AI summary for provided content
     */
    async summarize(req: Request, res: Response): Promise<void> {
        const { content, maxLength } = req.body;

        if (!content || content.trim().length === 0) {
            throw new ValidationError('Content is required for summarization');
        }

        logger.info('Processing summarization request');

        const result = await aiSummarizationService.summarize({
            content,
            maxLength,
        });

        const response: ApiResponse<SummarizationResponse> = {
            status: result.success ? 'success' : 'error',
            data: result,
            message: result.success
                ? 'Summary generated successfully'
                : result.error || 'Summarization failed',
        };

        res.json(response);
    }

    /**
     * GET /api/summarize/status
     * Check AI service availability
     */
    getStatus(req: Request, res: Response): void {
        const available = aiSummarizationService.isAvailable();
        const providers = aiSummarizationService.getAvailableProviders();

        const response: ApiResponse<{ available: boolean; providers: string[] }> = {
            status: 'success',
            data: {
                available,
                providers,
            },
        };

        res.json(response);
    }
}

// Export singleton instance
export const summarizeController = new SummarizeController();
