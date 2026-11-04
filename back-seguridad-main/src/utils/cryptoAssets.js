import crypto from 'crypto';
import { JWT_SECRET } from '../config/jwt.js';

/**
 * Criptosistema Simétrico Autenticado AES-256-GCM (NIST SP 800-38D)
 * Diseñado para encriptar y desencriptar activos críticos sensibles de negocio
 * (direcciones de entrega, números telefónicos, referencias de comprobantes).
 * 
 * NOTA DE SEGURIDAD (Política 2 y Política 4):
 * - Las contraseñas de usuario NUNCA utilizan cifrado reversible; usan exclusivamente
 *   derivación de claves unidireccional con sal aleatoria (Bcrypt factor >= 10).
 * - Los demás activos críticos que requieren ser leídos por roles autorizados
 *   (Administrador / Vendedor a cargo) utilizan este criptosistema AES-256-GCM.
 */

const ALGORITMO = 'aes-256-gcm';

const obtenerClaveMaestra = () => {
    const semilla = process.env.DATA_ENCRYPTION_KEY || JWT_SECRET || 'yasumi_default_master_key_2026';
    return crypto.createHash('sha256').update(String(semilla)).digest(); // 32 bytes (256 bits)
};

/**
 * Encripta un activo crítico en texto plano empleando AES-256-GCM con IV aleatorio de 96 bits.
 * @param {string} textoPlano - Dato sensible a proteger en reposo
 * @returns {string|null} Payload en formato iv_hex:authTag_hex:ciphertext_hex
 */
export const encriptarActivoCritico = (textoPlano) => {
    if (textoPlano === null || textoPlano === undefined || textoPlano === '') return null;
    const iv = crypto.randomBytes(12); // 96 bits recomendado por NIST para GCM
    const clave = obtenerClaveMaestra();
    const cipher = crypto.createCipheriv(ALGORITMO, clave, iv);

    let cifrado = cipher.update(String(textoPlano), 'utf8', 'hex');
    cifrado += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex'); // Etiqueta de integridad de 128 bits

    return `${iv.toString('hex')}:${authTag}:${cifrado}`;
};

/**
 * Desencripta un activo crítico previamente cifrado con AES-256-GCM y verifica su integridad.
 * @param {string} payloadCifrado - Cadena iv_hex:authTag_hex:ciphertext_hex
 * @returns {string|null} Texto original desencriptado
 */
export const desencriptarActivoCritico = (payloadCifrado) => {
    if (!payloadCifrado || typeof payloadCifrado !== 'string' || !payloadCifrado.includes(':')) {
        return payloadCifrado;
    }
    const partes = payloadCifrado.split(':');
    if (partes.length !== 3) return payloadCifrado;

    const [ivHex, authTagHex, cifradoHex] = partes;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const clave = obtenerClaveMaestra();

    const decipher = crypto.createDecipheriv(ALGORITMO, clave, iv);
    decipher.setAuthTag(authTag);

    let textoPlano = decipher.update(cifradoHex, 'hex', 'utf8');
    textoPlano += decipher.final('utf8');
    return textoPlano;
};
