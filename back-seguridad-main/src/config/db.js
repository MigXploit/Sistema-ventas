import pg from 'pg';
import './env.js';

const { Pool } = pg;

export const pool = new Pool({
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT) || 5432,
    user:     process.env.DB_USER     || 'yasumi_user',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME     || 'bd_yasumi',
});

// Ejecuta `callback(client)` dentro de una transacción: COMMIT si sale bien, ROLLBACK si falla
export const withTransaction = async (callback) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};