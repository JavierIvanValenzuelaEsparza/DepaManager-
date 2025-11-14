import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tenantAPI } from '../../../services/api/tenant';

export default function TenantIncidentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIncidentDetails();
  }, [id]);

  const loadIncidentDetails = async () => {
    try {
      setLoading(true);
      const response = await tenantAPI.getIncidentDetails(id);
      
      if (response.success) {
        setIncident(response.data);
      }
    } catch (error) {
      console.error('Error cargando detalle de incidencia:', error);
      alert('Error al cargar los detalles');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (estado) => {
    switch (estado) {
      case 'Completada': return 'bg-green-100 text-green-800';
      case 'En Proceso': return 'bg-blue-100 text-blue-800';
      case 'Asignada': return 'bg-purple-100 text-purple-800';
      case 'En Revisión': return 'bg-yellow-100 text-yellow-800';
      case 'Abierta': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyBadgeClass = (urgencia) => {
    switch (urgencia) {
      case 'Alta': return 'bg-red-100 text-red-800';
      case 'Media': return 'bg-yellow-100 text-yellow-800';
      case 'Baja': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl">❌</span>
          <h2 className="text-2xl font-bold text-gray-900 mt-4">Incidencia no encontrada</h2>
          <button
            onClick={() => navigate('/tenant/incidencias')}
            className="mt-6 bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700"
          >
            Volver a Mis Incidencias
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/tenant/incidencias')}
            className="text-teal-600 hover:text-teal-700 mb-4 flex items-center gap-2"
          >
            ← Volver a Mis Incidencias
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Detalle de Incidencia</h1>
          <div className="flex gap-3 mt-3">
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getUrgencyBadgeClass(incident.urgencia)}`}>
              {incident.urgencia}
            </span>
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeClass(incident.estado)}`}>
              {incident.estado}
            </span>
          </div>
        </div>

        {/* Información Principal */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Información del Reporte</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Problema</label>
              <p className="text-lg font-semibold text-gray-900">{incident.tipoProblema}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <p className="text-gray-600 whitespace-pre-wrap">{incident.descripcion}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <p className="text-gray-600">{incident.categoria || 'General'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Reporte</label>
                <p className="text-gray-600">{formatDate(incident.fechaReporte)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Estado y Proveedor Asignado */}
        {(incident.proveedor || incident.mensajeAsignacion) && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Gestión del Administrador</h2>
            
            <div className="space-y-4">
              {incident.proveedor && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor Asignado</label>
                  <p className="text-gray-900 font-medium">{incident.proveedor.nombre}</p>
                  <p className="text-sm text-gray-500">{incident.proveedor.especialidad}</p>
                  <p className="text-sm text-gray-500">📞 {incident.proveedor.contacto}</p>
                </div>
              )}

              {incident.mensajeAsignacion && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje del Administrador</label>
                  <p className="text-gray-600 bg-blue-50 p-3 rounded-lg">{incident.mensajeAsignacion}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {incident.fechaCierre && (
          <div className="bg-green-50 rounded-xl shadow-sm p-6 border border-green-200">
            <h2 className="text-xl font-semibold text-green-900 mb-2">✅ Incidencia Completada</h2>
            <p className="text-green-700">Cerrada el {formatDate(incident.fechaCierre)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
