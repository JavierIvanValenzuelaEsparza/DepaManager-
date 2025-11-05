import axios from 'axios';

// ✅ PARA CREATE REACT APP
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

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

// Interceptor para manejar respuestas - VERSIÓN MEJORADA
api.interceptors.response.use(
  (response) => {
    console.log('📥 Respuesta recibida:', response.status, response.config.url);
    console.log('📥 Datos de la respuesta:', response.data);
    return response;
  },
  (error) => {
    console.error('❌ Error completo en respuesta:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('depamanager_token');
      localStorage.removeItem('depamanager_user');
      window.location.href = '/admin/auth';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  // Login - VERSIÓN MEJORADA CON MÁS LOGS
  login: async (credentials) => {
    try {
      console.log('🔐 Intentando login...');
      console.log('📤 Credenciales enviadas:', { 
        correo: credentials.correo, 
        contrasenia: credentials.contrasenia ? '***' : 'VACÍA' 
      });
      
      const response = await api.post('/auth/login', credentials);
      
      console.log('✅ Respuesta del login recibida:', response.data);
      console.log('✅ Token recibido:', response.data.token ? 'SÍ' : 'NO');
      console.log('✅ User data recibido:', response.data.user);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error completo en login API:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
  },

  // Registro de administrador - VERSIÓN MEJORADA
  registerAdmin: async (userData) => {
    try {
      console.log('👤 Intentando registro...');
      console.log('📤 Datos enviados:', userData);
      
      const response = await api.post('/auth/register-admin', userData);
      
      console.log('✅ Registro exitoso:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error en registro API:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
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