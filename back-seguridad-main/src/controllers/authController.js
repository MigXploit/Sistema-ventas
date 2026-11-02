import { pool } from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/jwt.js';
import { evaluarFortaleza } from '../middleware/validatorMiddleware.js';
import { mapRolToFrontend } from '../utils/roles.js';
import { registrarAcceso } from '../services/logService.js';
import { buscarIdPorEmail, crearUsuarioCompleto } from '../services/userService.js';
import { nombreCompleto } from '../utils/helpers.js';
import { generarCaptchaSeguro, validarCaptcha } from '../utils/captcha.js';

// Hash falso para igualar tiempos de CPU y mitigar ataques de enumeración por temporización (Timing Attacks)
const DUMMY_HASH = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

// Generador de CAPTCHA seguro con firma criptográfica HMAC
export const obtenerCaptcha = (req, res) => {
    try {
        const nuevoCaptcha = generarCaptchaSeguro();
        res.json({
            ok: true,
            pregunta: nuevoCaptcha.pregunta,
            a: nuevoCaptcha.a,
            b: nuevoCaptcha.b,
            token: nuevoCaptcha.token
        });
    } catch (error) {
        console.error('Error al generar captcha seguro:', error);
        res.status(500).json({ error: 'Error al generar verificación CAPTCHA' });
    }
};

// Login de usuario con hardening contra fuerza bruta, enumeración y bypass
export const login = async (req, res) => {
    const { email, password, captchaA, captchaB, captchaInput, captchaToken } = req.body;

    try {
        // 1. Validar CAPTCHA matemático seguro
        const resultadoCaptcha = validarCaptcha({
            token: captchaToken,
            a: captchaA,
            b: captchaB,
            input: captchaInput
        });

        if (!resultadoCaptcha.ok) {
            return res.status(400).json({ error: resultadoCaptcha.error });
        }

        const emailLimpio = (email || '').toLowerCase().trim();

        // 2. Buscar usuario en base de datos (persona + usuario)
        const { rows } = await pool.query(
            `SELECT p.id_persona, p.nombre, p.paterno, p.email,
                    u.id_sucursal, u.password, u.rol, u.activo
             FROM persona p
             JOIN usuario u ON p.id_persona = u.id_usuario
             WHERE LOWER(p.email) = $1`,
            [emailLimpio]
        );

        // Si el usuario no existe, ejecutamos un hash dummy para evitar Timing Attacks
        if (rows.length === 0) {
            await bcrypt.compare(password || '', DUMMY_HASH);
            // Intentar registrar log anónimo de intento fallido
            return res.status(401).json({ error: 'Credenciales inválidas. Por favor verifique su correo y contraseña.' });
        }

        const user = rows[0];

        // 3. Verificar si el usuario está activo
        if (!user.activo) {
            await bcrypt.compare(password || '', DUMMY_HASH);
            await registrarAcceso(req, user.id_persona, 'LOGIN_BLOQUEADO_INACTIVO');
            return res.status(403).json({ error: 'La cuenta se encuentra inactiva. Contacte al administrador.' });
        }

        // 4. Contrastar contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // Auditoría de fallo de credenciales
            await registrarAcceso(req, user.id_persona, 'LOGIN_FALLIDO');
            return res.status(401).json({ error: 'Credenciales inválidas. Por favor verifique su correo y contraseña.' });
        }

        // 5. Mapear rol de BD a Frontend
        const rolFrontend = mapRolToFrontend(user.rol);
        const nombre = nombreCompleto(user);

        // 6. Generar token JWT con firma criptográfica y expiración
        const token = jwt.sign(
            {
                id:     user.id_persona,
                nombre,
                email:  user.email,
                rol:    rolFrontend
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // 7. Registrar LOG de auditoría de ingreso exitoso
        await registrarAcceso(req, user.id_persona, 'INGRESO');

        // 8. Actualizar marca temporal de último acceso
        await pool.query(
            `UPDATE usuario SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id_usuario = $1`,
            [user.id_persona]
        );

        res.json({
            ok: true,
            token,
            usuario: {
                nombre,
                rol: rolFrontend
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno en el servidor al autenticar el usuario' });
    }
};

// Registro de usuario con verificación de fortaleza y control estricto de roles
export const register = async (req, res) => {
    const { nombre, paterno, materno, email, password, rol } = req.body;

    try {
        // 1. Validar fortaleza de contraseña
        const fortaleza = evaluarFortaleza(password);
        if (fortaleza === 'debil') {
            return res.status(400).json({
                error: 'Contraseña vulnerable. Debe contener mínimo 6 caracteres, combinando letras, números y símbolos.'
            });
        }

        const emailLimpio = (email || '').toLowerCase().trim();

        // 2. Verificar si el email ya existe
        if (await buscarIdPorEmail(emailLimpio)) {
            return res.status(400).json({ error: 'El correo electrónico ya se encuentra registrado en la plataforma.' });
        }

        // 3. Encriptar contraseña con salt cost 10
        const passwordHash = await bcrypt.hash(password, 10);

        // 4. Determinar rol (Prevenir escalamiento de privilegios vertical)
        let rolBD = 'Cliente';
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                if (decoded && decoded.rol === 'admin') {
                    rolBD = rol === 'admin' ? 'Administrador' : 'Atención al Cliente';
                }
            } catch {
                // Token inválido — forzar rol Cliente
                rolBD = 'Cliente';
            }
        }

        await crearUsuarioCompleto({
            nombre: (nombre || '').trim(),
            paterno: paterno ? paterno.trim() : null,
            materno: materno ? materno.trim() : null,
            email: emailLimpio,
            passwordHash,
            rol: rolBD
        });

        res.json({
            ok: true,
            message: rolBD === 'Cliente' ? 'Registro completado como cliente' : 'Usuario registrado exitosamente'
        });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error en el servidor al registrar el usuario' });
    }
};

// Logout de usuario con registro de auditoría
export const logout = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Sesión no válida o no autenticada' });
        }

        await registrarAcceso(req, req.user.id, 'SALIDA');

        res.json({ ok: true, message: 'Salida y auditoría registradas exitosamente' });
    } catch (error) {
        console.error('Error en logout:', error);
        res.status(500).json({ error: 'Error en el servidor al registrar salida' });
    }
};

// Obtener o crear el usuario invitado en la BD
const obtenerOCrearInvitado = async () => {
    const idExistente = await buscarIdPorEmail('invitado@yasumi.com');
    if (idExistente) return idExistente;

    return crearUsuarioCompleto({
        nombre: 'Invitado',
        email: 'invitado@yasumi.com',
        passwordHash: await bcrypt.hash('invitado_password_2026', 10),
        rol: 'Cliente'
    });
};

// Login como invitado (Sesión temporal con alcance mínimo)
export const loginInvitado = async (req, res) => {
    try {
        const idInvitado = await obtenerOCrearInvitado();

        await registrarAcceso(req, idInvitado, 'INGRESO_INVITADO');

        const token = jwt.sign(
            { id: idInvitado, nombre: 'Invitado', email: 'invitado@yasumi.com', rol: 'invitado' },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.json({
            ok: true,
            token,
            usuario: {
                nombre: 'Invitado',
                rol:    'invitado'
            }
        });
    } catch (error) {
        console.error('Error en login de invitado:', error);
        res.status(500).json({ error: 'Error al iniciar sesión como invitado' });
    }
};
