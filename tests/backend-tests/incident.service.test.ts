import { describe, it, expect, vi, beforeEach } from '@jest/globals';
import { IncidentService } from '../../src/services/incident.service';

// Mock Prisma
const mockPrisma = {
    incident: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
    },
};

vi.mock('../../src/db', () => ({
    prisma: mockPrisma,
}));

// Create service instance
const incidentService = new IncidentService();

describe('IncidentService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('create', () => {
        it('creates a new incident', async () => {
            const input = {
                subject: 'Test Subject',
                senderEmail: 'test@example.com',
                senderName: 'Test User',
                receivedAt: new Date(),
                bodyText: 'Test body',
                summary: 'Test summary',
            };

            const expectedIncident = {
                id: 1,
                ...input,
                loggedAt: new Date(),
                summarized: false,
            };

            mockPrisma.incident.create.mockResolvedValue(expectedIncident);

            const result = await incidentService.create(input);

            expect(mockPrisma.incident.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    subject: input.subject,
                    senderEmail: input.senderEmail,
                }),
            });
            expect(result).toEqual(expectedIncident);
        });
    });

    describe('findById', () => {
        it('returns incident when found', async () => {
            const mockIncident = {
                id: 1,
                subject: 'Test',
                senderEmail: 'test@example.com',
            };

            mockPrisma.incident.findUnique.mockResolvedValue(mockIncident);

            const result = await incidentService.findById(1);

            expect(mockPrisma.incident.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(result).toEqual(mockIncident);
        });

        it('throws NotFoundError when not found', async () => {
            mockPrisma.incident.findUnique.mockResolvedValue(null);

            await expect(incidentService.findById(999)).rejects.toThrow();
        });
    });

    describe('findAll', () => {
        it('returns paginated incidents', async () => {
            const mockIncidents = [
                { id: 1, subject: 'Test 1' },
                { id: 2, subject: 'Test 2' },
            ];

            mockPrisma.incident.findMany.mockResolvedValue(mockIncidents);
            mockPrisma.incident.count.mockResolvedValue(2);

            const result = await incidentService.findAll(1, 20);

            expect(result.incidents).toEqual(mockIncidents);
            expect(result.meta.total).toBe(2);
            expect(result.meta.page).toBe(1);
        });

        it('applies search filter', async () => {
            mockPrisma.incident.findMany.mockResolvedValue([]);
            mockPrisma.incident.count.mockResolvedValue(0);

            await incidentService.findAll(1, 20, { search: 'urgent' });

            expect(mockPrisma.incident.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        OR: expect.any(Array),
                    }),
                })
            );
        });
    });

    describe('delete', () => {
        it('deletes an incident', async () => {
            const mockIncident = { id: 1, subject: 'Test' };
            mockPrisma.incident.findUnique.mockResolvedValue(mockIncident);
            mockPrisma.incident.delete.mockResolvedValue(mockIncident);

            await incidentService.delete(1);

            expect(mockPrisma.incident.delete).toHaveBeenCalledWith({
                where: { id: 1 },
            });
        });
    });
});
