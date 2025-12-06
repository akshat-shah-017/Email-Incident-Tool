import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import IncidentTable from '../../src/components/IncidentTable';
import type { Incident, PaginationMeta } from '../../src/utils/types';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

const mockIncidents: Incident[] = [
    {
        id: 1,
        subject: 'Test Email Subject',
        senderName: 'John Doe',
        senderEmail: 'john@example.com',
        receivedAt: '2024-12-06T10:00:00Z',
        loggedAt: '2024-12-06T10:30:00Z',
        summary: 'This is a test summary',
        bodyText: 'Full email body text',
        rawEml: null,
        fileName: 'test.eml',
        fileType: '.eml',
        summarized: true,
        errorMessage: null,
    },
    {
        id: 2,
        subject: 'Another Email',
        senderName: null,
        senderEmail: 'jane@example.com',
        receivedAt: '2024-12-05T08:00:00Z',
        loggedAt: '2024-12-05T08:15:00Z',
        summary: null,
        bodyText: 'Another email body',
        rawEml: null,
        fileName: 'another.msg',
        fileType: '.msg',
        summarized: false,
        errorMessage: 'AI service unavailable',
    },
];

const mockPagination: PaginationMeta = {
    page: 1,
    limit: 20,
    total: 2,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
};

const renderWithProviders = (component: React.ReactElement) => {
    const queryClient = createTestQueryClient();
    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter>{component}</MemoryRouter>
        </QueryClientProvider>
    );
};

describe('IncidentTable', () => {
    it('renders loading state', () => {
        renderWithProviders(
            <IncidentTable
                incidents={[]}
                isLoading={true}
                pagination={null}
                onPageChange={() => { }}
            />
        );

        expect(screen.getByText(/loading incidents/i)).toBeInTheDocument();
    });

    it('renders empty state when no incidents', () => {
        renderWithProviders(
            <IncidentTable
                incidents={[]}
                isLoading={false}
                pagination={null}
                onPageChange={() => { }}
            />
        );

        expect(screen.getByText(/no incidents found/i)).toBeInTheDocument();
    });

    it('renders incidents in table', () => {
        renderWithProviders(
            <IncidentTable
                incidents={mockIncidents}
                isLoading={false}
                pagination={mockPagination}
                onPageChange={() => { }}
            />
        );

        expect(screen.getByText('#1')).toBeInTheDocument();
        expect(screen.getByText('#2')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Test Email Subject')).toBeInTheDocument();
        expect(screen.getByText('Summarized')).toBeInTheDocument();
        expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('shows sender email when name is null', () => {
        renderWithProviders(
            <IncidentTable
                incidents={mockIncidents}
                isLoading={false}
                pagination={mockPagination}
                onPageChange={() => { }}
            />
        );

        expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });
});
