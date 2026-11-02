import crypto from 'crypto';
import { JWT_SECRET } from '../config/jwt.js';

const CAPTCHA_EXPIRATION_MS = 5 * 60 * 1000; // 5 minutos de validez

/**
 * Genera un nuevo desafío matemático y un token criptográfico HMAC que protege la respuesta
 */
export const generarCaptchaSeguro = () => {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    const answer = a + b;
    const timestamp = Date.now();
    const nonce = crypto.randomBytes(8).toString('hex');

    const payload = `${a}:${b}:${answer}:${timestamp}:${nonce}`;
    const signature = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(payload)
        .digest('hex');

    const token = Buffer.from(JSON.stringify({ payload, signature })).toString('base64');

    return {
        pregunta: `${a} + ${b}`,
        a,
        b,
        token
    };
};

/**
 * Valida la respuesta del usuario contra el token firmado por el servidor (Control C-08)
 * Rechaza operandos fabricados o alterados por el cliente que no correspondan a la firma.
 * @param {Object} params
 * @param {string} params.token - Token criptográfico firmado por el servidor
 * @param {number|string} params.a - Sumando A
 * @param {number|string} params.b - Sumando B
 * @param {number|string} params.input - Respuesta enviada por el usuario
 */
export const validarCaptcha = ({ token, a, b, input }) => {
    if (!token) {
        return { ok: false, error: 'Token de verificación de CAPTCHA ausente. Solicite un desafío válido del servidor.' };
    }

    if (!input || input.toString().trim() === '') {
        return { ok: false, error: 'Debe ingresar la respuesta del CAPTCHA' };
    }

    const inputNumber = parseInt(input, 10);
    if (isNaN(inputNumber)) {
        return { ok: false, error: 'El resultado del CAPTCHA debe ser un número entero' };
    }

    try {
        const decodedStr = Buffer.from(token, 'base64').toString('utf8');
        const { payload, signature } = JSON.parse(decodedStr);

        const expectedSignature = crypto
            .createHmac('sha256', JWT_SECRET)
            .update(payload)
            .digest('hex');

        // Verificar autenticidad e integridad de la firma HMAC
        if (signature !== expectedSignature) {
            return { ok: false, error: 'Desafío de CAPTCHA inválido o firma manipulada.' };
        }

        const [tokenA, tokenB, tokenAnswer, tokenTime] = payload.split(':');
        const timestamp = parseInt(tokenTime, 10);

        // Control C-08: Verificar que los operandos provistos por el cliente coincidan exactamente con el desafío del servidor
        if (a !== undefined && parseInt(a, 10) !== parseInt(tokenA, 10)) {
            return { ok: false, error: 'Operando A fabricado o alterado. No corresponde al desafío emitido por el servidor.' };
        }
        if (b !== undefined && parseInt(b, 10) !== parseInt(tokenB, 10)) {
            return { ok: false, error: 'Operando B fabricado o alterado. No corresponde al desafío emitido por el servidor.' };
        }

        // Validar tiempo de vida (máximo 5 minutos)
        if (Date.now() - timestamp > CAPTCHA_EXPIRATION_MS) {
            return { ok: false, error: 'El CAPTCHA ha expirado. Por favor solicita uno nuevo.' };
        }

        if (inputNumber !== parseInt(tokenAnswer, 10)) {
            return { ok: false, error: 'Resultado del CAPTCHA incorrecto.' };
        }

        return { ok: true };
    } catch {
        return { ok: false, error: 'Estructura del token de CAPTCHA inválida.' };
    }
};
