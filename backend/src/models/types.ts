// Type definitions for the Email Incident API

import { Incident } from '@prisma/client';

// ============ Request/Response Types ============

export interface ApiResponse<T = unknown> {
    status: 'success' | 'error';
    data?: T;
    message?: string;
    error?: {
        code: string;
        details?: unknown;
    };
    meta?: PaginationMeta;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface PaginationQuery {
    page?: string;
    limit?: string;
}

// ============ Incident Types ============

export interface CreateIncidentInput {
    subject: string;
    senderName?: string | null;
    senderEmail: string;
    receivedAt: Date | string;
    summary?: string | null;
    bodyText: string;
    rawEml?: string | null;
    fileName?: string | null;
    fileType?: string | null;
    summarized?: boolean;
    errorMessage?: string | null;
}

export interface UpdateIncidentInput {
    subject?: string;
    senderName?: string | null;
    senderEmail?: string;
    receivedAt?: Date | string;
    summary?: string | null;
    bodyText?: string;
    summarized?: boolean;
    errorMessage?: string | null;
    priority?: 'high' | 'medium' | 'low' | null;
    status?: 'complete' | 'incomplete';
    completedAt?: Date | string | null;
    completionNotes?: string | null;
}

export interface IncidentFilters {
    search?: string;
    senderEmail?: string;
    subject?: string;
    startDate?: string;
    endDate?: string;
    incidentId?: string;
    priority?: 'high' | 'medium' | 'low' | 'assigned' | 'unassigned';
    sortBy?: 'date' | 'priority';
    status?: 'complete' | 'incomplete';
}

export type IncidentResponse = Incident;

export interface IncidentListResponse {
    incidents: Incident[];
    meta: PaginationMeta;
}

// ============ Email Parsing Types ============

export interface ParsedEmail {
    subject: string;
    senderName: string | null;
    senderEmail: string;
    receivedAt: Date;
    bodyText: string;
    bodyHtml: string | null;
    rawContent?: string;
}

export interface EmailParseResult {
    success: boolean;
    email?: ParsedEmail;
    error?: string;
}

// ============ AI Summarization Types ============

export interface SummarizationRequest {
    content: string;
    maxLength?: number;
}

export interface SummarizationResponse {
    success: boolean;
    summary?: string;
    provider?: 'openrouter' | 'gemini';
    error?: string;
}

// ============ File Upload Types ============

export interface UploadedFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
    path?: string;
}

export interface UploadResult {
    success: boolean;
    incident?: Incident;
    error?: string;
}

// ============ Health Check Types ============

export interface HealthCheckResponse {
    status: 'healthy' | 'unhealthy';
    timestamp: string;
    version: string;
    services: {
        database: ServiceStatus;
        ai: ServiceStatus;
    };
}

export interface ServiceStatus {
    status: 'up' | 'down' | 'degraded';
    message?: string;
}
