import { Router } from 'express';
import { getCategorias } from '../controllers/categoryController.js';

const router = Router();

router.get('/', getCategorias);

export default router;
