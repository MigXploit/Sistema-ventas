import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:3002') + '/api',
  timeout: 15000 // 15 segundos timeout
});

// Interceptor de Peticiones: inyecta token Bearer JWT si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('yasumi_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor de Respuestas: detecta sesión expirada y rate-limiting
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el token expiró o fue revocado en el servidor (401), limpiar sesión local
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || '';
      // No limpiar si el error viene del intento de login en sí
      if (!url.includes('/auth/login') && !url.includes('/auth/registro')) {
        localStorage.removeItem('yasumi_token');
        localStorage.removeItem('yasumi_usuario');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
