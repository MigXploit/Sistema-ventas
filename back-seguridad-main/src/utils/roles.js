//traduce el rol guardado en la BD al rol que usa el frontend
// "ADministrador" / "admin" -> 'admin' | "Cliente" -> 'cliente' | cualquier otro -> 'vendedor'

export const mapRolToFrontend = (rolBD) => {
    const rol = (rolBD || '').toLowerCase().trim();
    if(rol === 'administrador' || rol === 'admin') return 'admin';
    if(rol === 'cliente') return 'cliente';
    return 'vendedor';
};