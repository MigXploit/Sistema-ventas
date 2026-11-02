import { validationResult } from 'express-validator';

export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Devolvemos el primer error encontrado
        return res.status(400).json({ error: errors.array()[0].msg });
    }
    next();
};

// Lista negra de contraseñas más comunes de diccionarios (según análisis de ciberseguridad / PDF SEG-244)
const DICCIONARIO_CONTRASENAS_COMUNES = new Set([
    '123456', '123456789', 'password', 'contraseña', 'qwerty', '12345678',
    '111111', '123123', 'admin123', 'admin', 'administrator', 'root',
    'yasumi', 'yasumi123', 'floreria', 'regalos', 'ventas', 'seguridad',
    'welcome', 'login', 'master', 'iloveyou', 'abc123', 'monkey', 'dragon'
]);

/**
 * Verifica si la contraseña está en la lista de términos comunes de diccionario
 */
export const esContrasenaDiccionario = (password) => {
    if (!password) return true;
    const normalizada = password.toLowerCase().trim();
    if (DICCIONARIO_CONTRASENAS_COMUNES.has(normalizada)) {
        return true;
    }
    // Patrones repetitivos (ej. 'aaaaaa', '111111')
    if (/^(.)\1+$/.test(normalizada)) {
        return true;
    }
    return false;
};

export const evaluarFortaleza = (password) => {
    if (!password) return 'debil';

    // Si coincide con una palabra común de diccionario, se clasifica como débil inmediatamente
    if (esContrasenaDiccionario(password)) {
        return 'debil';
    }

    const tieneMayus = /[A-Z]/.test(password);
    const tieneMinus = /[a-z]/.test(password);
    const tieneNum   = /[0-9]/.test(password);
    const tieneSimb  = /[^A-Za-z0-9]/.test(password);
    const longitud   = password.length;

    if (longitud < 6 || (!tieneNum && !tieneSimb)) return 'debil';
    if (longitud >= 12 && tieneMayus && tieneMinus && tieneNum && tieneSimb) return 'fuerte';
    return 'media';
};
