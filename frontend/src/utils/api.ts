import axios from 'axios';
import type {
    Incident,
    IncidentFilters,
    CreateIncidentInput,
    ApiResponse,
    PaginatedResponse,
    SummarizationResponse,
    HealthCheckResponse,
    IncidentStats
} from './types';

// Create axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || error.message || 'An error occurred';
        return Promise.reject(new Error(message));
    }
);

// ============ Incidents API ============

export async function getIncidents(
    page: number = 1,
    limit: number = 20,
    filters?: IncidentFilters
): Promise<PaginatedResponse<Incident>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (filters?.search) params.append('search', filters.search);
    if (filters?.senderEmail) params.append('senderEmail', filters.senderEmail);
    if (filters?.subject) params.append('subject', filters.subject);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.incidentId) params.append('incidentId', filters.incidentId);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.status) params.append('status', filters.status);

    const response = await api.get<ApiResponse<Incident[]>>(`/incidents?${params}`);
    return {
        data: response.data.data || [],
        meta: response.data.meta!,
    };
}

export async function getIncident(id: number): Promise<Incident> {
    const response = await api.get<ApiResponse<Incident>>(`/incidents/${id}`);
    return response.data.data!;
}

export async function createIncident(input: CreateIncidentInput): Promise<Incident> {
    const response = await api.post<ApiResponse<Incident>>('/incidents', input);
    return response.data.data!;
}

export async function deleteIncident(id: number): Promise<void> {
    await api.delete(`/incidents/${id}`);
}

export async function updateIncidentPriority(id: number, priority: 'high' | 'medium' | 'low' | null): Promise<Incident> {
    const response = await api.put<ApiResponse<Incident>>(`/incidents/${id}`, { priority });
    return response.data.data!;
}

export async function updateIncidentStatus(
    id: number,
    status: 'complete' | 'incomplete',
    completionNotes?: string
): Promise<Incident> {
    const data: Record<string, unknown> = {
        status,
        completedAt: status === 'complete' ? new Date().toISOString() : null,
        completionNotes: status === 'complete' ? (completionNotes || null) : null,
    };
    const response = await api.put<ApiResponse<Incident>>(`/incidents/${id}`, data);
    return response.data.data!;
}

export async function getIncidentStats(): Promise<IncidentStats> {
    const response = await api.get<ApiResponse<IncidentStats>>('/incidents/stats');
    return response.data.data!;
}

// ============ Upload API ============

export async function uploadEmail(file: File): Promise<Incident> {
    const formData = new FormData();
    formData.append('email', file);

    const response = await api.post<ApiResponse<Incident>>('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data.data!;
}

export async function getSupportedTypes(): Promise<string[]> {
    const response = await api.get<ApiResponse<string[]>>('/upload/types');
    return response.data.data || [];
}

// ============ Summarize API ============

export async function summarizeContent(
    content: string,
    maxLength?: number
): Promise<SummarizationResponse> {
    const response = await api.post<ApiResponse<SummarizationResponse>>('/summarize', {
        content,
        maxLength,
    });
    return response.data.data!;
}

export async function getAIStatus(): Promise<{ available: boolean; providers: string[] }> {
    const response = await api.get<ApiResponse<{ available: boolean; providers: string[] }>>('/summarize/status');
    return response.data.data!;
}

// ============ Health API ============

export async function getHealthStatus(): Promise<HealthCheckResponse> {
    const response = await api.get<ApiResponse<HealthCheckResponse>>('/health');
    return response.data.data!;
}

export default api;
