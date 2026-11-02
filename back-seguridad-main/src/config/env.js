import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Carga desde process.cwd()
dotenv.config();

// 2. Carga directa y segura desde la raíz del backend (back-seguridad-main/.env)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
