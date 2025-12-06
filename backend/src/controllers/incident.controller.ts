import { Request, Response } from 'express';
import { incidentService } from '../services';
import { ApiResponse, IncidentFilters, CreateIncidentInput, UpdateIncidentInput } from '../models/types';
import { Incident } from '@prisma/client';
import { logger } from '../utils';

/**
 * Incident Controller
 * Handles HTTP requests for incident CRUD operations
 */
export class IncidentController {
    /**
     * GET /api/incidents
     * Get all incidents with pagination and filtering
     */
    async getAll(req: Request, res: Response): Promise<void> {
        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = Math.min(parseInt(req.query.limit as string, 10) || 20, 100);

        const filters: IncidentFilters = {
            search: req.query.search as string,
            senderEmail: req.query.senderEmail as string,
            subject: req.query.subject as string,
            startDate: req.query.startDate as string,
            endDate: req.query.endDate as string,
            incidentId: req.query.incidentId as string,
            priority: req.query.priority as 'high' | 'medium' | 'low' | 'assigned' | 'unassigned',
            sortBy: req.query.sortBy as 'date' | 'priority',
            status: req.query.status as 'complete' | 'incomplete',
        };

        const result = await incidentService.findAll(page, limit, filters);

        const response: ApiResponse<Incident[]> = {
            status: 'success',
            data: result.incidents,
            meta: result.meta,
        };

        res.json(response);
    }

    /**
     * GET /api/incidents/:id
     * Get a single incident by ID
     */
    async getById(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id, 10);
        const incident = await incidentService.findById(id);

        const response: ApiResponse<Incident> = {
            status: 'success',
            data: incident,
        };

        res.json(response);
    }

    /**
     * POST /api/incidents
     * Create a new incident
     */
    async create(req: Request, res: Response): Promise<void> {
        const input: CreateIncidentInput = req.body;
        const incident = await incidentService.create(input);

        const response: ApiResponse<Incident> = {
            status: 'success',
            data: incident,
            message: `Incident #${incident.id} created successfully`,
        };

        res.status(201).json(response);
    }

    /**
     * PUT /api/incidents/:id
     * Update an existing incident
     */
    async update(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id, 10);
        const input: UpdateIncidentInput = req.body;
        const incident = await incidentService.update(id, input);

        const response: ApiResponse<Incident> = {
            status: 'success',
            data: incident,
            message: `Incident #${incident.id} updated successfully`,
        };

        res.json(response);
    }

    /**
     * DELETE /api/incidents/:id
     * Delete an incident
     */
    async delete(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id, 10);
        await incidentService.delete(id);

        const response: ApiResponse = {
            status: 'success',
            message: `Incident #${id} deleted successfully`,
        };

        res.json(response);
    }

    /**
     * GET /api/incidents/stats
     * Get incident statistics
     */
    async getStats(req: Request, res: Response): Promise<void> {
        const stats = await incidentService.getStats();

        const response: ApiResponse<typeof stats> = {
            status: 'success',
            data: stats,
        };

        res.json(response);
    }
}

// Export singleton instance
export const incidentController = new IncidentController();
