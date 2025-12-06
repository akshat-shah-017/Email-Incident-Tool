import { Router } from 'express';
import { uploadController } from '../controllers';
import { asyncHandler, singleFileUpload } from '../middleware';

const router = Router();

/**
 * Upload Routes
 * 
 * POST /api/upload         - Upload and process email file
 * GET  /api/upload/types   - Get supported file types
 */

// Upload and process email file
router.post(
    '/',
    singleFileUpload,
    asyncHandler(uploadController.uploadEmail.bind(uploadController))
);

// Get supported file types
router.get(
    '/types',
    uploadController.getSupportedTypes.bind(uploadController)
);

export default router;
