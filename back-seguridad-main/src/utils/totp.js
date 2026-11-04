import crypto from 'crypto';
import { JWT_SECRET } from '../config/jwt.js';

/**
 * Implementación de Segundo Factor Basado en Tiempo (TOTP — RFC 6238)
 * Genera y verifica códigos dinámicos de 6 dígitos con ventana de 30 segundos
 * empleando HMAC-SHA1 nativo de Node.js.
 */

const obtenerSecretoTOTP = () => {
    const base = process.env.TOTP_SECRET || `${JWT_SECRET}_TOTP_ADMIN`;
    return crypto.createHash('sha256').update(String(base)).digest();
};

/**
 * Genera el código TOTP de 6 dígitos para un contador de ventana de 30s (RFC 6238 / RFC 4226)
 */
export const generarTOTP = (ventana = Math.floor(Date.now() / 1000 / 30)) => {
    const buffer = Buffer.alloc(8);
    buffer.writeBigInt64BE(BigInt(ventana), 0);

    const hmac = crypto.createHmac('sha1', obtenerSecretoTOTP()).update(buffer).digest();
    const offset = hmac[hmac.length - 1] & 0x0f;
    const binario =
        ((hmac[offset] & 0x7f) << 24) |
        ((hmac[offset + 1] & 0xff) << 16) |
        ((hmac[offset + 2] & 0xff) << 8) |
        (hmac[offset + 3] & 0xff);

    const otp = binario % 1000000;
    return String(otp).padStart(6, '0');
};

/**
 * Verifica si un código 2FA coincide con la ventana TOTP actual (±1 ventana por desfase de reloj).
 * En entorno de desarrollo/pruebas locales (NODE_ENV !== 'production') permite además
 * el token de prueba controlado para ejecución de scripts automatizados (Parte 8).
 */
export const verificarCodigo2FA = (codigoIngresado) => {
    if (!codigoIngresado) return false;
    const limpio = String(codigoIngresado).trim();

    const ventanaActual = Math.floor(Date.now() / 1000 / 30);
    for (const delta of [-1, 0, 1]) {
        if (limpio === generarTOTP(ventanaActual + delta)) {
            return true;
        }
    }

    // Solo fuera de producción se acepta el token de prueba para validación automatizada (C-12)
    if (process.env.NODE_ENV !== 'production') {
        const tokenPrueba = process.env.DEV_2FA_TOKEN || '2FA-AUTH-OK';
        if (limpio === tokenPrueba) return true;
    }

    return false;
};

