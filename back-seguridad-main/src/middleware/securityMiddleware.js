// Middleware de cabeceras de seguridad HTTP (Hardening completo alineado al marco de ciberdefensa)
export const securityHeaders = (req, res, next) => {
    // 1. Ocultar huella del servidor (Anti-Fingerprinting / Anti-Reconnaissance)
    res.removeHeader('X-Powered-By');

    // 2. Prevenir que el navegador interprete archivos con tipos MIME incorrectos (Anti-MIME Sniffing)
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // 3. Prevenir ataques de Clickjacking (Click Fraud / Iframe Embedding)
    res.setHeader('X-Frame-Options', 'DENY');

    // 4. Activar protección XSS en navegadores clásicos
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // 5. Control de fuga de información de origen en enlaces salientes (Anti-Referrer Leaks)
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // 6. Restricción estricta de APIs del hardware en el cliente
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

    // 7. HSTS (HTTP Strict Transport Security): Forzado de HTTPS para mitigar Man-in-the-Middle y SSL Stripping
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

    // 8. Content Security Policy (CSP): Mitigación de XSS y Drive-by Downloads
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; img-src 'self' data: blob: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self'; connect-src 'self' http://localhost:* http://127.0.0.1:*;"
    );

    // 9. Evitar almacenamiento en caché de respuestas sensibles de autenticación
    if (req.path.startsWith('/api/auth') || req.path.startsWith('/api/usuarios') || req.path.startsWith('/api/logs')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }

    next();
};

/**
 * Middleware de Validación de Origen Anti-CSRF (Cross-Site Request Forgery)
 * Verifica que las peticiones que mutan estado provengan de orígenes legítimos autorizados
 */
const ORIGENES_VALIDOS = new Set([
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
]);

export const csrfProtection = (req, res, next) => {
    const metodosMutacionales = ['POST', 'PUT', 'DELETE', 'PATCH'];

    // Solo verificamos peticiones que modifican estado
    if (metodosMutacionales.includes(req.method)) {
        const origin = req.headers['origin'];
        const referer = req.headers['referer'];
        const secFetchSite = req.headers['sec-fetch-site'];

        // Si el navegador reporta un origen cruzado explícito no autorizado
        if (secFetchSite === 'cross-site') {
            return res.status(403).json({ error: 'Petición bloqueada por protección Anti-CSRF (Cross-Site Request Forgery)' });
        }

        // Si viene cabecera Origin, comprobar que coincida con orígenes autorizados
        if (origin && !ORIGENES_VALIDOS.has(origin) && process.env.NODE_ENV === 'production') {
            return res.status(403).json({ error: 'Origen no autorizado para ejecutar esta acción' });
        }
    }

    next();
};

// Almacén en memoria para Rate Limiting con ventana deslizante
class MemoryStore {
    constructor() {
        this.hits = new Map();
        setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }

    cleanup() {
        const now = Date.now();
        for (const [key, record] of this.hits.entries()) {
            if (now > record.resetTime) {
                this.hits.delete(key);
            }
        }
    }

    increment(key, windowMs) {
        const now = Date.now();
        const record = this.hits.get(key);

        if (!record || now > record.resetTime) {
            const newRecord = { count: 1, resetTime: now + windowMs };
            this.hits.set(key, newRecord);
            return { count: 1, resetTime: newRecord.resetTime };
        }

        record.count++;
        return { count: record.count, resetTime: record.resetTime };
    }

    reset(key) {
        this.hits.delete(key);
    }
}

const memoryStore = new MemoryStore();

export const createRateLimiter = ({
    windowMs = 15 * 60 * 1000,
    max = 100,
    message = 'Demasiadas solicitudes desde esta dirección IP. Inténtalo de nuevo más tarde.'
} = {}) => {
    return (req, res, next) => {
        const forwarded = req.headers['x-forwarded-for'];
        const ip = (forwarded ? forwarded.split(',')[0].trim() : req.socket.remoteAddress || '127.0.0.1').replace('::ffff:', '');
        const key = `${req.baseUrl || ''}${req.path}:${ip}`;

        const { count, resetTime } = memoryStore.increment(key, windowMs);
        const retryAfterSeconds = Math.ceil((resetTime - Date.now()) / 1000);

        res.setHeader('RateLimit-Limit', max);
        res.setHeader('RateLimit-Remaining', Math.max(0, max - count));
        res.setHeader('RateLimit-Reset', Math.max(0, retryAfterSeconds));

        if (count > max) {
            res.setHeader('Retry-After', retryAfterSeconds);
            return res.status(429).json({
                error: message,
                retryAfter: `${retryAfterSeconds} segundos`
            });
        }

        next();
    };
};

// Limitador general: máximo 120 peticiones por minuto por IP (Mitigación DoS HTTP Flood)
export const globalLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 120,
    message: 'Límite de solicitudes superado. Disminuye la velocidad de navegación.'
});

// Limitador estricto para rutas de autenticación (Mitigación de Fuerza Bruta y Ataques de Diccionario)
export const authLimiter = createRateLimiter({
    windowMs: 5 * 60 * 1000,
    max: 10,
    message: 'Demasiados intentos fallidos. Bloqueo preventivo por 5 minutos para mitigar ataques de fuerza bruta.'
});

/**
 * C-19 / R7.4: Middleware de Modo Restringido de Emergencia (Continuidad Operativa)
 * Cuando MODO_EMERGENCIA=lectura, el catálogo público continúa operando en modo lectura,
 * mientras las operaciones de mutación devuelven HTTP 503 Service Unavailable.
 */
export const emergencyModeMiddleware = (req, res, next) => {
    const modo = (process.env.MODO_EMERGENCIA || '').toLowerCase().trim();
    if (modo === 'lectura' || modo === 'true' || modo === '1') {
        const metodosEscritura = ['POST', 'PUT', 'DELETE', 'PATCH'];
        if (metodosEscritura.includes(req.method)) {
            return res.status(503).json({
                error: 'Sistema en Modo de Emergencia (Solo Lectura). Las operaciones de escritura están temporalmente suspendidas por contingencia.'
            });
        }
    }
    next();
};
