import { create } from 'zustand';
import type { Incident, IncidentFilters, IncidentStats } from '../utils/types';

interface IncidentState {
    // Data
    incidents: Incident[];
    selectedIncident: Incident | null;
    stats: IncidentStats | null;

    // UI State
    isLoading: boolean;
    isUploading: boolean;
    error: string | null;

    // Filters
    filters: IncidentFilters;

    // Pagination
    page: number;
    limit: number;
    total: number;
    totalPages: number;

    // Actions
    setIncidents: (incidents: Incident[]) => void;
    addIncident: (incident: Incident) => void;
    removeIncident: (id: number) => void;
    setSelectedIncident: (incident: Incident | null) => void;
    setStats: (stats: IncidentStats | null) => void;
    setLoading: (isLoading: boolean) => void;
    setUploading: (isUploading: boolean) => void;
    setError: (error: string | null) => void;
    setFilters: (filters: IncidentFilters) => void;
    clearFilters: () => void;
    setPage: (page: number) => void;
    setPagination: (total: number, totalPages: number) => void;
    reset: () => void;
}

const initialState = {
    incidents: [],
    selectedIncident: null,
    stats: null,
    isLoading: false,
    isUploading: false,
    error: null,
    filters: {},
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
};

export const useIncidentStore = create<IncidentState>((set) => ({
    ...initialState,

    setIncidents: (incidents) => set({ incidents }),

    addIncident: (incident) =>
        set((state) => ({
            incidents: [incident, ...state.incidents],
            total: state.total + 1,
        })),

    removeIncident: (id) =>
        set((state) => ({
            incidents: state.incidents.filter((i) => i.id !== id),
            total: state.total - 1,
        })),

    setSelectedIncident: (selectedIncident) => set({ selectedIncident }),

    setStats: (stats) => set({ stats }),

    setLoading: (isLoading) => set({ isLoading }),

    setUploading: (isUploading) => set({ isUploading }),

    setError: (error) => set({ error }),

    setFilters: (filters) => set({ filters, page: 1 }),

    clearFilters: () => set({ filters: {}, page: 1 }),

    setPage: (page) => set({ page }),

    setPagination: (total, totalPages) => set({ total, totalPages }),

    reset: () => set(initialState),
}));
