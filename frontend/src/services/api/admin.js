// frontend/src/services/api/admin.js
import axios from 'axios';

// Configuración base de axios
const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000,
});

// Interceptor para agregar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('depamanager_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token agregado a request:', config.url);
    } else {
      console.warn('⚠️ No hay token en localStorage para:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas de error
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido, limpiar y redirigir
      localStorage.removeItem('depamanager_token');
      localStorage.removeItem('depamanager_user');
      window.location.href = '/admin/auth';
    }
    return Promise.reject(error);
  }
);

export const adminAPI = {
  // ==================== DASHBOARD ====================
  getDashboard: () => api.get('/admin/dashboard'),

  // ==================== DEPARTAMENTOS ====================
  getDepartments: () => {
    console.log('📦 Solicitando departamentos...');
    return api.get('/admin/departments');
  },
  getDepartmentDetails: (id) => api.get(`/admin/departments/${id}`),
  updateDepartment: (id, data) => api.put(`/admin/departments/${id}`, data),
  deleteDepartment: (id) => api.delete(`/admin/departments/${id}`),
  createDepartmentsBatch: (data) => {
    console.log('📤 Creando departamentos en lote:', data);
    return api.post('/admin/departments/batch', data);
  },
  getAvailableDepartments: () => {
    console.log('🏠 Solicitando departamentos disponibles...');
    return api.get('/admin/departments/available');
  },

  // ==================== EDIFICIOS ====================
  getBuildings: () => {
    console.log('🏢 Solicitando edificios...');
    return api.get('/admin/buildings');
  },
  createDefaultBuilding: () => {
    console.log('🏗️ Solicitando creación de edificio por defecto...');
    return api.post('/admin/buildings/default');
  },

  // ==================== INQUILINOS ====================
  getTenants: () => {
    console.log('👥 Solicitando inquilinos...');
    return api.get('/admin/tenants');
  },
  getTenantDetails: (id) => api.get(`/admin/tenants/${id}`),
  createTenant: (data) => {
    console.log('👤 Creando nuevo inquilino...');
    return api.post('/admin/tenants', data);
  },
  updateTenant: (id, data) => api.put(`/admin/tenants/${id}`, data),
  deleteTenant: (id) => api.delete(`/admin/tenants/${id}`),
  updateTenantStatus: (id, estado) => api.patch(`/admin/tenants/${id}/status`, { estado }),

  // ==================== INCIDENCIAS ====================
  /**
   * Obtener lista de incidencias con filtros opcionales
   * @param {Object} filters - Filtros (estado, urgencia, categoria)
   * @returns {Promise} Lista de incidencias y estadísticas
   */
  getIncidents: (filters = {}) => {
    console.log('🚨 Solicitando incidencias con filtros:', filters);
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    return api.get(`/admin/incidencias?${params.toString()}`);
  },

  /**
   * Obtener detalles de una incidencia específica
   * @param {Number} id - ID de la incidencia
   * @returns {Promise} Detalles de la incidencia
   */
  getIncidentDetails: (id) => {
    console.log(`🔍 Solicitando detalles de incidencia ${id}`);
    return api.get(`/admin/incidencias/${id}`);
  },

  /**
   * Actualizar incidencia (asignar proveedor, cambiar estado)
   * @param {Number} id - ID de la incidencia
   * @param {Object} data - Datos a actualizar (idProveedor, estado, mensajeAsignacion)
   * @returns {Promise} Incidencia actualizada
   */
  updateIncident: (id, data) => {
    console.log(`✏️ Actualizando incidencia ${id}:`, data);
    return api.put(`/admin/incidencias/${id}`, data);
  },

  // ==================== PROVEEDORES ====================
  /**
   * Obtener lista de proveedores para asignar a incidencias
   * @returns {Promise} Lista de proveedores
   */
  getProviders: () => {
    console.log('🔧 Solicitando lista de proveedores...');
    return api.get('/admin/proveedores');
  },
  
  // ✅ RUTAS AGREGADAS PARA PROVEEDORES
  createProvider: (providerData) => {
    console.log('➕ Creando nuevo proveedor...');
    return api.post('/admin/proveedores', providerData);
  },
  
  updateProvider: (id, providerData) => {
    console.log('✏️ Actualizando proveedor...');
    return api.put(`/admin/proveedores/${id}`, providerData);
  },
  
  deleteProvider: (id) => {
    console.log('🗑️ Eliminando proveedor...');
    return api.delete(`/admin/proveedores/${id}`);
  },
  
  getAvailableProviders: () => {
    console.log('✅ Solicitando proveedores disponibles...');
    return api.get('/admin/proveedores/available');
  },
  
  getProviderById: (id) => {
    console.log('🔍 Solicitando proveedor por ID...');
    return api.get(`/admin/proveedores/${id}`);
  }
};