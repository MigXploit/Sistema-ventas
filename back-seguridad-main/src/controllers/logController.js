import { pool } from "../config/db.js";
import { nombreCompleto, manejarErrores } from "../utils/helpers.js";

export const getAccessLogs = manejarErrores(
    'Error al obtener logs de acceso del servidor',
    async (req, res) => {
        const { rows } = await pool.query(
            `SELECT l.id_log AS id, l.ip_address AS ip, l.evento, l.browser, l.fecha_hora,
                p.nombre, p.paterno, p.materno
            FROM log_acceso l
            JOIN persona p ON l.id_usuario = p.id_persona
            ORDER BY l.fecha_hora DESC
            LIMIT 150`
        );
        const logs = rows.map(l=> ({
            id: l.id,
            usuario: nombreCompleto({ nombre: l.nombre, paterno: l.paterno }),
            ip: l.ip || '127.0.0.1',
            evento: l.evento,
            browser: l.browser || 'Desconocido',
            fechaHora: new Date(l.fecha_hora).toLocaleString('es-BO')
        }));

        res.json(logs);
    }
);