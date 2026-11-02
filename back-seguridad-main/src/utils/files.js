import fs from 'fs';
import path from 'path';

// Carpeta /public del frontend donde se guardan las imágenes
export const getFrontendPublicDir = () => {
    if (process.env.FRONTEND_PUBLIC_DIR) {
        return path.resolve(process.cwd(), process.env.FRONTEND_PUBLIC_DIR);
    }
    const defaultFront = path.resolve(process.cwd(), '../front-seguridad-main/public');
    if (fs.existsSync(defaultFront)) {
        return defaultFront;
    }
    return path.resolve(process.cwd(), '../yasumi-vite/public');
};

// Crea la carpeta (y las intermedias) solo si no existe
export const ensureDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// Sanitiza el nombre de categoría: "Té e Infusiones" -> "te_e_infusiones"
export const cleanCategoryName = (nombre) => {
    if (!nombre) return 'otros';
    return nombre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9_-]/g, '_')
        .replace(/_+/g, '_')
        .trim();
};
