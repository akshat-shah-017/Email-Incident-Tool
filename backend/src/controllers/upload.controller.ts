import { Request, Response } from 'express';
import { emailParserService, aiSummarizationService, incidentService } from '../services';
import { ApiResponse, UploadResult } from '../models/types';
import { Incident } from '@prisma/client';
import { logger, ValidationError, FileProcessingError, deleteFile } from '../utils';
import { getFileExtension } from '../utils/helpers';

/**
 * Upload Controller
 * Handles email file upload and processing
 */
export class UploadController {
    /**
     * POST /api/upload
     * Upload and process an email file
     */
    async uploadEmail(req: Request, res: Response): Promise<void> {
        const file = req.file;

        if (!file) {
            throw new ValidationError('No file uploaded. Please upload a .msg or .eml file.');
        }

        logger.info(`Processing uploaded file: ${file.originalname}`);

        // Validate file type
        if (!emailParserService.isValidFileType(file.originalname)) {
            throw new ValidationError(
                `Invalid file type. Supported formats: ${emailParserService.getSupportedTypes().join(', ')}`
            );
        }

        // Parse the email
        const parseResult = await emailParserService.parseEmailBuffer(
            file.buffer,
            file.originalname
        );

        if (!parseResult.success || !parseResult.email) {
            throw new FileProcessingError(
                parseResult.error || 'Failed to parse email file'
            );
        }

        const email = parseResult.email;

        // Generate AI summary
        let summary: string | null = null;
        let summarized = false;
        let errorMessage: string | null = null;

        if (aiSummarizationService.isAvailable()) {
            const summaryResult = await aiSummarizationService.summarize({
                content: email.bodyText,
            });

            if (summaryResult.success && summaryResult.summary) {
                summary = summaryResult.summary;
                summarized = true;
                logger.info(`Summary generated via ${summaryResult.provider}`);
            } else {
                errorMessage = summaryResult.error || 'Summarization failed';
                logger.warn(`Summarization failed: ${errorMessage}`);
            }
        } else {
            errorMessage = 'AI service not configured';
            logger.warn('AI summarization not available - no API keys configured');
        }

        // Create incident record
        const incident = await incidentService.create({
            subject: email.subject,
            senderName: email.senderName,
            senderEmail: email.senderEmail,
            receivedAt: email.receivedAt,
            bodyText: email.bodyText,
            summary: summary || 'Summary unavailable — AI service error.',
            rawEml: email.rawContent,
            fileName: file.originalname,
            fileType: getFileExtension(file.originalname),
            summarized,
            errorMessage,
        });

        // Clean up temp file if stored on disk
        if (file.path) {
            await deleteFile(file.path);
        }

        const response: ApiResponse<Incident> = {
            status: 'success',
            data: incident,
            message: `Email processed successfully. Incident #${incident.id} created.`,
        };

        res.status(201).json(response);
    }

    /**
     * GET /api/upload/supported-types
     * Get list of supported file types
     */
    getSupportedTypes(req: Request, res: Response): void {
        const response: ApiResponse<string[]> = {
            status: 'success',
            data: emailParserService.getSupportedTypes(),
        };

        res.json(response);
    }
}

// Export singleton instance
export const uploadController = new UploadController();
