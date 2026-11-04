import { pool } from '../config/db.js';
import { getClientIp } from '../utils/helpers.js';

// Registra un evento de auditoría en log_acceso (visible en log_auditoria) con IP y navegador
export const registrarAcceso = async (req, idUsuario, evento) => {
    const ip = getClientIp(req);
    const browser = req.headers?.['user-agent'] || 'Desconocido';
    try {
        return await pool.query(
            `INSERT INTO log_acceso (id_usuario, ip_address, evento, browser) VALUES ($1, $2, $3, $4)`,
            [idUsuario ?? null, ip, evento, browser]
        );
    } catch {
        // Fallback si el esquema local aún mantiene NOT NULL en id_usuario para eventos anónimos/invitados
        return await pool.query(
            `INSERT INTO log_acceso (id_usuario, ip_address, evento, browser) VALUES ($1, $2, $3, $4)`,
            [idUsuario || 1, ip, evento, browser]
        );
    }
};
