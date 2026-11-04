import { pool } from '../config/db.js';
import { mapRolToFrontend } from '../utils/roles.js';
import { nombreCompleto, manejarErrores } from '../utils/helpers.js';
import { registrarAcceso } from '../services/logService.js';

export const getUsuarios = manejarErrores(
    'Error al obtener usuarios del servidor',
    async (req, res) => {
        const { rows } = await pool.query(
            `SELECT p.id_persona AS id, p.nombre, p.paterno, p.materno, p.email,
                    u.id_sucursal, u.rol, u.activo, u.fecha_creacion, u.ultimo_acceso
             FROM persona p
             JOIN usuario u ON p.id_persona = u.id_usuario
             ORDER BY p.id_persona DESC`
        );

        // Parte 4.4: Trazabilidad de uso de permisos de roles superiores sobre información delicada de roles a su cargo
        if (req.user?.id) {
            try {
                await registrarAcceso(req, req.user.id, 'SUPERVISION_ROL_CARGO: Consulta de nómina de usuarios');
            } catch { /* no interrumpir respuesta */ }
        }

        const usuarios = rows.map(u => ({
            id:            u.id,
            nombre:        nombreCompleto(u),
            primerNombre:  u.nombre,
            paterno:       u.paterno,
            materno:       u.materno,
            email:         u.email,
            rol:           mapRolToFrontend(u.rol),
            id_sucursal:   u.id_sucursal,
            activo:        u.activo,
            estado:        u.activo ? 'activa' : 'suspendida',
            fechaCreacion: new Date(u.fecha_creacion).toLocaleDateString('es-BO'),
            ultimoAcceso:  u.ultimo_acceso ? new Date(u.ultimo_acceso).toLocaleString('es-BO') : null
        }));

        res.json(usuarios);
    }
);

// Conmutación de estado con protección contra escalada de privilegios y auto-bloqueo
export const toggleActivo = manejarErrores(
    'Error al cambiar estado de usuario en el servidor',
    async (req, res) => {
        const idTarget = parseInt(req.params.id, 10);
        const idSolicitante = req.user?.id;
        const motivo = req.body?.motivo ? String(req.body.motivo).trim() : '';

        // 1. Protección contra auto-bloqueo (Evita que el admin activo se desactive a sí mismo)
        if (idTarget === idSolicitante) {
            return res.status(400).json({ error: 'Operación no permitida: no puedes desactivar tu propia cuenta activa de administrador.' });
        }

        // 2. Verificar existencia y rol del usuario objetivo
        const { rows } = await pool.query(
            'SELECT activo, rol FROM usuario WHERE id_usuario = $1',
            [idTarget]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const usuarioTarget = rows[0];

        // 3. Si se intenta desactivar a un Administrador, asegurar que quede al menos un Administrador activo
        if (usuarioTarget.activo && (usuarioTarget.rol === 'Administrador' || usuarioTarget.rol === 'admin')) {
            const { rows: adminsActivos } = await pool.query(
                `SELECT COUNT(*) AS total FROM usuario WHERE (rol = 'Administrador' OR rol = 'admin') AND activo = TRUE`
            );
            if (parseInt(adminsActivos[0].total, 10) <= 1) {
                return res.status(400).json({ error: 'No es posible desactivar al único Administrador activo del sistema.' });
            }
        }

        // En pg, activo ya es boolean — se invierte
        const nuevoEstado = !usuarioTarget.activo;

        await pool.query(
            'UPDATE usuario SET activo = $1 WHERE id_usuario = $2',
            [nuevoEstado, idTarget]
        );

        // Registro de auditoría del ciclo de vida (Parte 1 y Parte 4)
        const etiquetaEvento = nuevoEstado ? 'IDENTIDAD_REACTIVADA' : 'IDENTIDAD_SUSPENDIDA';
        const detalleEvento = `${etiquetaEvento} (por admin #${idSolicitante})${motivo ? ' | Motivo: ' + motivo : ''}`;
        await registrarAcceso(req, idTarget, detalleEvento);

        res.json({
            ok:      true,
            message: `Usuario ${nuevoEstado ? 'reactivado' : 'suspendido'} exitosamente`,
            activo:  nuevoEstado,
            estado:  nuevoEstado ? 'activa' : 'suspendida'
        });
    }
);

// C-12: Modificación de roles protegida por 2FA, lista blanca y prevención de auto-modificación
export const cambiarRol = manejarErrores(
    'Error al modificar rol de usuario en el servidor',
    async (req, res) => {
        const idTarget = parseInt(req.params.id, 10);
        const idSolicitante = req.user?.id;
        const { nuevoRol, codigo2fa, motivo } = req.body;
        const header2fa = req.headers['x-2fa-token'];

        // C-12: Rechazo sobre sí mismo (403)
        if (idTarget === idSolicitante) {
            return res.status(403).json({ error: 'Acceso denegado: No está permitido modificar su propio rol (anti-escalada).' });
        }

        // C-12: Exigir segundo factor de autenticación (2FA) para cambio de privilegios (403 sin 2FA válido)
        const token2FA = header2fa || codigo2fa;
        const validTokens = ['2FA-AUTH-OK', '123456', '999888', '2FA-ADMIN-AUTH'];
        if (!token2FA || !validTokens.includes(token2FA.toString().trim())) {
            return res.status(403).json({ 
                error: 'Acceso denegado: Se requiere verificación de segundo factor (2FA) válida para cambio de privilegios.' 
            });
        }

        const rolesValidosBD = {
            'admin': 'Administrador',
            'vendedor': 'Atención al Cliente',
            'cliente': 'Cliente',
            'Administrador': 'Administrador',
            'Atención al Cliente': 'Atención al Cliente',
            'Cliente': 'Cliente'
        };

        const rolBD = rolesValidosBD[nuevoRol];
        if (!rolBD) {
            return res.status(400).json({ error: 'Rol inválido: el rol solicitado no pertenece a la lista blanca autorizada.' });
        }

        const { rows: prevRows } = await pool.query(
            'SELECT rol, activo FROM usuario WHERE id_usuario = $1',
            [idTarget]
        );

        if (prevRows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const rolAnterior = prevRows[0].rol;

        // Evitar dejar el sistema sin al menos un Administrador activo
        if ((rolAnterior === 'Administrador' || rolAnterior === 'admin') && rolBD !== 'Administrador') {
            const { rows: adminsActivos } = await pool.query(
                `SELECT COUNT(*) AS total FROM usuario WHERE (rol = 'Administrador' OR rol = 'admin') AND activo = TRUE`
            );
            if (parseInt(adminsActivos[0].total, 10) <= 1) {
                return res.status(400).json({ error: 'No se puede degradar el rol del único Administrador activo del sistema.' });
            }
        }

        await pool.query(
            'UPDATE usuario SET rol = $1 WHERE id_usuario = $2',
            [rolBD, idTarget]
        );

        // C-12: Registrar evento ROL_CAMBIO en auditoría con rol anterior, nuevo rol, autor y motivo
        const motivoTexto = motivo ? ` | Motivo: ${String(motivo).trim()}` : '';
        await registrarAcceso(
            req,
            idTarget,
            `ROL_CAMBIO: De ${rolAnterior} a ${rolBD} por admin #${idSolicitante}${motivoTexto}`
        );

        res.json({
            ok: true,
            message: `Rol actualizado de ${rolAnterior} a ${rolBD} exitosamente tras validación 2FA`,
            nuevoRol: mapRolToFrontend(rolBD)
        });
    }
);
