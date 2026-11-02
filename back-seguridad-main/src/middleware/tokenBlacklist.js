// Almacén en memoria de tokens JWT revocados tras logout
const revokedTokens = new Map();

/**
 * Revoca un token JWT agregándolo a la lista negra con su expiración
 * @param {string} token 
 * @param {number} [expiresInSeconds=86400] 
 */
export const revokeToken = (token, expiresInSeconds = 86400) => {
    if (!token) return;
    const expiresAt = Date.now() + (expiresInSeconds * 1000);
    revokedTokens.set(token, expiresAt);
};

/**
 * Comprueba si un token ha sido revocado
 * @param {string} token 
 * @returns {boolean}
 */
export const isTokenRevoked = (token) => {
    if (!token) return false;
    const expiresAt = revokedTokens.get(token);
    if (!expiresAt) return false;
    if (Date.now() > expiresAt) {
        revokedTokens.delete(token);
        return false;
    }
    return true;
};

// Limpieza periódica cada 15 minutos
setInterval(() => {
    const now = Date.now();
    for (const [token, exp] of revokedTokens.entries()) {
        if (now > exp) {
            revokedTokens.delete(token);
        }
    }
}, 15 * 60 * 1000).unref();

