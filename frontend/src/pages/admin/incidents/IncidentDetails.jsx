import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../../services/api/admin';

export default function IncidentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [providers, setProviders] = useState([]);
  const [formData, setFormData] = useState({
    estado: '',
    idProveedor: '',
    mensajeAsignacion: ''
  });

  useEffect(() => {
    loadIncidentDetails();
    loadProviders();
  }, [id]);

  const loadIncidentDetails = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getIncidentDetails(id);
      
      console.log('📦 Detalle de incidencia:', response);
      
      if (response.data && response.data.success) {
        setIncident(response.data.data);
        setFormData({
          estado: response.data.data.estado,
          idProveedor: response.data.data.idProveedor || '',
          mensajeAsignacion: response.data.data.mensajeAsignacion || ''
        });
      }
    } catch (error) {
      console.error('Error cargando detalle de incidencia:', error);
      alert('Error al cargar los detalles de la incidencia');
    } finally {
      setLoading(false);
    }
  };

  const loadProviders = async () => {
    try {
      const response = await adminAPI.getProviders();
      console.log('📦 Proveedores:', response);
      if (response.data && response.data.success) {
        setProviders(response.data.data || []);
      }
    } catch (error) {
      console.error('Error cargando proveedores:', error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      console.log('📤 Enviando actualización:', formData);
      const response = await adminAPI.updateIncident(id, formData);
      
      console.log('📦 Respuesta de actualización:', response);
      
      if (response.data && response.data.success) {
        alert('Incidencia actualizada correctamente');
        setIncident(response.data.data);
        navigate('/admin/incidencias');
      }
    } catch (error) {
      console.error('Error actualizando incidencia:', error);
      alert('Error al actualizar la incidencia');
    } finally {
      setUpdating(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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

  if (!incident) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Incidencia no encontrada</h1>
          <button 
            onClick={() => navigate('/admin/incidencias')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <button 
              onClick={() => navigate('/admin/incidencias')}
              className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
            >
              ← Volver a la lista
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Incidencia</h1>
            <p className="text-gray-600 mt-2">ID: {incident.id_incidencia}</p>
          </div>
          <div className="flex gap-3">
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getUrgencyBadgeClass(incident.urgencia)}`}>
              {incident.urgencia}
            </span>
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeClass(incident.estado)}`}>
              {incident.estado}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información de la Incidencia */}
          <div className="lg:col-span-2 space-y-6">
            {/* Detalles principales */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Detalles del Reporte</h2>
              
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
                    <p className="text-gray-600">{incident.categoria}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Reporte</label>
                    <p className="text-gray-600">{formatDate(incident.fechaReporte)}</p>
                  </div>
                </div>

                {incident.fechaCierre && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Cierre</label>
                    <p className="text-gray-600">{formatDate(incident.fechaCierre)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Información del Inquilino */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Información del Inquilino</h2>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <p className="text-gray-900 font-medium">{incident.inquilino?.nombreCompleto || 'N/A'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <p className="text-gray-600">{incident.inquilino?.telefono || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-600">{incident.inquilino?.correo || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                  <p className="text-gray-600">
                    {incident.inquilino?.departamento?.numero 
                      ? `Apartamento ${incident.inquilino.departamento.numero} - Piso ${incident.inquilino.departamento.piso}`
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Panel de Gestión */}
          <div className="space-y-6">
            <form onSubmit={handleUpdate} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Gestión de Incidencia</h2>
              
              <div className="space-y-4">
                {/* Estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Abierta">Abierta</option>
                    <option value="En Revisión">En Revisión</option>
                    <option value="Asignada">Asignada</option>
                    <option value="En Proceso">En Proceso</option>
                    <option value="Completada">Completada</option>
                  </select>
                </div>

                {/* Proveedor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Asignar Proveedor</label>
                  <select
                    name="idProveedor"
                    value={formData.idProveedor}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sin asignar</option>
                    {providers.map(provider => (
                      <option key={provider.idProveedor} value={provider.idProveedor}>
                        {provider.nombre} - {provider.especialidad}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mensaje */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje para el inquilino</label>
                  <textarea
                    name="mensaje_asignacion"
                    value={formData.mensaje_asignacion}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Información sobre la asignación o actualización del estado..."
                  />
                </div>

                {/* Botón */}
                <button
                  type="submit"
                  disabled={updating}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
                >
                  {updating ? 'Actualizando...' : '💾 Actualizar Incidencia'}
                </button>
              </div>
            </form>

            {/* Proveedor Asignado */}
            {incident.proveedor && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Proveedor Asignado</h2>
                
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">{incident.proveedor.nombre}</p>
                  <p className="text-gray-600">{incident.proveedor.especialidad}</p>
                  <p className="text-gray-600">{incident.proveedor.contacto}</p>
                  {incident.proveedor.telefono && (
                    <p className="text-gray-600">📞 {incident.proveedor.telefono}</p>
                  )}
                </div>
              </div>
            )}

            {/* Mensaje Actual */}
            {incident.mensaje_asignacion && (
              <div className="bg-blue-50 rounded-xl shadow-sm p-6 border border-blue-200">
                <h2 className="text-xl font-semibold text-blue-900 mb-2">Mensaje Actual</h2>
                <p className="text-blue-800 whitespace-pre-wrap">{incident.mensaje_asignacion}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}