import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../../services/api/admin';
import DepartmentForm from './DepartmentForm';
import DepartmentDetails from './DepartmentDetails';
import Modal from '../../../components/ui/Modal';

// Componente para crear departamentos en lote (mantener el existente)
const DepartmentBatchForm = ({ onClose, onSuccess }) => {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    idEdificio: '',
    numeroPisos: '6',
    desdeNumero: '101', 
    hastaNumero: '124',
    departamentosPorPiso: '4'
  });

  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    try {
      const response = await adminAPI.getBuildings();
      if (response.data.success) {
        setBuildings(response.data.data);
        if (response.data.data.length > 0) {
          setFormValues(prev => ({
            ...prev,
            idEdificio: response.data.data[0].idEdificio.toString()
          }));
        }
      }
    } catch (error) {
      console.error('Error cargando edificios:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (value === '' || /^\d*$/.test(value)) {
      setFormValues(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { idEdificio, numeroPisos, desdeNumero, hastaNumero, departamentosPorPiso } = formValues;
    
    if (!idEdificio || !numeroPisos || !desdeNumero || !hastaNumero || !departamentosPorPiso) {
      alert('❌ Todos los campos son requeridos');
      return;
    }

    setLoading(true);

    const dataToSend = {
      idEdificio,
      numeroPisos: parseInt(numeroPisos) || 0,
      desdeNumero: parseInt(desdeNumero) || 0,
      hastaNumero: parseInt(hastaNumero) || 0,
      departamentosPorPiso: parseInt(departamentosPorPiso) || 0
    };

    try {
      const response = await adminAPI.createDepartmentsBatch(dataToSend);
      
      if (response.data.success) {
        onSuccess(response.data.data);
      } else {
        alert(response.data.message || 'Error al crear departamentos');
      }
    } catch (error) {
      console.error('Error creando departamentos:', error);
      alert(error.response?.data?.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const calcularTotalDepartamentos = () => {
    const numPisos = formValues.numeroPisos === '' ? 0 : parseInt(formValues.numeroPisos) || 0;
    const numPorPiso = formValues.departamentosPorPiso === '' ? 0 : parseInt(formValues.departamentosPorPiso) || 0;
    const total = numPisos * numPorPiso;
    return isNaN(total) ? 0 : total;
  };

  return (
    <Modal 
      isOpen={true} 
      onClose={onClose} 
      title="Crear Departamentos en Lote"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Edificio
          </label>
          <select
            name="idEdificio"
            value={formValues.idEdificio}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          >
            <option value="">Seleccionar edificio</option>
            {buildings.map(building => (
              <option key={building.idEdificio} value={building.idEdificio}>
                {building.nombre} - {building.direccion}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Pisos
            </label>
            <input
              type="text"
              name="numeroPisos"
              value={formValues.numeroPisos}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="ej: 6"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deptos por Piso
            </label>
            <input
              type="text"
              name="departamentosPorPiso"
              value={formValues.departamentosPorPiso}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="ej: 4"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Desde Número
            </label>
            <input
              type="text"
              name="desdeNumero"
              value={formValues.desdeNumero}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="ej: 101"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hasta Número
            </label>
            <input
              type="text"
              name="hastaNumero"
              value={formValues.hastaNumero}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="ej: 124"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Total de departamentos a crear:</strong> {calcularTotalDepartamentos()}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            {formValues.numeroPisos} pisos × {formValues.departamentosPorPiso} deptos/piso
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Creando...' : 'Confirmar y Crear Departamentos'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Componente principal DepartmentsList ACTUALIZADO
const DepartmentsList = () => {
  const [departments, setDepartments] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // Estados para filtros y paginación
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = async () => {
    try {
      console.log('🔄 Cargando edificios y departamentos...');
      
      const [deptsResponse, bldgsResponse] = await Promise.all([
        adminAPI.getDepartments(),
        adminAPI.getBuildings()
      ]);

      if (deptsResponse.data.success) {
        console.log('📦 Departamentos cargados:', deptsResponse.data.data.length);
        setDepartments(deptsResponse.data.data);
      }
      
      if (bldgsResponse.data.success) {
        console.log('🏢 Edificios recibidos:', bldgsResponse.data.data.length);
        setBuildings(bldgsResponse.data.data);
      }
    } catch (err) {
      console.error('❌ Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ FUNCIONES CRUD ACTUALIZADAS
  const handleViewDetails = async (department) => {
    try {
      const response = await adminAPI.getDepartmentDetails(department.idDepartamento);
      if (response.data.success) {
        setSelectedDepartment(response.data.data);
        setShowDetails(true);
      }
    } catch (error) {
      console.error('Error cargando detalles:', error);
      alert('Error al cargar detalles del departamento');
    }
  };

  const handleEdit = (department) => {
    setSelectedDepartment(department);
    setShowEditForm(true);
  };

  const handleDelete = async (departmentId) => {
    try {
      const response = await adminAPI.deleteDepartment(departmentId);
      if (response.data.success) {
        alert('✅ Departamento eliminado exitosamente');
        setDeleteConfirm(null);
        fetchData(); // Recargar datos
      } else {
        alert(response.data.message || 'Error al eliminar departamento');
      }
    } catch (error) {
      console.error('Error eliminando departamento:', error);
      alert(error.response?.data?.message || 'Error de conexión');
    }
  };

  const handleUpdateSuccess = (updatedDepartment) => {
    setShowEditForm(false);
    setSelectedDepartment(null);
    fetchData(); // Recargar datos
    alert('✅ Departamento actualizado exitosamente');
  };

  const handleCreateSuccess = (newDepartments) => {
    setShowBatchForm(false);
    fetchData(); // Recargar datos
    alert(`✅ Se crearon ${newDepartments.length} departamentos exitosamente`);
  };

  const getBuildingName = (buildingId) => {
    const building = buildings.find(b => b.idEdificio === buildingId);
    return building ? building.nombre : 'N/A';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Disponible': 'bg-green-100 text-green-800',
      'Ocupado': 'bg-blue-100 text-blue-800', 
      'En Mantenimiento': 'bg-yellow-100 text-yellow-800'
    };
    return statusConfig[status] || 'bg-gray-100 text-gray-800';
  };

  // Lógica de filtrado y paginación
  const filteredDepartments = departments.filter(dept => {
    const matchBuilding = !selectedBuilding || dept.idEdificio === parseInt(selectedBuilding);
    const matchStatus = !selectedStatus || dept.estado === selectedStatus;
    return matchBuilding && matchStatus;
  });

  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDepartments = filteredDepartments.slice(startIndex, endIndex);

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleBuildingFilter = (e) => {
    setSelectedBuilding(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1);
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
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Departamentos</h1>
          <p className="text-gray-600">
            {buildings.length > 0 
              ? `Administrando ${buildings.length} edificio(s)` 
              : 'Configura tu primer edificio'}
          </p>
        </div>
        <button 
          onClick={() => setShowBatchForm(true)}
          disabled={buildings.length === 0}
          className={`px-4 py-2 rounded-lg transition-colors ${
            buildings.length === 0
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {buildings.length === 0 ? 'Crea un edificio primero' : '+ Crear en Lote'}
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex gap-4">
          <select 
            value={selectedBuilding}
            onChange={handleBuildingFilter}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los edificios</option>
            {buildings.map(building => (
              <option key={building.idEdificio} value={building.idEdificio}>
                {building.nombre}
              </option>
            ))}
          </select>
          <select 
            value={selectedStatus}
            onChange={handleStatusFilter}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="Disponible">Disponible</option>
            <option value="Ocupado">Ocupado</option>
            <option value="En Mantenimiento">En Mantenimiento</option>
          </select>
          <div className="flex items-center text-sm text-gray-600 ml-auto">
            Mostrando {paginatedDepartments.length} de {filteredDepartments.length} departamentos
          </div>
        </div>
      </div>

      {/* Tabla de Departamentos ACTUALIZADA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Lista de Departamentos</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Departamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Edificio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Piso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inquilino
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedDepartments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No hay departamentos para mostrar
                  </td>
                </tr>
              ) : (
                paginatedDepartments.map(dept => (
                  <tr key={dept.idDepartamento} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">Apt. {dept.numero}</div>
                      <div className="text-sm text-gray-500">{dept.habitaciones} hab. · {dept.banios} baño(s)</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getBuildingName(dept.idEdificio)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Piso {dept.piso}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(dept.estado)}`}>
                        {dept.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {dept.inquilino ? dept.inquilino.nombreCompleto : '--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {/* Ver detalles */}
                        <button 
                          onClick={() => handleViewDetails(dept)}
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
                          onClick={() => handleEdit(dept)}
                          className="text-yellow-600 hover:text-yellow-900 p-1 rounded transition-colors"
                          title="Editar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        
                        {/* Eliminar */}
                        <button 
                          onClick={() => setDeleteConfirm(dept.idDepartamento)}
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {filteredDepartments.length > itemsPerPage && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Página {currentPage} de {totalPages} · Total: {filteredDepartments.length} departamentos
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-lg ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Anterior
              </button>
              
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => goToPage(pageNumber)}
                      className={`px-3 py-1 rounded-lg ${
                        currentPage === pageNumber
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                } else if (
                  pageNumber === currentPage - 2 ||
                  pageNumber === currentPage + 2
                ) {
                  return <span key={pageNumber} className="px-2">...</span>;
                }
                return null;
              })}
              
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-lg ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      {showBatchForm && (
        <DepartmentBatchForm 
          onClose={() => setShowBatchForm(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {showEditForm && selectedDepartment && (
        <DepartmentForm 
          department={selectedDepartment}
          isOpen={showEditForm}
          onClose={() => {
            setShowEditForm(false);
            setSelectedDepartment(null);
          }}
          onSuccess={handleUpdateSuccess}
        />
      )}

      {showDetails && selectedDepartment && (
        <DepartmentDetails 
          department={selectedDepartment}
          isOpen={showDetails}
          onClose={() => {
            setShowDetails(false);
            setSelectedDepartment(null);
          }}
        />
      )}

      {/* Modal de confirmación para eliminar */}
      {deleteConfirm && (
        <Modal 
          isOpen={true} 
          onClose={() => setDeleteConfirm(null)} 
          title="Confirmar Eliminación"
          size="sm"
        >
          <div className="text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">¿Estás seguro?</h3>
            <p className="text-gray-600 mb-6">
              Esta acción no se puede deshacer. El departamento será eliminado permanentemente.
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DepartmentsList;