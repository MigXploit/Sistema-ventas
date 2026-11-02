import './env.js';

if (!process.env.JWT_SECRET) {
    throw new Error('Falta la variable de entorno JWT_SECRET. Defínela en el archivo .env');
}

export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';