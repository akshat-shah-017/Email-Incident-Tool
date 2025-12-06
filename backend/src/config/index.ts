import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
    // Server configuration
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',

    // Database
    databaseUrl: process.env.DATABASE_URL || '',

    // AI Services
    openRouter: {
        apiKey: process.env.OPENROUTER_API_KEY || '',
        model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku',
        baseUrl: 'https://openrouter.ai/api/v1',
    },
    gemini: {
        apiKey: process.env.GEMINI_API_KEY || '',
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest',
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    },

    // CORS - support multiple origins (comma-separated) or wildcard
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',').map(o => o.trim()),

    // File Upload
    maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    allowedFileTypes: ['.msg', '.eml'],

    // Logging
    logLevel: process.env.LOG_LEVEL || 'info',
    logFormat: process.env.LOG_FORMAT || 'combined',

    // Rate Limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    },
};

// Validate required configuration
export function validateConfig(): void {
    const required = ['DATABASE_URL'];
    const missing: string[] = [];

    for (const key of required) {
        if (!process.env[key]) {
            missing.push(key);
        }
    }

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    // Warn about missing AI keys
    if (!config.openRouter.apiKey && !config.gemini.apiKey) {
        console.warn(
            '⚠️  Warning: No AI API keys configured. Summarization will not be available.'
        );
    }
}

export default config;
