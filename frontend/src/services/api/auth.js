import axios from 'axios';

// ✅ PARA CREATE REACT APP
const API_URL = process.env.REACT_APP_API_URL;

console.log('🔍 API URL configurada:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000
});

// Interceptor para agregar token a las requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('depamanager_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('📤 Enviando request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Error en request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas de error
api.interceptors.response.use(
  (response) => {
    console.log('📥 Respuesta recibida:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Error en respuesta:', error.response?.status, error.message);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('depamanager_token');
      localStorage.removeItem('depamanager_user');
      window.location.href = '/admin/auth';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  // Login
  login: async (credentials) => {
    try {
      console.log('🔐 Intentando login...');
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('❌ Error en login API:', error);
      throw error;
    }
  },

  // Registro de administrador
  registerAdmin: async (userData) => {
    try {
      console.log('👤 Intentando registro...');
      const response = await api.post('/auth/register-admin', userData);
      return response.data;
    } catch (error) {
      console.error('❌ Error en registro API:', error);
      throw error;
    }
  },

  // Verificar token
  verifyToken: async () => {
    try {
      const response = await api.get('/auth/verify');
      return response.data;
    } catch (error) {
      console.error('❌ Error verificando token:', error);
      throw error;
    }
  }
};

export default api;