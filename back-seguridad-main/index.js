import './src/config/env.js';
import express from 'express';
import cors from 'cors';
import { pool } from './src/config/db.js';

// Middlewares de seguridad avanzados (Alineados al catálogo de ciberdefensa)
import { securityHeaders, globalLimiter, csrfProtection } from './src/middleware/securityMiddleware.js';
import { sanitizePayload } from './src/middleware/sanitizeMiddleware.js';

// Importación de rutas
import { generarImagenesVacias } from './src/utils/imageGenerator.js';
import authRoutes from './src/routes/authRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import categoryRoutes from './src/routes/categoryRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import logRoutes from './src/routes/logRoutes.js';

const app = express();

// 1. Ocultar huella digital del framework (Anti-Reconnaissance / Fingerprinting)
app.disable('x-powered-by');

// 2. Cabeceras de seguridad HTTP (X-Frame-Options, CSP, HSTS, nosniff, anti-clickjacking)
app.use(securityHeaders);

// 3. Rate limiting global contra ataques de denegación de servicio (DoS / HTTP Flood)
app.use(globalLimiter);

// 4. Configuración estricta de CORS con lista blanca de orígenes
const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        return callback(new Error('Bloqueado por política CORS de seguridad'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-2FA-Token']
}));

// 5. Protección Anti-CSRF (Cross-Site Request Forgery)
app.use(csrfProtection);

// 6. Body parser con límite controlado (previene Memory Exhaustion DoS)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 7. Sanitización automática de payloads (Anti-XSS y Anti-Code Injection)
app.use(sanitizePayload);

// 8. Registro de Rutas
app.use('/api/auth', authRoutes);
app.use('/api/productos', productRoutes);
app.use('/api/categorias', categoryRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/usuarios', userRoutes); // Alias para soporte de especificación C-12 (PUT /usuarios/:id/rol)
app.use('/api/logs', logRoutes);

// Ruta de ping para comprobar salud y base de datos (con mitigación de information disclosure)
app.get('/ping', async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT 'Pong! Conexión exitosa a bd_yasumi' AS mensaje");
        res.json(rows[0]);
    } catch (error) {
        console.error('Error en healthcheck /ping:', error.message);
        res.status(500).json({ error: 'Error interno: no se pudo verificar la conexión con la base de datos' });
    }
});

// Manejo de rutas no encontradas 404
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada en el servidor' });
});

// Manejador global de errores (evita fugas de traza de pila en la respuesta HTTP)
app.use((err, req, res, next) => {
    console.error('[Error Global no controlado]:', err.stack || err.message);
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' 
            ? 'Ocurrió un error interno en el servidor' 
            : (err.message || 'Error interno')
    });
});

// Inicialización del servidor HTTP con configuración de Timeouts contra ataques lentos (Slowloris / RUDY DoS)
const PORT = process.env.PORT || 3002;
const server = app.listen(PORT, '0.0.0.0', async () => {
    console.log(`[Yasumi Backend] Servidor activo y blindado en http://localhost:${PORT}`);
    await generarImagenesVacias();
});

// Mitigación de Slowloris: cerrar conexiones inactivas o con cabeceras incompletas
server.headersTimeout = 10000;   // 10 segundos para recibir cabeceras completas
server.requestTimeout = 30000;   // 30 segundos máximo para procesar la petición
server.keepAliveTimeout = 5000;  // 5 segundos de inactividad antes de cerrar socket TCP
