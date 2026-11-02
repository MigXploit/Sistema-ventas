import { Router } from 'express';
import { validate } from '../middleware/validatorMiddleware.js';
import { productoRules } from '../validators/productValidators.js'
import { getProductos, crearProducto, editarProducto, eliminarProducto, reactivarProducto } from '../controllers/productController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';
import { generarImagenesVacias } from '../utils/imageGenerator.js';

const router = Router();

// Endpoint público para obtener productos (tanto catálogo como gestión)
router.get('/', getProductos);

// Endpoint temporal para forzar la sincronización de imágenes
router.get('/sync-images', verifyToken, isAdmin, async (req, res) => {
    try {
        await generarImagenesVacias();
        res.json({ ok: true, message: 'Imágenes sincronizadas con éxito' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoints protegidos para administración de productos
router.post('/', verifyToken, isAdmin, productoRules, validate, crearProducto);

router.put('/:id', verifyToken, isAdmin, productoRules, validate, editarProducto);

router.delete('/:id', verifyToken, isAdmin, eliminarProducto);
router.post('/:id/reactivar', verifyToken, isAdmin, reactivarProducto);

export default router;
