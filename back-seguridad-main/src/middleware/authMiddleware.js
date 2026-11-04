import jwt from 'jsonwebtoken';
import { mapRolToFrontend } from '../utils/roles.js';
import { JWT_SECRET } from '../config/jwt.js';
import { pool } from '../config/db.js';
import { isTokenRevoked } from './tokenBlacklist.js';
import { registrarAcceso } from '../services/logService.js';

export const verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ error: 'Acceso denegado. No se proporcionó token.' });
    }

    // C-06: Validar si el token fue revocado en logout
    if (isTokenRevoked(token)) {
        return res.status(401).json({ error: 'Token revocado por cierre de sesión. Inicie sesión nuevamente.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // Soporte para identidad efímera de invitado (sin fila en BD, bloqueada luego en isAdmin con 403)
        if (decoded.rol === 'invitado') {
            req.user = { ...decoded, rolBD: 'Invitado', activo: true };
            return next();
        }

        // C-05: Validar en tiempo real que el usuario siga existiendo y esté ACTIVO en la BD
        const { rows } = await pool.query(
            'SELECT activo, rol FROM usuario WHERE id_usuario = $1',
            [decoded.id]
        );

        if (rows.length === 0 || !rows[0].activo) {
            return res.status(401).json({ error: 'Sesión no válida o cuenta desactivada.' });
        }

        req.user = {
            ...decoded,
            rol: mapRolToFrontend(rows[0].rol),
            rolBD: rows[0].rol,
            activo: rows[0].activo
        };

        // C-21 / R8.3: Registrar cada acción ejecutada por la cuenta de emergencia break-glass
        if ((decoded.email || '').toLowerCase() === 'emergencia@yasumi.com') {
            try {
                await registrarAcceso(req, decoded.id, `EMERGENCIA_USO: ${req.method} ${req.originalUrl}`);
            } catch { /* continua sin bloquear */ }
        }

        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido o expirado.' });
    }
};

export const isAdmin = async (req, res, next) => {
    if (mapRolToFrontend(req.user?.rol) === 'admin') {
        return next();
    }

    // C-11 y C-18: Registrar en auditoría intento de acceso no autorizado (403 ACCESO_DENEGADO)
    try {
        await registrarAcceso(req, req.user?.id || null, `ACCESO_DENEGADO: ${req.method} ${req.originalUrl} (rol: ${req.user?.rol || 'desconocido'})`);
    } catch (err) {
        console.error('Error registrando auditoría ACCESO_DENEGADO:', err.message);
    }

    return res.status(403).json({ error: 'Acceso denegado. Se requiere permisos de Administrador.' });
};
