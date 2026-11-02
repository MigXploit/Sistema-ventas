export const getClientIp = (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded
        ? forwarded.split(',')[0].trim()
        : req.socket.remoteAddress || '127.0.0.1';

    return ip.replace('::ffff:', '');
};

// "Ana", "Pérez", null -> "Ana Pérez" (ignora las partes vacías)
export const nombreCompleto = ({ nombre, paterno, materno } = {}) => 
[nombre, paterno, materno].filter(Boolean).join(' ');

// Envuelve un controlador async: si falla, lo registra y responde 500 con `mensaje`
export const manejarErrores = (mensaje, handler) => async (req, res) => {
    try{
        await handler(req, res);
    } catch (error) {
        console.error(`${mensaje}: `, error);
        res.status(500).json({ error: mensaje});
    }
};