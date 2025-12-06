// Custom error classes for the application

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly code: string;

    constructor(
        message: string,
        statusCode: number = 500,
        code: string = 'INTERNAL_ERROR',
        isOperational: boolean = true
    ) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = isOperational;

        Error.captureStackTrace(this, this.constructor);
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export class ValidationError extends AppError {
    constructor(message: string, details?: unknown) {
        super(message, 400, 'VALIDATION_ERROR');
        if (details) {
            (this as unknown as Record<string, unknown>).details = details;
        }
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string = 'Resource') {
        super(`${resource} not found`, 404, 'NOT_FOUND');
    }
}

export class FileProcessingError extends AppError {
    constructor(message: string) {
        super(message, 422, 'FILE_PROCESSING_ERROR');
    }
}

export class AIServiceError extends AppError {
    constructor(message: string, provider?: string) {
        super(
            provider ? `${provider}: ${message}` : message,
            503,
            'AI_SERVICE_ERROR'
        );
    }
}

export class DatabaseError extends AppError {
    constructor(message: string) {
        super(message, 500, 'DATABASE_ERROR');
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = 'Unauthorized') {
        super(message, 401, 'UNAUTHORIZED');
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = 'Forbidden') {
        super(message, 403, 'FORBIDDEN');
    }
}

export class RateLimitError extends AppError {
    constructor(message: string = 'Too many requests') {
        super(message, 429, 'RATE_LIMIT_EXCEEDED');
    }
}
