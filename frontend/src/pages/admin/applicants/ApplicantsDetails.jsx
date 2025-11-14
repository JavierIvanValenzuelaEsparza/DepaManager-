import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../../services/api/admin';

const ApplicantsDetails = () => {
  const { applicantId } = useParams();
  const navigate = useNavigate();
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [showCreateTenantModal, setShowCreateTenantModal] = useState(false);

  useEffect(() => {
    const fetchApplicantDetails = async () => {
      try {
        const response = await adminAPI.getApplicantDetails(applicantId);
        if (response.data.success) {
          setApplicant(response.data.data);
        } else {
          console.error('Error al cargar detalles del postulante');
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicantDetails();
  }, [applicantId]);

  const handleStatusChange = async (newStatus) => {
    try {
      await adminAPI.updateApplicantStatus(applicantId, newStatus);
      
      // Recargar datos
      const response = await adminAPI.getApplicantDetails(applicantId);
      if (response.data.success) {
        setApplicant(response.data.data);
      }

      // Si el estado es "Aprobado", mostrar modal para crear inquilino
      if (newStatus === 'Aprobado') {
        setShowCreateTenantModal(true);
      } else {
        alert(`Estado actualizado a: ${newStatus}`);
      }
    } catch (error) {
      console.error('Error actualizando estado:', error);
      alert('Error al actualizar el estado');
    }
  };

  const handleCreateTenant = () => {
    // Navegar al formulario de creación de inquilino con los datos del postulante
    navigate('/admin/tenants', { 
      state: { 
        prefilledData: {
          nombreCompleto: applicant.nombre_completo,
          correo: applicant.correo,
          telefono: applicant.telefono,
          dni: applicant.dni,
          departamento_deseado: applicant.departamento_deseado,
          monto_alquiler: applicant.monto_alquiler
        }
      }
    });
  };

  const getStatusBadge = (estado) => {
    const statusConfig = {
      'Aprobado': 'bg-green-100 text-green-800 border border-green-200',
      'Rechazado': 'bg-red-100 text-red-800 border border-red-200',
      'Pendiente': 'bg-yellow-100 text-yellow-800 border border-yellow-200'
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

  if (!applicant) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">😕</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Postulante no encontrado</h3>
        <button 
          onClick={() => navigate('/admin/applicants')}
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
            onClick={() => navigate('/admin/applicants')}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{applicant.nombre_completo}</h1>
            <p className="text-gray-600">Detalles del postulante</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadge(applicant.estado)}`}>
            {applicant.estado}
          </span>
          {applicant.estado === 'Pendiente' && (
            <>
              <button
                onClick={() => handleStatusChange('Aprobado')}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Aprobar
              </button>
              <button
                onClick={() => handleStatusChange('Rechazado')}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Rechazar
              </button>
            </>
          )}
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
              onClick={() => setActiveTab('observations')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'observations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Observaciones
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
                    <p className="text-gray-900">{applicant.nombre_completo}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">DNI</label>
                    <p className="text-gray-900">{applicant.dni || '--'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Teléfono</label>
                    <p className="text-gray-900">{applicant.telefono || '--'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Correo Electrónico</label>
                    <p className="text-gray-900">{applicant.correo || '--'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Red Social</label>
                    <p className="text-gray-900">{applicant.red_social || '--'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Ocupación</label>
                    <p className="text-gray-900">{applicant.ocupacion || '--'}</p>
                  </div>
                </div>
              </div>

              {/* Información del Departamento */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Información del Departamento</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Departamento Deseado</label>
                    <p className="text-gray-900 font-medium">{applicant.departamento_deseado || '--'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Monto Alquiler</label>
                    <p className="text-gray-900">
                      {applicant.monto_alquiler ? `S/ ${parseFloat(applicant.monto_alquiler).toFixed(2)}` : '--'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Fecha de Postulación</label>
                    <p className="text-gray-900">{formatDate(applicant.fecha_postulacion)}</p>
                  </div>
                  {applicant.fecha_aprobacion && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Fecha de Aprobación</label>
                      <p className="text-gray-900">{formatDate(applicant.fecha_aprobacion)}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-600">Estado</label>
                    <p className="text-gray-900">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(applicant.estado)}`}>
                        {applicant.estado}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'observations' && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Observaciones</h3>
              {applicant.observaciones ? (
                <div className="bg-white p-4 rounded border border-gray-200">
                  <p className="text-gray-900 whitespace-pre-wrap">{applicant.observaciones}</p>
                </div>
              ) : (
                <p className="text-gray-500">No hay observaciones registradas</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmación para Crear Inquilino */}
      {showCreateTenantModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                ¡Postulante Aprobado!
              </h3>
              <p className="text-sm text-gray-500">
                El postulante <strong>{applicant.nombre_completo}</strong> ha sido aprobado exitosamente.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    ¿Deseas crear un nuevo inquilino con los datos de este postulante?
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateTenantModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                No, cerrar
              </button>
              <button
                onClick={handleCreateTenant}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Sí, crear inquilino
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantsDetails;