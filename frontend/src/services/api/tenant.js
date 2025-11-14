import api from './auth';

/**
 * Servicios API específicos para el módulo de inquilino
 * Conectados a los endpoints reales del backend
 */

export const tenantAPI = {
  // ==================== DASHBOARD ====================
  
  /**
   * Obtener datos para el dashboard del inquilino
   * @returns {Promise} Datos del dashboard
   */
  getDashboard: async () => {
    try {
      console.log('📊 Solicitando datos del dashboard...');
      const response = await api.get('/tenant/dashboard');
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo dashboard:', error);
      throw error;
    }
  },

  // ==================== PAGOS ====================
  
  /**
   * Obtener lista de pagos del inquilino
   * @param {Object} filters - Filtros opcionales (estado)
   * @returns {Promise} Lista de pagos
   */
  getPayments: async (filters = {}) => {
    try {
      console.log('💰 Solicitando lista de pagos...');
      const response = await api.get('/tenant/pagos', { params: filters });
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo pagos:', error);
      throw error;
    }
  },

  /**
   * Subir comprobante de pago
   * @param {String} idPago - ID del pago
   * @param {String} urlComprobante - URL del comprobante
   * @returns {Promise} Resultado de la subida
   */
  uploadPaymentReceipt: async (idPago, urlComprobante) => {
    try {
      console.log(`📎 Subiendo comprobante para pago ${idPago}...`);
      const response = await api.post(`/tenant/pagos/${idPago}/comprobante`, {
        urlComprobante
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error subiendo comprobante:', error);
      throw error;
    }
  },

  // ==================== INCIDENCIAS ====================
  
  /**
   * Obtener lista de incidencias del inquilino
   * @param {Object} filters - Filtros opcionales (estado)
   * @returns {Promise} Lista de incidencias
   */
  getIncidents: async (filters = {}) => {
    try {
      console.log('🚨 Solicitando lista de incidencias...');
      const response = await api.get('/tenant/incidencias', { params: filters });
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo incidencias:', error);
      throw error;
    }
  },

  /**
   * Reportar nueva incidencia
   * @param {Object} incidentData - Datos de la incidencia
   * @returns {Promise} Incidencia creada
   */
  reportIncident: async (incidentData) => {
    try {
      console.log('📝 Reportando nueva incidencia...');
      const response = await api.post('/tenant/incidencias', incidentData);
      return response.data;
    } catch (error) {
      console.error('❌ Error reportando incidencia:', error);
      throw error;
    }
  },

  /**
   * Obtener detalle de una incidencia específica
   * @param {String} id - ID de la incidencia
   * @returns {Promise} Detalle de la incidencia
   */
  getIncidentDetails: async (id) => {
    try {
      console.log(`🔍 Solicitando detalle de incidencia ${id}...`);
      const response = await api.get(`/tenant/incidencias/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo detalle de incidencia:', error);
      throw error;
    }
  },

  // ==================== CONTRATOS ====================
  
  /**
   * Obtener contratos del inquilino
   * @returns {Promise} Lista de contratos
   */
  getContracts: async () => {
    try {
      console.log('📄 Solicitando contratos...');
      const response = await api.get('/tenant/contratos');
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo contratos:', error);
      throw error;
    }
  },

  // ==================== NOTIFICACIONES ====================
  
  /**
   * Obtener notificaciones del inquilino
   * @param {Object} filters - Filtros opcionales (leido)
   * @returns {Promise} Lista de notificaciones
   */
  getNotifications: async (filters = {}) => {
    try {
      console.log('🔔 Solicitando notificaciones...');
      const response = await api.get('/tenant/notificaciones', { params: filters });
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo notificaciones:', error);
      throw error;
    }
  },

  /**
   * Marcar notificación como leída
   * @param {String} id - ID de la notificación
   * @returns {Promise} Resultado de la operación
   */
  markNotificationAsRead: async (id) => {
    try {
      console.log(`📌 Marcando notificación ${id} como leída...`);
      const response = await api.patch(`/tenant/notificaciones/${id}/leer`);
      return response.data;
    } catch (error) {
      console.error('❌ Error marcando notificación como leída:', error);
      throw error;
    }
  }
};