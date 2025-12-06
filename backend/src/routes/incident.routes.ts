import { Router } from 'express';
import { incidentController } from '../controllers';
import {
    asyncHandler,
    validate,
    idParamSchema,
    incidentFiltersSchema,
    createIncidentSchema,
    updateIncidentSchema
} from '../middleware';

const router = Router();

/**
 * Incident Routes
 * 
 * GET    /api/incidents       - Get all incidents with filters
 * GET    /api/incidents/stats - Get incident statistics
 * GET    /api/incidents/:id   - Get single incident
 * POST   /api/incidents       - Create new incident
 * PUT    /api/incidents/:id   - Update incident
 * DELETE /api/incidents/:id   - Delete incident
 */

// Get incident statistics (must be before /:id route)
router.get(
    '/stats',
    asyncHandler(incidentController.getStats.bind(incidentController))
);

// Get all incidents with pagination and filtering
router.get(
    '/',
    validate({ query: incidentFiltersSchema }),
    asyncHandler(incidentController.getAll.bind(incidentController))
);

// Get single incident by ID
router.get(
    '/:id',
    validate({ params: idParamSchema }),
    asyncHandler(incidentController.getById.bind(incidentController))
);

// Create new incident
router.post(
    '/',
    validate({ body: createIncidentSchema }),
    asyncHandler(incidentController.create.bind(incidentController))
);

// Update incident
router.put(
    '/:id',
    validate({ params: idParamSchema, body: updateIncidentSchema }),
    asyncHandler(incidentController.update.bind(incidentController))
);

// Delete incident
router.delete(
    '/:id',
    validate({ params: idParamSchema }),
    asyncHandler(incidentController.delete.bind(incidentController))
);

export default router;
