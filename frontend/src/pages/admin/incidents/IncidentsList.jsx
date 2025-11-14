import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../../services/api/admin';

export default function IncidentsList() {
  const [incidentsData, setIncidentsData] = useState({
    incidencias: [],
    estadisticas: {}
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    estado: '',
    urgencia: '',
    categoria: ''
  });

  useEffect(() => {
    loadIncidents();
  }, [filters]);

  const loadIncidents = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getIncidents(filters);
      
      if (response.data && response.data.success) {
        setIncidentsData(response.data.data);
      } else {
        setIncidentsData({ incidencias: [], estadisticas: {} });
      }
    } catch (error) {
      console.error('❌ Error cargando incidencias:', error);
      setIncidentsData({ incidencias: [], estadisticas: {} });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (idIncidencia, nuevoEstado) => {
    try {
      console.log(`🔄 Cambiando estado de incidencia ${idIncidencia} a ${nuevoEstado}`);
      const response = await adminAPI.updateIncident(idIncidencia, { estado: nuevoEstado });
      
      if (response.data && response.data.success) {
        console.log('✅ Estado actualizado');
        // Recargar la lista
        loadIncidents();
      }
    } catch (error) {
      console.error('❌ Error actualizando estado:', error);
      alert('Error al actualizar el estado');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getUrgencyBadgeClass = (urgencia) => {
    switch (urgencia) {
      case 'Alta': return 'bg-red-100 text-red-800 border border-red-200';
      case 'Media': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'Baja': return 'bg-green-100 text-green-800 border border-green-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusBadgeClass = (estado) => {
    switch (estado) {
      case 'Completada': return 'bg-green-100 text-green-800 border border-green-200';
      case 'En Proceso': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Asignada': return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'En Revisión': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'Abierta': return 'bg-orange-100 text-orange-800 border border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Control de Incidencias</h1>
          <p className="text-gray-600 mt-2">Gestiona reportes de mantenimiento y reparaciones</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{incidentsData.estadisticas.total || 0}</p>
                <p className="text-gray-600 text-sm">Total Incidencias</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-2xl">📋</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{incidentsData.estadisticas.abiertas || 0}</p>
                <p className="text-gray-600 text-sm">Incidencias Abiertas</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{incidentsData.estadisticas.en_proceso || 0}</p>
                <p className="text-gray-600 text-sm">En Proceso</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <span className="text-2xl">🔄</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{incidentsData.estadisticas.completadas || 0}</p>
                <p className="text-gray-600 text-sm">Resueltas</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Filtrar Incidencias</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={filters.estado}
                onChange={(e) => setFilters(prev => ({ ...prev, estado: e.target.value }))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los estados</option>
                <option value="Abierta">Abierta</option>
                <option value="En Revisión">En Revisión</option>
                <option value="Asignada">Asignada</option>
                <option value="En Proceso">En Proceso</option>
                <option value="Completada">Completada</option>
              </select>
              
              <select
                value={filters.urgencia}
                onChange={(e) => setFilters(prev => ({ ...prev, urgencia: e.target.value }))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las urgencias</option>
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>

              <button
                onClick={loadIncidents}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                🔄 Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Incidents Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inquilino</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apartamento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {incidentsData.incidencias && incidentsData.incidencias.length > 0 ? (
                  incidentsData.incidencias.map((incidencia) => (
                  <tr key={incidencia.idIncidencia} className="hover:bg-gray-50">
                    {/* Estado */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={incidencia.estado}
                        onChange={(e) => handleStatusChange(incidencia.idIncidencia, e.target.value)}
                        className={`text-xs font-semibold rounded-full px-3 py-1 border-0 focus:ring-2 focus:ring-blue-500 ${getStatusBadgeClass(incidencia.estado)}`}
                      >
                        <option value="Abierta">Abierta</option>
                        <option value="En Revisión">En Revisión</option>
                        <option value="Asignada">Asignada</option>
                        <option value="En Proceso">En Proceso</option>
                        <option value="Completada">Completada</option>
                      </select>
                    </td>
                    {/* Inquilino */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {incidencia.inquilino?.nombreCompleto || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {incidencia.inquilino?.telefono || ''}
                      </div>
                    </td>
                    {/* Apartamento */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Apt {incidencia.inquilino?.departamento?.numero || 'N/A'}
                      </div>
                    </td>
                    {/* Descripción */}
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {incidencia.tipoProblema}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {incidencia.descripcion}
                      </div>
                    </td>
                    {/* Prioridad */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyBadgeClass(incidencia.urgencia)}`}>
                        {incidencia.urgencia}
                      </span>
                    </td>
                    {/* Categoría */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {incidencia.categoria || '-'}
                    </td>
                    {/* Fecha */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(incidencia.fechaReporte)}
                    </td>
                    {/* Proveedor */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {incidencia.proveedor?.nombre || 'Sin asignar'}
                    </td>
                    {/* Acciones */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/admin/incidencias/${incidencia.idIncidencia}`}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors inline-block"
                        title="Ver detalles"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                  ))
                ) : null}
              </tbody>
            </table>
          </div>
          
          {incidentsData.incidencias.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏢</div>
              <p className="text-gray-500 text-lg">No hay incidencias reportadas</p>
              <p className="text-gray-400 mt-2">
                {filters.estado ? `No hay incidencias ${filters.estado.toLowerCase()}` : 'Las incidencias aparecerán aquí'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}