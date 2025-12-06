// ============ Incident Types ============

export interface Incident {
    id: number;
    subject: string;
    senderName: string | null;
    senderEmail: string;
    receivedAt: string;
    loggedAt: string;
    summary: string | null;
    bodyText: string;
    rawEml: string | null;
    fileName: string | null;
    fileType: string | null;
    summarized: boolean;
    errorMessage: string | null;
    priority: 'high' | 'medium' | 'low' | null;
    status: 'complete' | 'incomplete';
    completedAt: string | null;
    completionNotes: string | null;
}

export interface CreateIncidentInput {
    subject: string;
    senderName?: string | null;
    senderEmail: string;
    receivedAt: string;
    summary?: string | null;
    bodyText: string;
    rawEml?: string | null;
    fileName?: string | null;
    fileType?: string | null;
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

export interface IncidentStats {
    total: number;
    summarized: number;
    unsummarized: number;
    todayCount: number;
}

// ============ API Response Types ============

export interface ApiResponse<T> {
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

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}

// ============ AI Types ============

export interface SummarizationResponse {
    success: boolean;
    summary?: string;
    provider?: 'openrouter' | 'gemini';
    error?: string;
}

// ============ Health Types ============

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
