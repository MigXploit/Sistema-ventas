/**
 * Middleware de Sanitización y Detección de Payloads Maliciosos (Anti-XSS y Anti-Injection)
 * Inspecciona y limpia recursivamente strings en req.body, req.query y req.params
 */

// Expresiones regulares para detectar e interceptar intentos de XSS y manipulación maliciosa
const XSS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript\s*:/gi,
    /vbscript\s*:/gi,
    /data\s*:\s*text\/html/gi,
    /on(load|error|click|mouseover|focus|blur|change|submit)\s*=/gi,
    /<iframe/gi,
    /<embed/gi,
    /<object/gi
];

// Limpieza recursiva de un string
export const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    let sanitized = str;

    // 1. Eliminar etiquetas de script peligrosas y protocolos javascript:
    for (const pattern of XSS_PATTERNS) {
        sanitized = sanitized.replace(pattern, '');
    }

    // 2. Escapar caracteres HTML básicos en campos de texto libre
    sanitized = sanitized
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    return sanitized.trim();
};

// Recorre recursivamente objetos o arrays para sanitizar todos los campos
const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
        return obj.map(item => (typeof item === 'object' ? sanitizeObject(item) : sanitizeString(item)));
    }

    const clean = {};
    for (const [key, value] of Object.entries(obj)) {
        // No alterar campos especiales como base64 de imágenes o contraseñas
        if (key === 'imagen_base64' || key === 'password') {
            clean[key] = value;
        } else if (typeof value === 'string') {
            clean[key] = sanitizeString(value);
        } else if (typeof value === 'object' && value !== null) {
            clean[key] = sanitizeObject(value);
        } else {
            clean[key] = value;
        }
    }
    return clean;
};

export const sanitizePayload = (req, res, next) => {
    if (req.body) req.body = sanitizeObject(req.body);
    if (req.query) req.query = sanitizeObject(req.query);
    if (req.params) req.params = sanitizeObject(req.params);
    next();
};

