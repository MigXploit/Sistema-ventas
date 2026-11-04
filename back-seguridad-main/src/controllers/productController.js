import { pool } from '../config/db.js';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.js';
import { cleanCategoryName, getFrontendPublicDir, ensureDir } from '../utils/files.js';
import { cifrarBidireccionalASCII, descifrarBidireccionalASCII } from '../utils/cryptoAssets.js';
import { registrarAcceso } from '../services/logService.js';

// MIME types seguros permitidos
const ALLOWED_MIME_TYPES = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp'
};

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const guardarImagenBase64 = async (base64Str, originalName, id_categoria) => {
    try {
        // 1. Obtener nombre seguro de la categoría
        const { rows } = await pool.query(
            'SELECT nombre FROM categoria WHERE id_categoria = $1',
            [id_categoria]
        );
        const catNombre = rows.length > 0 ? rows[0].nombre : 'otros';
        const catFolder = cleanCategoryName(catNombre);

        // 2. Extraer y validar el encabezado MIME del string Base64
        const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            throw new Error('Formato de imagen en Base64 inválido o corrupto');
        }

        const mimeType = matches[1].toLowerCase();
        if (!ALLOWED_MIME_TYPES[mimeType]) {
            throw new Error('Formato de imagen no permitido. Solo se aceptan JPEG, PNG y WEBP.');
        }

        const fileBuffer = Buffer.from(matches[2], 'base64');

        // Validar tamaño máximo para prevenir DoS por saturación de almacenamiento
        if (fileBuffer.length > MAX_IMAGE_SIZE_BYTES) {
            throw new Error('La imagen excede el límite máximo permitido de 5 MB.');
        }

        // Extensión forzada según el tipo MIME validado (previene extensión spoofing)
        const safeExt = ALLOWED_MIME_TYPES[mimeType];

        // Sanitización estricta del nombre (previene Path Traversal ../)
        const baseClean = path.basename(originalName || 'producto', path.extname(originalName || ''))
            .replace(/[^a-zA-Z0-9_-]/g, '_')
            .toLowerCase();

        const filename = `${Date.now()}_${baseClean}${safeExt}`;

        // 3. Ruta de destino segura en el frontend
        const publicDir = getFrontendPublicDir();
        const targetDir = path.join(publicDir, 'productos', catFolder);

        ensureDir(targetDir);

        const targetPath = path.join(targetDir, filename);
        fs.writeFileSync(targetPath, fileBuffer);

        return `/productos/${catFolder}/${filename}`;
    } catch (error) {
        console.error('Error al guardar la imagen base64:', error.message);
        throw error;
    }
};

const resolverImagen = async ({ imagen_url, emoji, imagen_base64, imagen_nombre, id_categoria }) => {
    if (imagen_base64 && imagen_nombre) {
        return guardarImagenBase64(imagen_base64, imagen_nombre, id_categoria);
    }
    // Sanitizar URLs externas para prevenir esquemas javascript: o data: maliciosos
    if (imagen_url && typeof imagen_url === 'string') {
        const limpia = imagen_url.trim();
        if (limpia.startsWith('/') || limpia.startsWith('http://') || limpia.startsWith('https://')) {
            return limpia;
        }
    }
    return emoji || '🌸';
};

// Cifrado polialfabético bidireccional de Vigenère sobre alfabeto ASCII (32–126) para los datos visibles (título y descripción) al guardar en BD
const valoresProducto = async (body) => [
    body.nombre ? cifrarBidireccionalASCII(body.nombre.trim()) : '',
    body.descripcion ? cifrarBidireccionalASCII(body.descripcion.trim()) : null,
    parseInt(body.id_categoria, 10),
    body.tipo || 'Estándar',
    await resolverImagen(body),
    parseFloat(body.precio),
    parseInt(body.stock ?? 0, 10),
    parseInt(body.stock_minimo ?? 1, 10)
];

const esPeticionAdmin = (req) => {
    const authHeader = req.headers?.['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return false;
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded?.rol === 'admin' || decoded?.rol === 'Administrador';
    } catch {
        return false;
    }
};

// Obtener productos (Descifra en el backend los datos visibles con Cifrado de Vigenère sobre alfabeto ASCII; filtra solo activos para no administradores)
export const getProductos = async (req, res) => {
    try {
        const esAdmin = esPeticionAdmin(req);
        const { rows } = await pool.query(
            `SELECT p.id_producto AS id, p.nombre, p.descripcion, p.tipo, p.imagen_url,
                    p.activo, p.precio, p.stock_disponible AS stock, p.stock_minimo,
                    p.id_categoria, c.nombre AS categoria
             FROM producto p
             JOIN categoria c ON p.id_categoria = c.id_categoria
             ${esAdmin ? '' : 'WHERE p.activo = TRUE'}
             ORDER BY p.id_producto DESC`
        );

        const productos = rows.map(p => {
            const esUrl = p.imagen_url && (p.imagen_url.startsWith('http') || p.imagen_url.startsWith('/'));
            const nombreDescifrado = descifrarBidireccionalASCII(p.nombre);
            const descripcionDescifrada = descifrarBidireccionalASCII(p.descripcion);
            return {
                id:                   p.id,
                nombre:               nombreDescifrado,
                nombre_cifrado_ascii: cifrarBidireccionalASCII(nombreDescifrado),
                categoria:            descifrarBidireccionalASCII(p.categoria),
                id_categoria:         p.id_categoria,
                precio:               Number(p.precio),
                stock:                p.stock,
                ...(esAdmin ? { stock_minimo: p.stock_minimo } : {}),
                descripcion:          descripcionDescifrada,
                tipo:                 p.tipo,
                imagen_url:           p.imagen_url,
                emoji:                esUrl ? '🌸' : (p.imagen_url || '🌸'),
                activo:               p.activo
            };
        });

        res.json(productos);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ error: 'Error al obtener productos del servidor' });
    }
};

// Crear nuevo producto
export const crearProducto = async (req, res) => {
    try {
        const valores = await valoresProducto(req.body);

        const { rows } = await pool.query(
            `INSERT INTO producto (nombre, descripcion, id_categoria, tipo, imagen_url, precio, stock_disponible, stock_minimo, activo)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)
             RETURNING id_producto`,
            valores
        );

        const nuevoId = rows[0].id_producto;
        try {
            await registrarAcceso(req, req.user?.id || null, `PRODUCTO_CREADO: ID #${nuevoId} (${req.body?.nombre || 'Producto'})`);
        } catch { /* no interrumpir respuesta */ }

        res.json({
            ok: true,
            message: 'Producto creado exitosamente',
            id: nuevoId
        });
    } catch (error) {
        console.error('Error al crear producto:', error.message);
        res.status(500).json({ error: error.message || 'Error al crear producto en el servidor' });
    }
};

// Editar Producto
export const editarProducto = async (req, res) => {
    try {
        const valores = await valoresProducto(req.body);

        await pool.query(
            `UPDATE producto
             SET nombre = $1, descripcion = $2, id_categoria = $3, tipo = $4,
                 imagen_url = $5, precio = $6, stock_disponible = $7, stock_minimo = $8
             WHERE id_producto = $9`,
            [...valores, req.params.id]
        );

        try {
            await registrarAcceso(req, req.user?.id || null, `PRODUCTO_EDITADO: ID #${req.params.id}`);
        } catch { /* no interrumpir respuesta */ }

        res.json({ ok: true, message: 'Producto actualizado exitosamente' });
    } catch (error) {
        console.error('Error al editar producto:', error.message);
        res.status(500).json({ error: error.message || 'Error al editar producto en el servidor' });
    }
};

const setProductoActivo = (activo) => async (req, res) => {
    const accion = activo ? 'reactivar' : 'desactivar';

    try {
        await pool.query(
            'UPDATE producto SET activo = $1 WHERE id_producto = $2',
            [activo, req.params.id]
        );

        try {
            await registrarAcceso(
                req,
                req.user?.id || null,
                `${activo ? 'PRODUCTO_REACTIVADO' : 'PRODUCTO_DESACTIVADO'}: ID #${req.params.id}`
            );
        } catch { /* no interrumpir respuesta */ }

        res.json({ ok: true, message: `Producto ${activo ? 'reactivado' : 'desactivado'} exitosamente` });
    } catch (error) {
        console.error(`Error al ${accion} producto:`, error);
        res.status(500).json({ error: `Error al ${accion} producto en el servidor` });
    }
};

export const eliminarProducto = setProductoActivo(false);
export const reactivarProducto = setProductoActivo(true);
