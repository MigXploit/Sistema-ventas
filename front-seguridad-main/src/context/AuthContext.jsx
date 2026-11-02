import { createContext, useContext, useState } from 'react';
import api from '../api/axiosConfig';

const AuthContext = createContext(null);

// Evaluar fortaleza en frontend para mostrar ayuda visual
export function evaluarFortaleza(password) {
  if (!password) return null;
  const tieneMayus  = /[A-Z]/.test(password);
  const tieneMinus  = /[a-z]/.test(password);
  const tieneNum    = /[0-9]/.test(password);
  const tieneSimb   = /[^A-Za-z0-9]/.test(password);
  const longitud    = password.length;

  if (longitud < 6 || (!tieneNum && !tieneSimb)) return 'debil';
  if (longitud >= 12 && tieneMayus && tieneMinus && tieneNum && tieneSimb) return 'fuerte';
  return 'media';
}

export function esEmail(correo) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem('yasumi_usuario');
    return guardado ? JSON.parse(guardado) : null;
  });

  const login = async (email, password, captcha) => {
    try {
      // Llamar al backend pasando los datos del captcha y su token criptográfico
      const res = await api.post('/auth/login', { 
        email, 
        password, 
        captchaA: captcha.a, 
        captchaB: captcha.b, 
        captchaInput: captcha.input,
        captchaToken: captcha.token
      });
      
      if (res.data.mensaje && Array.isArray(res.data.mensaje)) {
        return { ok: false, error: res.data.mensaje.map(m => m.msg).join(', ') };
      }

      const { token, usuario: usuarioDB } = res.data;

      localStorage.setItem('yasumi_token', token);
      localStorage.setItem('yasumi_usuario', JSON.stringify(usuarioDB));
      
      setUsuario(usuarioDB);
      return { ok: true, usuario: usuarioDB };
    } catch (error) {
      return { 
        ok: false, 
        error: error.response?.data?.error || 'Error al conectar al servidor' 
      };
    }
  };

  const logout = async () => {
    try {
      // Registramos salida y auditoría en la base de datos
      await api.post('/auth/logout');
    } catch (error) {
      console.error("Error al registrar logout en el servidor:", error);
    } finally {
      setUsuario(null);
      localStorage.removeItem('yasumi_usuario');
      localStorage.removeItem('yasumi_token');
    }
  };

  const registrarUsuario = async (datos) => {
    try {
      const res = await api.post('/auth/registro', datos);
      if (res.data.mensaje && Array.isArray(res.data.mensaje)) {
        return { ok: false, error: res.data.mensaje.map(m => m.msg).join(', ') };
      }
      return { ok: true, message: res.data.message };
    } catch (error) {
      return { 
        ok: false, 
        error: error.response?.data?.error || 'Error al registrar usuario' 
      };
    }
  };

  const loginInvitado = async () => {
    try {
      const res = await api.post('/auth/invitado');
      const { token, usuario: usuarioDB } = res.data;

      localStorage.setItem('yasumi_token', token);
      localStorage.setItem('yasumi_usuario', JSON.stringify(usuarioDB));
      
      setUsuario(usuarioDB);
      return { ok: true };
    } catch (error) {
      return { 
        ok: false, 
        error: error.response?.data?.error || 'Error al entrar como invitado' 
      };
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await api.get('/logs');
      return res.data;
    } catch (error) {
      console.error("Error al obtener logs de acceso:", error);
      return [];
    }
  };

  const obtenerCaptchaServidor = async () => {
    try {
      const res = await api.get('/auth/captcha');
      return res.data;
    } catch (error) {
      console.warn("No se pudo obtener captcha del servidor, usando generador local:", error.message);
      return null;
    }
  };

  const esAdmin = () => usuario?.rol === 'admin';

  return (
    <AuthContext.Provider value={{
      usuario,
      login,
      logout,
      registrarUsuario,
      loginInvitado,
      fetchLogs,
      obtenerCaptchaServidor,
      esAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
