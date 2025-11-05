import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tenantAPI } from '../../../services/api/tenant';

/**
 * Vista de gestión de incidencias del inquilino
 * Muestra incidencias reportadas y permite reportar nuevas
 */
export default function IncidentsList() {
  const [incidentsData, setIncidentsData] = useState({
    incidencias: [],
    estadisticas: {}
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    estado: ''
  });

  /**
   * Cargar incidencias cuando cambian los filtros
   */
  useEffect(() => {
    loadIncidents();
  }, [filters]);

  /**
   * Cargar incidencias desde la API
   */
  const loadIncidents = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando incidencias...');

      const response = await tenantAPI.getIncidents(filters);
      
      if (response.success) {
        setIncidentsData(response.data);
        console.log('✅ Incidencias cargadas exitosamente');
      }
    } catch (error) {
      console.error('❌ Error cargando incidencias:', error);
      alert('Error al cargar las incidencias: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Formatear fecha en español
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  /**
   * Obtener clase CSS para la urgencia
   */
  const getUrgencyBadgeClass = (urgencia) => {
    switch (urgencia) {
      case 'Alta':
        return 'bg-red-100 text-red-800';
      case 'Media':
        return 'bg-yellow-100 text-yellow-800';
      case 'Baja':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Obtener clase CSS para el estado
   */
  const getStatusBadgeClass = (estado) => {
    switch (estado) {
      case 'Completada':
        return 'bg-green-100 text-green-800';
      case 'En Proceso':
      case 'Asignada':
        return 'bg-blue-100 text-blue-800';
      case 'En Revisión':
        return 'bg-yellow-100 text-yellow-800';
      case 'Abierta':
        return 'bg-orange-100 text-orange-800';
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
      <div className="max-w-6xl mx-auto">
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mis Incidencias</h1>
            <p className="text-slate-600">Reporta y sigue el estado de tus incidencias</p>
          </div>
          <Link
            to="/tenant/incidencias/reportar"
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            🚨 Reportar Nueva Incidencia
          </Link>
        </div>

        {/* Estadísticas */}
        {incidentsData.estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-2xl font-bold text-slate-900">{incidentsData.estadisticas.total || 0}</p>
              <p className="text-slate-600">Total Incidencias</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-2xl font-bold text-slate-900">{incidentsData.estadisticas.completadas || 0}</p>
              <p className="text-slate-600">Completadas</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-2xl font-bold text-slate-900">{incidentsData.estadisticas.en_progreso || 0}</p>
              <p className="text-slate-600">En Progreso</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-2xl font-bold text-slate-900">{incidentsData.estadisticas.pendientes || 0}</p>
              <p className="text-slate-600">Pendientes</p>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-lg font-semibold text-slate-900">Filtrar Incidencias</h2>
            <div className="flex gap-4">
              <select
                value={filters.estado}
                onChange={(e) => setFilters(prev => ({ ...prev, estado: e.target.value }))}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Todos los estados</option>
                <option value="Abierta">Abierta</option>
                <option value="En Revisión">En Revisión</option>
                <option value="Asignada">Asignada</option>
                <option value="En Proceso">En Proceso</option>
                <option value="Completada">Completada</option>
              </select>
              <button
                onClick={loadIncidents}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
              >
                🔄 Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Incidencias */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {incidentsData.incidencias.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500">No hay incidencias reportadas</p>
                <p className="text-sm text-slate-400 mt-1">
                  {filters.estado ? `No hay incidencias ${filters.estado.toLowerCase()}` : 'Tus incidencias aparecerán aquí'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  {filters.estado ? `Incidencias ${filters.estado}` : 'Todas mis Incidencias'}
                </h2>
                
                {incidentsData.incidencias.map((incidencia) => (
                  <div key={incidencia.idIncidencia} className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                      {/* Información de la incidencia */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">{incidencia.tipoProblema}</h3>
                          <div className="flex gap-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyBadgeClass(incidencia.urgencia)}`}>
                              {incidencia.urgencia}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(incidencia.estado)}`}>
                              {incidencia.estado}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-slate-600 mb-2">{incidencia.descripcion}</p>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                          <p><strong>Reportada:</strong> {formatDate(incidencia.fechaReporte)}</p>
                          {incidencia.categoria && (
                            <p><strong>Categoría:</strong> {incidencia.categoria}</p>
                          )}
                          {incidencia.fechaCierre && (
                            <p><strong>Cerrada:</strong> {formatDate(incidencia.fechaCierre)}</p>
                          )}
                        </div>

                        {incidencia.mensajeAsignacion && (
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-sm font-medium text-blue-900 mb-1">
                              Actualización del administrador:
                            </p>
                            <p className="text-blue-800">{incidencia.mensajeAsignacion}</p>
                          </div>
                        )}
                      </div>

                      {/* Acciones */}
                      <div className="flex flex-col gap-2">
                        <button className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors">
                          Ver Detalles
                        </button>
                        {incidencia.estado !== 'Completada' && (
                          <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
                            Agregar Comentario
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}