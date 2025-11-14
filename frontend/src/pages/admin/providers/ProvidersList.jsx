import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../../services/api/admin';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';

const ProvidersList = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [viewingProvider, setViewingProvider] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    especialidad: '',
    contacto: '',
    ubicacion: '',
    disponibilidad: 'Disponible',
    rating: 0.00,
    servicios: ''
  });

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Cargando proveedores...');
      
      const response = await adminAPI.getProviders();
      console.log('📦 Respuesta de proveedores:', response.data);
      
      // Manejo seguro de la respuesta (axios retorna response.data)
      if (response.data && response.data.success) {
        setProviders(response.data.data || []);
      } else {
        setError(response.data?.message || 'Error al cargar proveedores');
      }
    } catch (error) {
      console.error('❌ Error loading providers:', error);
      // Manejo mejorado de errores
      if (error.response?.status === 401) {
        setError('Sesión expirada. Redirigiendo...');
        // El interceptor ya maneja la redirección automáticamente
      } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network')) {
        setError('Error de conexión. Verifica tu internet e intenta nuevamente.');
      } else {
        const errorMsg = error.response?.data?.message || error.message || 'Error al cargar proveedores';
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      let response;
      
      if (editingProvider) {
        console.log('📝 Actualizando proveedor:', editingProvider.idProveedor);
        response = await adminAPI.updateProvider(editingProvider.idProveedor, formData);
        if (response.data.success) {
          alert('Proveedor actualizado exitosamente');
        } else {
          throw new Error(response.data.message || 'Error al actualizar proveedor');
        }
      } else {
        console.log('🆕 Creando nuevo proveedor');
        response = await adminAPI.createProvider(formData);
        if (response.data.success) {
          alert('Proveedor creado exitosamente');
        } else {
          throw new Error(response.data.message || 'Error al crear proveedor');
        }
      }
      
      setShowModal(false);
      setEditingProvider(null);
      setFormData({
        nombre: '',
        especialidad: '',
        contacto: '',
        ubicacion: '',
        disponibilidad: 'Disponible',
        rating: 0.00,
        servicios: ''
      });
      loadProviders();
    } catch (error) {
      console.error('❌ Error saving provider:', error);
      if (error.response?.status === 401) {
        setError('Sesión expirada');
      } else {
        const errorMsg = error.response?.data?.message || error.message || 'Error al guardar proveedor';
        setError(errorMsg);
        alert(errorMsg);
      }
    }
  };

  const handleEdit = (provider) => {
    console.log('✏️ Editando proveedor:', provider);
    setEditingProvider(provider);
    setFormData({
      nombre: provider.nombre,
      especialidad: provider.especialidad,
      contacto: provider.contacto,
      ubicacion: provider.ubicacion || '',
      disponibilidad: provider.disponibilidad,
      rating: provider.rating,
      servicios: provider.servicios || ''
    });
    setShowModal(true);
  };

  const handleView = (provider) => {
    console.log('👁️ Viendo proveedor:', provider);
    setViewingProvider(provider);
    setShowViewModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este proveedor?')) {
      try {
        setError(null);
        console.log('🗑️ Eliminando proveedor:', id);
        const response = await adminAPI.deleteProvider(id);
        if (response.data.success) {
          alert('Proveedor eliminado exitosamente');
          loadProviders();
        } else {
          throw new Error(response.data.message || 'Error al eliminar proveedor');
        }
      } catch (error) {
        console.error('❌ Error deleting provider:', error);
        if (error.response?.status === 401) {
          setError('Sesión expirada');
        } else {
          const errorMsg = error.response?.data?.message || error.message || 'Error al eliminar proveedor';
          setError(errorMsg);
          alert(errorMsg);
        }
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Disponible': 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs',
      'Ocupado': 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs'
    };
    
    return (
      <span className={statusClasses[status] || 'bg-gray-100 px-2 py-1 rounded-full text-xs'}>
        {status}
      </span>
    );
  };

  const getRatingStars = (rating) => {
    const numericRating = parseFloat(rating) || 0;
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      if (i <= numericRating) {
        stars.push(<span key={i} className="text-yellow-400">★</span>);
      } else {
        stars.push(<span key={i} className="text-gray-300">★</span>);
      }
    }
    
    return stars;
  };

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Cargando proveedores...</div>
      </div>
    );
  }

  // Mostrar error
  if (error && !error.includes('Sesión expirada')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <h2 className="font-bold">Error</h2>
          <p>{error}</p>
          <Button onClick={loadProviders} className="mt-2">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Agenda de Proveedores</h1>
        <Button 
          onClick={() => {
            setEditingProvider(null);
            setFormData({
              nombre: '',
              especialidad: '',
              contacto: '',
              ubicacion: '',
              disponibilidad: 'Disponible',
              rating: 0.00,
              servicios: ''
            });
            setShowModal(true);
          }}
        >
          + Nuevo Proveedor
        </Button>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-600">Total Proveedores</h3>
          <p className="text-2xl font-bold">{providers.length}</p>
          <p className="text-sm text-gray-500">Registrados</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-600">Disponibles</h3>
          <p className="text-2xl font-bold">
            {providers.filter(p => p.disponibilidad === 'Disponible').length}
          </p>
          <p className="text-sm text-gray-500">Listos para trabajo</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-600">Citas Hoy</h3>
          <p className="text-2xl font-bold">0</p>
          <p className="text-sm text-gray-500">Programadas</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-gray-600">Completadas Hoy</h3>
          <p className="text-2xl font-bold">0</p>
          <p className="text-sm text-gray-500">Finalizadas</p>
        </Card>
      </div>

      {/* Providers Table */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Proveedores Registrados</h2>
        
        {providers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No hay proveedores registrados</p>
            <Button 
              onClick={() => setShowModal(true)}
              className="mt-4"
            >
              Crear Primer Proveedor
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proveedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Especialidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Disponibilidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Servicios
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {providers.map((provider) => (
                  <tr key={provider.idProveedor}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {provider.nombre}
                        </div>
                        <div className="text-sm text-gray-500">
                          {provider.fechaCreacion ? new Date(provider.fechaCreacion).toLocaleDateString('es-PE') : 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {provider.especialidad}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {provider.contacto}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {provider.ubicacion || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(provider.disponibilidad)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="mr-1 flex">
                          {getRatingStars(provider.rating)}
                        </span>
                        <span className="text-sm text-gray-600 ml-1">
                          ({parseFloat(provider.rating).toFixed(1)})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {provider.servicios || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {/* Ver detalles */}
                        <button 
                          onClick={() => handleView(provider)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                          title="Ver detalles"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>

                        {/* Editar */}
                        <button 
                          onClick={() => handleEdit(provider)}
                          className="text-yellow-600 hover:text-yellow-900 p-1 rounded transition-colors"
                          title="Editar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>

                        {/* Eliminar */}
                        <button 
                          onClick={() => handleDelete(provider.idProveedor)}
                          className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                          title="Eliminar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal para crear/editar proveedor */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingProvider ? 'Editar Proveedor' : 'Nuevo Proveedor'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Nombre del proveedor"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Especialidad
            </label>
            <input
              type="text"
              name="especialidad"
              value={formData.especialidad}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Especialidad del proveedor"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contacto
            </label>
            <input
              type="text"
              name="contacto"
              value={formData.contacto}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Teléfono o email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ubicación
            </label>
            <input
              type="text"
              name="ubicacion"
              value={formData.ubicacion}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Dirección del proveedor"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Disponibilidad
            </label>
            <select
              name="disponibilidad"
              value={formData.disponibilidad}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="Disponible">Disponible</option>
              <option value="Ocupado">Ocupado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rating
            </label>
            <input
              type="number"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              min="0"
              max="5"
              step="0.1"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Servicios
            </label>
            <textarea
              name="servicios"
              value={formData.servicios}
              onChange={handleChange}
              rows="3"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Descripción de servicios ofrecidos"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowModal(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {editingProvider ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal para ver detalles del proveedor (solo lectura) */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Detalles del Proveedor"
      >
        {viewingProvider && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <p className="text-gray-900 font-medium">{viewingProvider.nombre}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad</label>
                <p className="text-gray-900">{viewingProvider.especialidad}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contacto</label>
                <p className="text-gray-900">{viewingProvider.contacto}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                <p className="text-gray-900">{viewingProvider.ubicacion || 'N/A'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilidad</label>
                {getStatusBadge(viewingProvider.disponibilidad)}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <div className="flex items-center">
                  <span className="mr-1 flex">
                    {getRatingStars(viewingProvider.rating)}
                  </span>
                  <span className="text-sm text-gray-600 ml-1">
                    ({parseFloat(viewingProvider.rating).toFixed(1)})
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Servicios</label>
              <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
                {viewingProvider.servicios || 'Sin descripción'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                viewingProvider.estado === 'Activo' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {viewingProvider.estado}
              </span>
            </div>

            {viewingProvider.fechaCreacion && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Registro</label>
                <p className="text-gray-600">
                  {new Date(viewingProvider.fechaCreacion).toLocaleDateString('es-PE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t">
              <Button
                variant="secondary"
                onClick={() => setShowViewModal(false)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProvidersList;