import { pool } from '../config/db.js';
import { manejarErrores } from '../utils/helpers.js';

export const getCategorias = manejarErrores(
    'Error al obtener categorías de la base de datos',
    async (req, res) => {
        const { rows } = await pool.query(
            `SELECT id_categoria AS id, nombre, descripcion, imagen_url, activo
             FROM categoria
             WHERE activo = TRUE`
        );
        res.json(rows);
    }
);