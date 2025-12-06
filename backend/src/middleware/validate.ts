import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodSchema } from 'zod';
import { ValidationError } from '../utils/errors';

/**
 * Validation middleware factory
 * Creates middleware that validates request data against a Zod schema
 */
export function validate(schema: {
    body?: ZodSchema;
    params?: ZodSchema;
    query?: ZodSchema;
}) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (schema.body) {
                req.body = await schema.body.parseAsync(req.body);
            }
            if (schema.params) {
                req.params = await schema.params.parseAsync(req.params);
            }
            if (schema.query) {
                req.query = await schema.query.parseAsync(req.query);
            }
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const details = error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));
                next(new ValidationError('Validation failed', details));
            } else {
                next(error);
            }
        }
    };
}

// ============ Common Validation Schemas ============

export const paginationSchema = z.object({
    page: z.string().regex(/^\d+$/).optional().default('1'),
    limit: z.string().regex(/^\d+$/).optional().default('20'),
});

export const idParamSchema = z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a valid number'),
});

export const incidentFiltersSchema = z.object({
    page: z.string().regex(/^\d+$/).optional().default('1'),
    limit: z.string().regex(/^\d+$/).optional().default('20'),
    search: z.string().optional(),
    senderEmail: z.string().optional(),
    subject: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    incidentId: z.string().optional(),
    priority: z.enum(['high', 'medium', 'low', 'assigned', 'unassigned']).optional(),
    sortBy: z.enum(['date', 'priority']).optional(),
    status: z.enum(['complete', 'incomplete']).optional(),
});

export const createIncidentSchema = z.object({
    subject: z.string().min(1, 'Subject is required').max(500),
    senderName: z.string().max(255).optional().nullable(),
    senderEmail: z.string().email('Invalid email address'),
    receivedAt: z.string().or(z.date()),
    summary: z.string().optional().nullable(),
    bodyText: z.string().min(1, 'Body text is required'),
    rawEml: z.string().optional().nullable(),
    fileName: z.string().max(255).optional().nullable(),
    fileType: z.string().max(10).optional().nullable(),
});

export const updateIncidentSchema = z.object({
    subject: z.string().min(1).max(500).optional(),
    senderName: z.string().max(255).optional().nullable(),
    senderEmail: z.string().email().optional(),
    receivedAt: z.string().or(z.date()).optional(),
    summary: z.string().optional().nullable(),
    bodyText: z.string().min(1).optional(),
    summarized: z.boolean().optional(),
    errorMessage: z.string().optional().nullable(),
    priority: z.enum(['high', 'medium', 'low']).optional().nullable(),
    status: z.enum(['complete', 'incomplete']).optional(),
    completedAt: z.string().or(z.date()).optional().nullable(),
    completionNotes: z.string().optional().nullable(),
});

export const summarizeSchema = z.object({
    content: z.string().min(1, 'Content is required'),
    maxLength: z.number().min(100).max(2000).optional(),
});
