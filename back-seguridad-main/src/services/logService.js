import { pool } from '../config/db.js';
import { getClientIp } from '../utils/helpers.js';

//guarda un evento de acceso ('Ingreso' o 'Salida' ) con IP y navegador
export const registrarAcceso = (req, idUsuario, evento) =>
    pool.query(
        `INSERT INTO log_acceso (id_usuario, ip_address, evento, browser) VALUES ($1, $2, $3, $4)`,
        [idUsuario, getClientIp(req), evento, req.headers['user-agent'] || 'Desconocido']
    );  