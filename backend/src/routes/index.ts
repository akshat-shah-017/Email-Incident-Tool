import { Router } from 'express';
import incidentRoutes from './incident.routes';
import uploadRoutes from './upload.routes';
import summarizeRoutes from './summarize.routes';
import healthRoutes from './health.routes';

const router = Router();

// Mount route modules
router.use('/incidents', incidentRoutes);
router.use('/upload', uploadRoutes);
router.use('/summarize', summarizeRoutes);
router.use('/health', healthRoutes);

export default router;
