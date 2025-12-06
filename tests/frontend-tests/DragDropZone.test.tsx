import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DragDropZone from '../../src/components/DragDropZone';
import * as api from '../../src/utils/api';

// Mock the API
vi.mock('../../src/utils/api', () => ({
    uploadEmail: vi.fn(),
}));

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

const renderWithProviders = (component: React.ReactElement) => {
    const queryClient = createTestQueryClient();
    return render(
        <QueryClientProvider client={queryClient}>
            {component}
        </QueryClientProvider>
    );
};

describe('DragDropZone', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders drag and drop zone', () => {
        renderWithProviders(<DragDropZone />);

        expect(screen.getByText(/drag & drop an email file/i)).toBeInTheDocument();
        expect(screen.getByText(/supported formats/i)).toBeInTheDocument();
    });

    it('shows processing state during upload', async () => {
        (api.uploadEmail as Mock).mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 100))
        );

        renderWithProviders(<DragDropZone />);

        const dropzone = screen.getByText(/drag & drop/i).closest('div');
        const file = new File(['test'], 'test.eml', { type: 'message/rfc822' });

        const dataTransfer = {
            files: [file],
            items: [{ kind: 'file', type: 'message/rfc822', getAsFile: () => file }],
            types: ['Files'],
        };

        fireEvent.drop(dropzone!, { dataTransfer });

        await waitFor(() => {
            expect(screen.getByText(/processing email/i)).toBeInTheDocument();
        });
    });

    it('shows success state after upload', async () => {
        (api.uploadEmail as Mock).mockResolvedValue({
            id: 1,
            subject: 'Test Email',
        });

        renderWithProviders(<DragDropZone />);

        const dropzone = screen.getByText(/drag & drop/i).closest('div');
        const file = new File(['test'], 'test.eml', { type: 'message/rfc822' });

        const dataTransfer = {
            files: [file],
            items: [{ kind: 'file', type: 'message/rfc822', getAsFile: () => file }],
            types: ['Files'],
        };

        fireEvent.drop(dropzone!, { dataTransfer });

        await waitFor(() => {
            expect(screen.getByText(/upload complete/i)).toBeInTheDocument();
        });
    });
});
