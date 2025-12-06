import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { Express } from 'express';
import { createApp } from '../../backend/src/app';

let app: Express;

beforeAll(async () => {
    app = await createApp();
});

describe('API Integration Tests', () => {
    describe('GET /api/health', () => {
        it('returns health status', async () => {
            const response = await request(app)
                .get('/api/health')
                .expect('Content-Type', /json/);

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('success');
            expect(response.body.data).toHaveProperty('status');
            expect(response.body.data).toHaveProperty('timestamp');
            expect(response.body.data).toHaveProperty('services');
        });
    });

    describe('GET /api/health/ping', () => {
        it('returns pong', async () => {
            const response = await request(app)
                .get('/api/health/ping')
                .expect(200);

            expect(response.body.message).toBe('pong');
        });
    });

    describe('GET /api/upload/types', () => {
        it('returns supported file types', async () => {
            const response = await request(app)
                .get('/api/upload/types')
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.data).toContain('.eml');
            expect(response.body.data).toContain('.msg');
        });
    });

    describe('GET /api/summarize/status', () => {
        it('returns AI service status', async () => {
            const response = await request(app)
                .get('/api/summarize/status')
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.data).toHaveProperty('available');
            expect(response.body.data).toHaveProperty('providers');
        });
    });

    describe('GET /api/incidents', () => {
        it('returns incidents list', async () => {
            const response = await request(app)
                .get('/api/incidents')
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.meta).toHaveProperty('page');
            expect(response.body.meta).toHaveProperty('total');
        });

        it('supports pagination', async () => {
            const response = await request(app)
                .get('/api/incidents?page=1&limit=10')
                .expect(200);

            expect(response.body.meta.page).toBe(1);
            expect(response.body.meta.limit).toBe(10);
        });
    });

    describe('GET /api/incidents/:id', () => {
        it('returns 404 for non-existent incident', async () => {
            const response = await request(app)
                .get('/api/incidents/99999')
                .expect(404);

            expect(response.body.status).toBe('error');
        });
    });

    describe('POST /api/upload', () => {
        it('returns 400 when no file uploaded', async () => {
            const response = await request(app)
                .post('/api/upload')
                .expect(400);

            expect(response.body.status).toBe('error');
        });
    });

    describe('POST /api/summarize', () => {
        it('returns 400 when content missing', async () => {
            const response = await request(app)
                .post('/api/summarize')
                .send({})
                .expect(400);

            expect(response.body.status).toBe('error');
        });
    });

    describe('Error Handling', () => {
        it('returns 404 for unknown routes', async () => {
            const response = await request(app)
                .get('/api/unknown-route')
                .expect(404);

            expect(response.body.status).toBe('error');
            expect(response.body.error.code).toBe('NOT_FOUND');
        });
    });
});
