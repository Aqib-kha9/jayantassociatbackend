import express from 'express';
import { getAuditStats, createAudit, getAuditHistory } from '../controllers/auditController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, getAuditStats);
router.post('/', protect, createAudit);
router.get('/history', protect, getAuditHistory);

export default router;
