// frontend/src/pages/admin/tenants/TenantDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../../services/api/admin';

const TenantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    const fetchTenantDetails = async () => {
      try {
        console.log('🔍 Cargando detalles del inquilino ID:', id);
        const response = await adminAPI.getTenantDetails(id);
        console.log('📦 Respuesta recibida:', response.data);
        if (response.data.success) {
          console.log('✅ Datos del inquilino:', response.data.data);
          setTenant(response.data.data);
        } else {
          console.error('❌ Error al cargar detalles del inquilino');
        }
      } catch (error) {
        console.error('❌ Error en la petición:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTenantDetails();
  }, [id]);

  const getStatusBadge = (estado) => {
    const statusConfig = {
      'Activo': 'bg-green-100 text-green-800 border border-green-200',
      'Pendiente': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      'Retirado': 'bg-red-100 text-red-800 border border-red-200'
    };
    return statusConfig[estado] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">😕</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Inquilino no encontrado</h3>
        <button 
          onClick={() => navigate('/admin/tenants')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/tenants')}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{tenant.nombreCompleto}</h1>
            <p className="text-gray-600">Detalles del inquilino</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadge(tenant.estado)}`}>
            {tenant.estado}
          </span>
        </div>
      </div>

      {/* Pestañas */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'info'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Información General
            </button>
            <button
              onClick={() => setActiveTab('contract')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'contract'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Contrato
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'payments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Pagos
            </button>
          </nav>
        </div>

        {/* Contenido de las pestañas */}
        <div className="p-6">
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información Personal */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Información Personal</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nombre Completo</label>
                    <p className="text-gray-900">{tenant.nombreCompleto}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Correo Electrónico</label>
                    <p className="text-gray-900">{tenant.correo}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Teléfono</label>
                    <p className="text-gray-900">{tenant.telefono || '--'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">DNI</label>
                    <p className="text-gray-900">{tenant.dni || '--'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Fecha de Nacimiento</label>
                    <p className="text-gray-900">{formatDate(tenant.fechaNacimiento)}</p>
                  </div>
                </div>
              </div>

              {/* Información del Departamento */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Departamento Asignado</h3>
                {tenant.departamento ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Número</label>
                      <p className="text-gray-900 font-medium">Apt. {tenant.departamento.numero}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Piso</label>
                      <p className="text-gray-900">Piso {tenant.departamento.piso}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Metros Cuadrados</label>
                      <p className="text-gray-900">{tenant.departamento.metrosCuadrados || '--'} m²</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Edificio</label>
                      <p className="text-gray-900">{tenant.departamento.edificio?.nombre || '--'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Dirección</label>
                      <p className="text-gray-900">{tenant.departamento.edificio?.direccion || '--'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No tiene departamento asignado</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'contract' && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Información del Contrato</h3>
              {tenant.contratos && tenant.contratos.length > 0 ? (
                tenant.contratos.map(contract => (
                  <div key={contract.idContrato} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Estado del Contrato</label>
                        <p className="text-gray-900 font-medium">{contract.estado}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Fecha de Inicio</label>
                        <p className="text-gray-900">{formatDate(contract.fechaInicio)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Fecha de Fin</label>
                        <p className="text-gray-900">{formatDate(contract.fechaFin)}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Monto Mensual</label>
                        <p className="text-gray-900 font-medium">S/ {contract.montoMensual}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Departamento</label>
                        <p className="text-gray-900">
                          {contract.departamento ? `Apt. ${contract.departamento.numero}` : '--'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No tiene contratos activos</p>
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Historial de Pagos</h3>
              {tenant.pagos && tenant.pagos.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Concepto</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Monto</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Fecha Vencimiento</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {tenant.pagos.map(pago => (
                        <tr key={pago.idPago}>
                          <td className="px-4 py-3 text-sm text-gray-900">{pago.concepto}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">S/ {pago.monto}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{formatDate(pago.fechaVencimiento)}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              pago.estado === 'Pagado' ? 'bg-green-100 text-green-800' :
                              pago.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {pago.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No hay historial de pagos</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantDetails;