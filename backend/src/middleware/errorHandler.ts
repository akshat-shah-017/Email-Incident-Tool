import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import config from '../config';

interface ErrorResponse {
    status: 'error';
    message: string;
    error?: {
        code: string;
        details?: unknown;
    };
    stack?: string;
}

/**
 * Global error handling middleware
 */
export function errorHandler(
    err: Error | AppError,
    req: Request,
    res: Response,
    _next: NextFunction
): void {
    // Default error properties
    let statusCode = 500;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    let details: unknown = undefined;

    // Handle known application errors
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        code = err.code;
        details = (err as unknown as Record<string, unknown>).details;
    } else if (err.name === 'ValidationError') {
        statusCode = 400;
        message = err.message;
        code = 'VALIDATION_ERROR';
    } else if (err.name === 'SyntaxError') {
        statusCode = 400;
        message = 'Invalid JSON in request body';
        code = 'PARSE_ERROR';
    }

    // Log the error
    if (statusCode >= 500) {
        logger.error(`${req.method} ${req.path} - ${statusCode}:`, {
            error: err.message,
            stack: err.stack,
            body: req.body,
            params: req.params,
        });
    } else {
        logger.warn(`${req.method} ${req.path} - ${statusCode}: ${err.message}`);
    }

    // Build response
    const response: ErrorResponse = {
        status: 'error',
        message,
        error: { code, details },
    };

    // Include stack trace in development
    if (!config.isProduction && err.stack) {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(
    req: Request,
    res: Response,
    _next: NextFunction
): void {
    res.status(404).json({
        status: 'error',
        message: `Route not found: ${req.method} ${req.path}`,
        error: { code: 'NOT_FOUND' },
    });
}

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export function asyncHandler(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
