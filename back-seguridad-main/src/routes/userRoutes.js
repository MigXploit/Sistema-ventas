import { Router } from 'express';
import { getUsuarios, toggleActivo } from '../controllers/userController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Endpoints protegidos para administración de usuarios
router.get('/', verifyToken, isAdmin, getUsuarios);
router.post('/:id/toggle', verifyToken, isAdmin, toggleActivo);

export default router;
