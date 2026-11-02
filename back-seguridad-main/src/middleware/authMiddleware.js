import jwt from 'jsonwebtoken';
import { mapRolToFrontend } from '../utils/roles.js';
import { JWT_SECRET } from '../config/jwt.js';

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ error: 'Acceso denegado. No se proporcionó token.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; 
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido o expirado.' });
    }
};

export const isAdmin = (req, res, next) => {
    if (mapRolToFrontend(req.user?.rol)==='admin') {
        return next();
    }
    return res.status(403).json({ error: 'Acceso denegado. Se requiere permisos de Administrador. '});
};
