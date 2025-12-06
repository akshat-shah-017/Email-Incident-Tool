import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';
import { ValidationError } from '../utils/errors';

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, config.uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = `${uuidv4()}${ext}`;
        cb(null, uniqueName);
    },
});

// Configure memory storage for processing
const memoryStorage = multer.memoryStorage();

// File filter
const fileFilter = (
    req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (config.allowedFileTypes.includes(ext)) {
        cb(null, true);
    } else {
        cb(new ValidationError(
            `Invalid file type. Allowed types: ${config.allowedFileTypes.join(', ')}`
        ));
    }
};

// Create multer instances
export const uploadToDisk = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: config.maxFileSizeMB * 1024 * 1024,
    },
});

export const uploadToMemory = multer({
    storage: memoryStorage,
    fileFilter,
    limits: {
        fileSize: config.maxFileSizeMB * 1024 * 1024,
    },
});

// Export middleware for single file upload
export const singleFileUpload = uploadToMemory.single('email');
export const singleFileToDisk = uploadToDisk.single('email');
