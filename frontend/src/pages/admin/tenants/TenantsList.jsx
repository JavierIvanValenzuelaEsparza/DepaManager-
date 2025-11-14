// frontend/src/pages/admin/tenants/TenantsList.jsx
import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../../services/api/admin';
import TenantForm from './TenantForm';
import { useNavigate, useLocation } from 'react-router-dom';

const TenantsList = () => {
  const location = useLocation();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [prefilledData, setPrefilledData] = useState(null); // ✅ Nuevo estado para datos prellenados
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const navigate = useNavigate();

  // ✅ Verificar si vienen datos prellenados desde postulantes
  useEffect(() => {
    if (location.state?.prefilledData) {
      setPrefilledData(location.state.prefilledData); // ✅ Guardar datos prellenados
      setEditingTenant(null); // ✅ Asegurar que NO es modo edición
      setShowForm(true);
      
      // Limpiar el state para que no se abra cada vez que se visite la página
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getTenants();
      if (response.data.success) {
        setTenants(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleCreateSuccess = () => {
    fetchTenants();
    setShowForm(false);
    setEditingTenant(null);
    setPrefilledData(null); // ✅ Limpiar datos prellenados
  };

  const handleEdit = (tenant) => {
    setEditingTenant(tenant);
    setPrefilledData(null); // ✅ Limpiar datos prellenados cuando se edita
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTenant(null);
    setPrefilledData(null); // ✅ Limpiar datos prellenados al cerrar
  };

  const handleDelete = async (tenantId, tenantName) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar al inquilino ${tenantName}? Esta acción no se puede deshacer.`)) {
      try {
        await adminAPI.deleteTenant(tenantId);
        fetchTenants();
      } catch (error) {
        alert(error.response?.data?.message || 'Error al eliminar inquilino');
      }
    }
  };

  const handleViewDetails = (tenantId) => {
    navigate(`/admin/tenants/${tenantId}`);
  };

  const handleViewDocuments = (tenantId) => {
    // Redirigir a la página de contratos filtrada por este inquilino
    navigate(`/admin/contratos?inquilino=${tenantId}`);
  };

  // Filtrar inquilinos
  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.nombreCompleto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.correo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.dni?.includes(searchTerm);
    const matchesStatus = statusFilter === 'Todos' || tenant.estado === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (estado) => {
    const statusConfig = {
      'Activo': 'bg-green-100 text-green-800 border border-green-200',
      'Pendiente': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      'Retirado': 'bg-red-100 text-red-800 border border-red-200'
    };
    return statusConfig[estado] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const getStatusIcon = (estado) => {
    const icons = {
      'Activo': '🟢',
      'Pendiente': '🟡',
      'Retirado': '🔴'
    };
    return icons[estado] || '⚪';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Inquilinos</h1>
          <p className="text-gray-600">Administra inquilinos y contratos de alquiler</p>
        </div>
        <button 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          onClick={() => setShowForm(true)}
        >
          <span>+</span>
          <span>Nuevo Inquilino</span>
        </button>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Inquilinos</h3>
              <p className="text-2xl font-bold text-gray-800 mt-1">{tenants.length}</p>
            </div>
            <div className="text-3xl text-blue-500">👥</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Activos</h3>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {tenants.filter(t => t.estado === 'Activo').length}
              </p>
            </div>
            <div className="text-3xl text-green-500">✅</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Pendientes</h3>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {tenants.filter(t => t.estado === 'Pendiente').length}
              </p>
            </div>
            <div className="text-3xl text-yellow-500">⏳</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Retirados</h3>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {tenants.filter(t => t.estado === 'Retirado').length}
              </p>
            </div>
            <div className="text-3xl text-red-500">🚪</div>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input 
              type="text" 
              placeholder="Buscar por nombre, correo o DNI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Todos">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Retirado">Retirado</option>
          </select>
        </div>
      </div>

      {/* Tabla de Inquilinos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Lista de Inquilinos {filteredTenants.length > 0 && `(${filteredTenants.length})`}
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inquilino
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Departamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contrato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTenants.map(tenant => (
                <tr key={tenant.idUsuario} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-sm font-medium">
                          {tenant.nombreCompleto?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{tenant.nombreCompleto}</div>
                        <div className="text-sm text-gray-500">{tenant.correo}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tenant.dni || '--'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="font-medium">{tenant.telefono || '--'}</div>
                    <div className="text-gray-500 text-xs">{tenant.correo}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tenant.departamento ? (
                      <div>
                        <span className="font-medium">Apt. {tenant.departamento.numero}</span>
                        <div className="text-gray-500 text-xs">
                          Piso {tenant.departamento.piso} • {tenant.departamento.edificio}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">--</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{getStatusIcon(tenant.estado)}</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(tenant.estado)}`}>
                        {tenant.estado}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tenant.contrato ? (
                      <div className="text-green-600 font-medium">Activo</div>
                    ) : (
                      <span className="text-gray-400">--</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {/* Ojito - Ver detalles */}
                      <button 
                        className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                        onClick={() => handleViewDetails(tenant.idUsuario)}
                        title="Ver detalles"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>

                      {/* Documento */}
                      <button 
                        className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                        onClick={() => handleViewDocuments(tenant.idUsuario)}
                        title="Documentos"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>

                      {/* Editar */}
                      <button 
                        className="text-yellow-600 hover:text-yellow-900 p-1 rounded transition-colors"
                        onClick={() => handleEdit(tenant)}
                        title="Editar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      {/* Eliminar */}
                      <button 
                        className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                        onClick={() => handleDelete(tenant.idUsuario, tenant.nombreCompleto)}
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

        {filteredTenants.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {tenants.length === 0 ? 'No hay inquilinos' : 'No se encontraron resultados'}
            </h3>
            <p className="text-gray-500 mb-4">
              {tenants.length === 0 
                ? 'Comienza agregando tu primer inquilino.' 
                : 'Intenta con otros términos de búsqueda.'
              }
            </p>
            {tenants.length === 0 && (
              <button 
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
                onClick={() => setShowForm(true)}
              >
                + Agregar Primer Inquilino
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal del Formulario */}
      <TenantForm
        isOpen={showForm}
        onClose={handleCloseForm}
        onSuccess={handleCreateSuccess}
        editData={editingTenant} // ✅ Solo se pasa cuando estamos editando
        prefilledData={prefilledData} // ✅ Nuevo prop para datos prellenados
      />
    </div>
  );
};

export default TenantsList;