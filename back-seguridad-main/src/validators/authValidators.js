import { body } from 'express-validator';

export const loginRules = [
    body('email').isEmail().normalizeEmail().withMessage('Debe ingresar un correo electrónico válido'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria'),
    body('captchaInput').notEmpty().withMessage('Debe resolver el CAPTCHA')
];

export const registroRules = [
    body('nombre').trim().isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres'),
    body('email').isEmail().normalizeEmail().withMessage('Debe ingresar un correo electrónico válido'),
    body('password').isLength({ min: 6, max: 128 }).withMessage('La contraseña debe tener entre 6 y 128 caracteres'),
    body('rol').optional().isIn(['admin', 'vendedor', 'cliente', 'Administrador', 'Atención al Cliente', 'Cliente']).withMessage('Rol no permitido')
];
