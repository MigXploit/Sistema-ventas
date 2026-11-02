import { Router } from 'express';
import { getUsuarios, toggleActivo, cambiarRol } from '../controllers/userController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Endpoints protegidos para administración de usuarios
router.get('/', verifyToken, isAdmin, getUsuarios);
router.post('/:id/toggle', verifyToken, isAdmin, toggleActivo);
router.put('/:id/rol', verifyToken, isAdmin, cambiarRol); // C-12

export default router;
