import { Router } from 'express';
import { validate } from '../middleware/validatorMiddleware.js';
import { loginRules, registroRules } from '../validators/authValidators.js';
import { login, logout, register, loginInvitado, obtenerCaptcha } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/securityMiddleware.js';

const router = Router();

// Endpoint público para obtener un desafío CAPTCHA firmado criptográficamente
router.get('/captcha', obtenerCaptcha);

// Endpoints con protección de Rate Limiting contra ataques de fuerza bruta y credential stuffing
router.post('/login', authLimiter, loginRules, validate, login);
router.post('/registro', authLimiter, registroRules, validate, register);
router.post('/invitado', authLimiter, loginInvitado);

// Endpoint autenticado
router.post('/logout', verifyToken, logout);

export default router;
