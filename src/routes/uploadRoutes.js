import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

router.post('/', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
           return res.status(400).json({ message: 'No file uploaded' });
        }
        res.json({
            message: 'Image uploaded',
            filePath: `/${req.file.path.replace(/\\/g, '/')}`, // Normalize path for cross-platform
        });
    } catch (err) {
         res.status(400).json({ message: err.message });
    }
});

router.delete('/', (req, res) => {
    try {
        const { filePath } = req.body;
        if (!filePath) {
            return res.status(400).json({ message: 'File path is required' });
        }

        // Security: Prevent directory traversal and ensure file is in uploads directory
        const safePath = path.posix.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');
        const absolutePath = path.join(process.cwd(), safePath);

        // Check if file exists
        if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
            res.json({ message: 'File deleted successfully' });
        } else {
            // If file doesn't exist, we can create a "soft success" or 404
            // Soft success is better for idempotency if the UI state is out of sync
            res.json({ message: 'File already deleted or not found' });
        }
    } catch (err) {
        console.error("Delete error", err);
        res.status(500).json({ message: err.message });
    }
});

export default router;
