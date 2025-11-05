import React, { useState, useEffect } from 'react';
import { tenantAPI } from '../../../services/api/tenant';

/**
 * Vista de notificaciones del inquilino
 * Muestra notificaciones recibidas y permite marcarlas como leídas
 */
export default function NotificationsList() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    leido: ''
  });

  /**
   * Cargar notificaciones cuando cambian los filtros
   */
  useEffect(() => {
    loadNotifications();
  }, [filters]);

  /**
   * Cargar notificaciones desde la API
   */
  const loadNotifications = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando notificaciones...');

      const response = await tenantAPI.getNotifications(filters);
      
      if (response.success) {
        setNotifications(response.data);
        console.log('✅ Notificaciones cargadas exitosamente');
      }
    } catch (error) {
      console.error('❌ Error cargando notificaciones:', error);
      alert('Error al cargar las notificaciones: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Marcar notificación como leída
   */
  const handleMarkAsRead = async (idNotificacion) => {
    try {
      await tenantAPI.markNotificationAsRead(idNotificacion);
      
      // Actualizar estado local
      setNotifications(prev => prev.map(notif => 
        notif.idNotificacion === idNotificacion 
          ? { ...notif, leido: true }
          : notif
      ));
      
      console.log('✅ Notificación marcada como leída');
    } catch (error) {
      console.error('Error marcando notificación:', error);
      alert('Error al marcar notificación: ' + (error.response?.data?.message || error.message));
    }
  };

  /**
   * Formatear fecha relativa (hace X tiempo)
   */
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Hace unos momentos';
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  /**
   * Obtener clase CSS para la categoría
   */
  const getCategoryBadgeClass = (categoria) => {
    switch (categoria) {
      case 'Pagos':
        return 'bg-green-100 text-green-800';
      case 'Mantenimiento':
        return 'bg-blue-100 text-blue-800';
      case 'Avisos Administrativos':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Encabezado */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-slate-200">
            <h1 className="text-2xl font-bold text-slate-900">Mis Notificaciones</h1>
            <p className="text-slate-600">Mantente informado sobre novedades</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-lg font-semibold text-slate-900">Filtrar Notificaciones</h2>
            <div className="flex gap-4">
              <select
                value={filters.leido}
                onChange={(e) => setFilters(prev => ({ ...prev, leido: e.target.value }))}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Todas</option>
                <option value="false">No leídas</option>
                <option value="true">Leídas</option>
              </select>
              <button
                onClick={loadNotifications}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
              >
                🔄 Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Notificaciones */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500">No hay notificaciones</p>
                <p className="text-sm text-slate-400 mt-1">
                  {filters.leido === 'false' 
                    ? 'No tienes notificaciones no leídas' 
                    : 'Tus notificaciones aparecerán aquí'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  {filters.leido === 'false' ? 'Notificaciones No Leídas' : 
                   filters.leido === 'true' ? 'Notificaciones Leídas' : 'Todas las Notificaciones'}
                </h2>
                
                {notifications.map((notificacion) => (
                  <div 
                    key={notificacion.idNotificacion} 
                    className={`border rounded-lg p-6 transition-all ${
                      !notificacion.leido 
                        ? 'border-l-4 border-l-emerald-500 bg-emerald-50 border-emerald-200' 
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                      {/* Contenido de la notificación */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {notificacion.asunto || 'Sin asunto'}
                          </h3>
                          <div className="flex gap-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryBadgeClass(notificacion.categoria)}`}>
                              {notificacion.categoria}
                            </span>
                            {!notificacion.leido && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                Nuevo
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-slate-700 mb-3">{notificacion.mensaje}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span>{formatRelativeTime(notificacion.fechaEnvio)}</span>
                          <span>•</span>
                          <span>{notificacion.tipo}</span>
                          {notificacion.destinatario === 'Individual' && (
                            <>
                              <span>•</span>
                              <span>Para ti</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex flex-col gap-2">
                        {!notificacion.leido && (
                          <button
                            onClick={() => handleMarkAsRead(notificacion.idNotificacion)}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                          >
                            Marcar como leída
                          </button>
                        )}
                        <button className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors">
                          Ver detalles
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Estadísticas rápidas */}
        {notifications.length > 0 && (
          <div className="mt-6 text-center text-sm text-slate-500">
            <p>
              Mostrando {notifications.length} notificación{notifications.length !== 1 ? 'es' : ''}
              {filters.leido && ` ${filters.leido === 'false' ? 'no leídas' : 'leídas'}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}