import { pool, withTransaction } from '../config/db.js';

//Devuelve el id_persona de ese email, o null si no existe
export const buscarIdPorEmail = async (email) => {
    const { rows } = await pool.query(
        'SELECT id_persona FROM persona WHERE email = $1',
        [email]
    );
    return rows[0]?.id_persona ?? null;
};

//crea persona + usuario (+ cliente si el rol es 'Clente') en una sola transaccion
export const crearUsuarioCompleto = ({ nombre, paterno = null, materno = null, email, passwordHash, rol }) => 
    withTransaction(async (client) => {
        const { rows } = await client.query(
            'INSERT INTO persona (nombre, paterno, materno, email) VALUES ($1, $2, $3, $4) RETURNING id_persona',
            [nombre, paterno, materno, email]
        );
        const  idPersona = rows[0].id_persona;

        await client.query(
            'INSERT INTO usuario (id_usuario, id_sucursal, password, rol, activo) VALUES ($1, 1, $2, $3, TRUE)',
            [idPersona, passwordHash, rol]
        );

        if (rol === 'Cliente') {
            await client.query(
                'INSERT INTO cliente (id_cliente, telefono, direccion, fecha_nacimiento, activo) VALUES ($1, NULL, NULL, NULL, TRUE)',
                [idPersona]
            );
        }
        
        return idPersona;
    });