/**
 * Módulo de Criptografía Bidireccional: Cifrado de Vigenère sobre Alfabeto ASCII
 * 
 * Arquitectura Criptográfica en Yasumi Venta:
 * 1. ALGORITMO UNIDIRECCIONAL (Datos que NO se muestran: contraseñas):
 *    - Se utiliza exclusivamente la función de hash criptográfico con sal Bcrypt ($2b$10$)
 *      en authController.js, ya que las contraseñas jamás necesitan desencriptarse.
 * 
 * 2. ALGORITMO BIDIRECCIONAL (Datos que SÍ se muestran: títulos, descripciones, datos recuperables):
 *    - Se utiliza el Cifrado Polialfabético de Vigenère adaptado al alfabeto ASCII imprimible.
 *    - Fórmula de Cifrado:   nuevo_valor = (valor_texto + valor_clave) mod N
 *    - Fórmula de Descifrado: nuevo_valor = (valor_texto - valor_clave + N) mod N
 */

// Alfabeto basado en la tabla ASCII imprimible (caracteres ASCII 32 al 126 + acentos y ñ del español)
export const ALFABETO_ASCII =
    ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~áéíóúÁÉÍÓÚñÑüÜ¿¡';

const CLAVE_POR_DEFECTO = process.env.VIGENERE_ASCII_KEY || 'YASUMI_SEGURIDAD_2026';
const PREFIJO_VIGENERE = '~VIG~';

/**
 * Cifra un texto usando el algoritmo de Vigenère sobre el alfabeto ASCII.
 * Estructura homóloga al algoritmo clásico de Vigenère:
 *   valor_texto = alfabeto.indexOf(letra)
 *   valor_clave = alfabeto.indexOf(clave[indice_clave % clave.length])
 *   nuevo_valor = (valor_texto + valor_clave) % N
 */
export const cifrarVigenereASCII = (texto, clave = CLAVE_POR_DEFECTO) => {
    if (texto === null || texto === undefined || texto === '') return texto;
    const str = String(texto);

    // Evitar doble cifrado si ya tiene el prefijo
    if (str.startsWith(PREFIJO_VIGENERE)) return str;

    const claveStr = String(clave || CLAVE_POR_DEFECTO);
    const N = ALFABETO_ASCII.length;
    let resultado = '';
    let indiceClave = 0;

    for (const letra of str) {
        const valorTexto = ALFABETO_ASCII.indexOf(letra);
        if (valorTexto !== -1) {
            const letraClave = claveStr[indiceClave % claveStr.length];
            const valorClave = Math.max(0, ALFABETO_ASCII.indexOf(letraClave));
            const nuevoValor = (valorTexto + valorClave) % N;
            resultado += ALFABETO_ASCII[nuevoValor];
            indiceClave += 1;
        } else {
            resultado += letra;
        }
    }

    return `${PREFIJO_VIGENERE}${resultado}`;
};

/**
 * Descifra un texto en el backend usando el algoritmo inverso de Vigenère sobre el alfabeto ASCII
 * antes de enviarlo al frontend para su visualización.
 *   valor_texto = alfabeto.indexOf(letra)
 *   valor_clave = alfabeto.indexOf(clave[indice_clave % clave.length])
 *   nuevo_valor = (valor_texto - valor_clave + N) % N
 */
export const descifrarVigenereASCII = (textoCifrado, clave = CLAVE_POR_DEFECTO) => {
    if (textoCifrado === null || textoCifrado === undefined || textoCifrado === '') return textoCifrado;
    const str = String(textoCifrado);

    // Compatibilidad con registros previos en texto plano
    if (!str.startsWith(PREFIJO_VIGENERE)) return str;

    const cuerpo = str.slice(PREFIJO_VIGENERE.length);
    const claveStr = String(clave || CLAVE_POR_DEFECTO);
    const N = ALFABETO_ASCII.length;
    let resultado = '';
    let indiceClave = 0;

    for (const letra of cuerpo) {
        const valorTexto = ALFABETO_ASCII.indexOf(letra);
        if (valorTexto !== -1) {
            const letraClave = claveStr[indiceClave % claveStr.length];
            const valorClave = Math.max(0, ALFABETO_ASCII.indexOf(letraClave));
            const nuevoValor = (valorTexto - valorClave + N) % N;
            resultado += ALFABETO_ASCII[nuevoValor];
            indiceClave += 1;
        } else {
            resultado += letra;
        }
    }

    return resultado;
};

// Alias compatibles con los controladores del backend
export const cifrarBidireccionalASCII = cifrarVigenereASCII;
export const descifrarBidireccionalASCII = descifrarVigenereASCII;
export const encriptarActivoCritico = cifrarVigenereASCII;
export const desencriptarActivoCritico = descifrarVigenereASCII;
