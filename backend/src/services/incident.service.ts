import { Prisma, Incident } from '@prisma/client';
import { prisma } from '../db';
import {
    CreateIncidentInput,
    UpdateIncidentInput,
    IncidentFilters,
    IncidentListResponse,
    PaginationMeta
} from '../models/types';
import { logger, NotFoundError, DatabaseError, getPaginationMeta } from '../utils';

/**
 * Incident Service
 * Handles CRUD operations for incident records
 */
export class IncidentService {
    /**
     * Create a new incident record
     */
    async create(input: CreateIncidentInput): Promise<Incident> {
        try {
            const incident = await prisma.incident.create({
                data: {
                    subject: input.subject,
                    senderName: input.senderName,
                    senderEmail: input.senderEmail,
                    receivedAt: new Date(input.receivedAt),
                    summary: input.summary,
                    bodyText: input.bodyText,
                    rawEml: input.rawEml,
                    fileName: input.fileName,
                    fileType: input.fileType,
                    summarized: input.summarized ?? false,
                    errorMessage: input.errorMessage,
                },
            });

            logger.info(`Created incident #${incident.id}: ${incident.subject}`);
            return incident;
        } catch (error) {
            logger.error('Failed to create incident:', error);
            throw new DatabaseError('Failed to create incident record');
        }
    }

    /**
     * Get all incidents with pagination and filtering
     */
    async findAll(
        page: number = 1,
        limit: number = 20,
        filters?: IncidentFilters
    ): Promise<IncidentListResponse> {
        const skip = (page - 1) * limit;

        // Build where clause based on filters
        const where: Prisma.IncidentWhereInput = {};

        if (filters?.search) {
            where.OR = [
                { subject: { contains: filters.search, mode: 'insensitive' } },
                { senderEmail: { contains: filters.search, mode: 'insensitive' } },
                { senderName: { contains: filters.search, mode: 'insensitive' } },
                { summary: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        if (filters?.senderEmail) {
            where.senderEmail = { contains: filters.senderEmail, mode: 'insensitive' };
        }

        if (filters?.subject) {
            where.subject = { contains: filters.subject, mode: 'insensitive' };
        }

        if (filters?.incidentId) {
            const id = parseInt(filters.incidentId, 10);
            if (!isNaN(id)) {
                where.id = id;
            }
        }

        if (filters?.startDate || filters?.endDate) {
            where.receivedAt = {};
            if (filters?.startDate) {
                where.receivedAt.gte = new Date(filters.startDate);
            }
            if (filters?.endDate) {
                where.receivedAt.lte = new Date(filters.endDate);
            }
        }

        // Priority filtering
        if (filters?.priority) {
            if (filters.priority === 'assigned') {
                where.priority = { not: null };
            } else if (filters.priority === 'unassigned') {
                where.priority = null;
            } else {
                where.priority = filters.priority;
            }
        }

        // Status filtering
        if (filters?.status) {
            where.status = filters.status;
        }

        // Determine sort order
        let orderBy: Prisma.IncidentOrderByWithRelationInput[] = [{ loggedAt: 'desc' }];
        if (filters?.sortBy === 'priority') {
            // Sort by priority: high -> medium -> low -> null (unassigned)
            orderBy = [
                { priority: { sort: 'asc', nulls: 'last' } },
                { loggedAt: 'desc' },
            ];
        }

        try {
            const [incidents, total] = await Promise.all([
                prisma.incident.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy,
                }),
                prisma.incident.count({ where }),
            ]);

            const meta = getPaginationMeta(page, limit, total);

            return { incidents, meta };
        } catch (error) {
            logger.error('Failed to fetch incidents:', error);
            throw new DatabaseError('Failed to fetch incidents');
        }
    }

    /**
     * Get a single incident by ID
     */
    async findById(id: number): Promise<Incident> {
        try {
            const incident = await prisma.incident.findUnique({
                where: { id },
            });

            if (!incident) {
                throw new NotFoundError(`Incident #${id}`);
            }

            return incident;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            logger.error(`Failed to fetch incident #${id}:`, error);
            throw new DatabaseError('Failed to fetch incident');
        }
    }

    /**
     * Update an incident
     */
    async update(id: number, input: UpdateIncidentInput): Promise<Incident> {
        try {
            // Check if incident exists
            await this.findById(id);

            const updateData: Prisma.IncidentUpdateInput = {};

            if (input.subject !== undefined) updateData.subject = input.subject;
            if (input.senderName !== undefined) updateData.senderName = input.senderName;
            if (input.senderEmail !== undefined) updateData.senderEmail = input.senderEmail;
            if (input.receivedAt !== undefined) updateData.receivedAt = new Date(input.receivedAt);
            if (input.summary !== undefined) updateData.summary = input.summary;
            if (input.bodyText !== undefined) updateData.bodyText = input.bodyText;
            if (input.summarized !== undefined) updateData.summarized = input.summarized;
            if (input.errorMessage !== undefined) updateData.errorMessage = input.errorMessage;
            if (input.priority !== undefined) updateData.priority = input.priority;
            if (input.status !== undefined) updateData.status = input.status;
            if (input.completedAt !== undefined) updateData.completedAt = input.completedAt ? new Date(input.completedAt) : null;
            if (input.completionNotes !== undefined) updateData.completionNotes = input.completionNotes;

            const incident = await prisma.incident.update({
                where: { id },
                data: updateData,
            });

            logger.info(`Updated incident #${incident.id}`);
            return incident;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            logger.error(`Failed to update incident #${id}:`, error);
            throw new DatabaseError('Failed to update incident');
        }
    }

    /**
     * Delete an incident
     */
    async delete(id: number): Promise<void> {
        try {
            await this.findById(id);
            await prisma.incident.delete({ where: { id } });
            logger.info(`Deleted incident #${id}`);
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            logger.error(`Failed to delete incident #${id}:`, error);
            throw new DatabaseError('Failed to delete incident');
        }
    }

    /**
     * Get incident statistics
     */
    async getStats(): Promise<{
        total: number;
        summarized: number;
        unsummarized: number;
        todayCount: number;
    }> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        try {
            const [total, summarized, todayCount] = await Promise.all([
                prisma.incident.count(),
                prisma.incident.count({ where: { summarized: true } }),
                prisma.incident.count({
                    where: { loggedAt: { gte: today } },
                }),
            ]);

            return {
                total,
                summarized,
                unsummarized: total - summarized,
                todayCount,
            };
        } catch (error) {
            logger.error('Failed to fetch incident stats:', error);
            throw new DatabaseError('Failed to fetch incident statistics');
        }
    }
}

// Export singleton instance
export const incidentService = new IncidentService();
