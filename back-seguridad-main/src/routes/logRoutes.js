import { Router } from 'express';
import { getAccessLogs } from '../controllers/logController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Endpoint protegido para obtener logs de accesos
router.get('/', verifyToken, isAdmin, getAccessLogs);

export default router;
