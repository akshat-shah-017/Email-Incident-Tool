import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import config from './config';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware';
import { httpLogStream, ensureDir } from './utils';

/**
 * Create and configure Express application
 */
export async function createApp(): Promise<Application> {
    const app = express();

    // Ensure upload directory exists
    await ensureDir(path.resolve(config.uploadDir));

    // Security middleware
    app.use(helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    }));

    // CORS configuration
    app.use(cors({
        origin: config.corsOrigin,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    }));

    // Rate limiting
    const limiter = rateLimit({
        windowMs: config.rateLimit.windowMs,
        max: config.rateLimit.maxRequests,
        message: {
            status: 'error',
            message: 'Too many requests, please try again later.',
            error: { code: 'RATE_LIMIT_EXCEEDED' },
        },
    });
    app.use('/api/', limiter);

    // Request logging
    app.use(morgan(config.logFormat, { stream: httpLogStream }));

    // Body parsing
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Static files (for serving uploaded files if needed)
    app.use('/uploads', express.static(path.resolve(config.uploadDir)));

    // API routes
    app.use('/api', routes);

    // Root endpoint
    app.get('/', (req, res) => {
        res.json({
            status: 'success',
            message: 'Email Incident Tool API',
            version: '1.0.0',
            docs: '/api/health',
        });
    });

    // Error handling
    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}

export default createApp;
