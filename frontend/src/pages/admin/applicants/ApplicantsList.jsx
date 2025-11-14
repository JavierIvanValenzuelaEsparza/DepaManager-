import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../../services/api/admin';
import ApplicantsForm from './ApplicantsForm';
import { useNavigate } from 'react-router-dom';

const ApplicantsList = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingApplicant, setEditingApplicant] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const navigate = useNavigate();

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getApplicants();
      if (response.data.success) {
        setApplicants(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching applicants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const handleCreateSuccess = () => {
    fetchApplicants();
    setShowForm(false);
    setEditingApplicant(null);
  };

  const handleEdit = (applicant) => {
    setEditingApplicant(applicant);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingApplicant(null);
  };

  const handleDelete = async (applicantId, applicantName) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar al postulante ${applicantName}? Esta acción no se puede deshacer.`)) {
      try {
        await adminAPI.deleteApplicant(applicantId);
        fetchApplicants();
      } catch (error) {
        alert(error.response?.data?.message || 'Error al eliminar postulante');
      }
    }
  };

  const handleViewDetails = (applicantId) => {
    navigate(`/admin/applicants/${applicantId}`);
  };

  // Filtrar postulantes
  const filteredApplicants = applicants.filter(applicant => {
    const matchesSearch = applicant.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         applicant.correo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         applicant.dni?.includes(searchTerm);
    const matchesStatus = statusFilter === 'Todos' || applicant.estado === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (estado) => {
    const statusConfig = {
      'Aprobado': 'bg-green-100 text-green-800 border border-green-200',
      'Rechazado': 'bg-red-100 text-red-800 border border-red-200',
      'Pendiente': 'bg-yellow-100 text-yellow-800 border border-yellow-200'
    };
    return statusConfig[estado] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const getStatusIcon = (estado) => {
    const icons = {
      'Aprobado': '✅',
      'Rechazado': '❌',
      'Pendiente': '⏳'
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
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Postulantes</h1>
          <p className="text-gray-600">Administra postulantes para departamentos</p>
        </div>
        <button 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          onClick={() => setShowForm(true)}
        >
          <span>+</span>
          <span>Nuevo Postulante</span>
        </button>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Postulantes</h3>
              <p className="text-2xl font-bold text-gray-800 mt-1">{applicants.length}</p>
            </div>
            <div className="text-3xl text-blue-500">📋</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Pendientes</h3>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {applicants.filter(a => a.estado === 'Pendiente').length}
              </p>
            </div>
            <div className="text-3xl text-yellow-500">⏳</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Aprobados</h3>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {applicants.filter(a => a.estado === 'Aprobado').length}
              </p>
            </div>
            <div className="text-3xl text-green-500">✅</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Rechazados</h3>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {applicants.filter(a => a.estado === 'Rechazado').length}
              </p>
            </div>
            <div className="text-3xl text-red-500">❌</div>
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
            <option value="Pendiente">Pendiente</option>
            <option value="Aprobado">Aprobado</option>
            <option value="Rechazado">Rechazado</option>
          </select>
        </div>
      </div>

      {/* Tabla de Postulantes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Lista de Postulantes {filteredApplicants.length > 0 && `(${filteredApplicants.length})`}
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Postulante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Depto. Deseado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ocupación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplicants.map(applicant => (
                <tr key={applicant.id_postulante} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 text-sm font-medium">
                          {applicant.nombre_completo?.charAt(0) || 'P'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{applicant.nombre_completo}</div>
                        <div className="text-sm text-gray-500">{applicant.correo}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {applicant.dni || '--'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="font-medium">{applicant.telefono || '--'}</div>
                    <div className="text-gray-500 text-xs">{applicant.red_social || '--'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="font-medium">{applicant.departamento_deseado || '--'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {applicant.ocupacion || '--'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {applicant.monto_alquiler ? `S/ ${parseFloat(applicant.monto_alquiler).toFixed(2)}` : '--'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{getStatusIcon(applicant.estado)}</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(applicant.estado)}`}>
                        {applicant.estado}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(applicant.fecha_postulacion).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {/* Ver detalles */}
                      <button 
                        className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                        onClick={() => handleViewDetails(applicant.id_postulante)}
                        title="Ver detalles"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>

                      {/* Editar */}
                      <button 
                        className="text-yellow-600 hover:text-yellow-900 p-1 rounded transition-colors"
                        onClick={() => handleEdit(applicant)}
                        title="Editar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      {/* Eliminar */}
                      <button 
                        className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                        onClick={() => handleDelete(applicant.id_postulante, applicant.nombre_completo)}
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

        {filteredApplicants.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {applicants.length === 0 ? 'No hay postulantes' : 'No se encontraron resultados'}
            </h3>
            <p className="text-gray-500 mb-4">
              {applicants.length === 0 
                ? 'Comienza agregando tu primer postulante.' 
                : 'Intenta con otros términos de búsqueda.'
              }
            </p>
            {applicants.length === 0 && (
              <button 
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
                onClick={() => setShowForm(true)}
              >
                + Agregar Primer Postulante
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal del Formulario */}
      <ApplicantsForm
        isOpen={showForm}
        onClose={handleCloseForm}
        onSuccess={handleCreateSuccess}
        editData={editingApplicant}
      />
    </div>
  );
};

export default ApplicantsList;