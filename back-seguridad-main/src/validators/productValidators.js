import { body } from 'express-validator';

export const productoRules = [
    body('nombre').notEmpty().withMessage('El nombre del producto es obligatorio'),
    body('precio').isFloat({ min: 0.1 }).withMessage('El precio debe ser un número mayor a 0'),
    body('id_categoria').isInt().withMessage('La categoría es obligatoria y debe ser un ID válido'),
    body('stock').isInt({ min: 0 }).withMessage('El stock debe ser un número entero mayor o igual a 0'),
];