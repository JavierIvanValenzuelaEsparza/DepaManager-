// frontend/src/pages/admin/tenants/TenantForm.jsx
import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../../services/api/admin';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';

const TenantForm = ({ isOpen, onClose, onSuccess, editData = null, prefilledData = null }) => {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [departmentsError, setDepartmentsError] = useState('');
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    correo: '',
    contrasenia: '',
    telefono: '',
    dni: '',
    fechaNacimiento: '',
    idDepartamento: '',
    fechaInicioContrato: '',
    fechaFinContrato: '',
    montoMensual: ''
  });

  // ✅ Separar la lógica de edición y prellenado
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        // 📝 MODO EDICIÓN - Cargar datos del inquilino existente
        setFormData({
          nombreCompleto: editData.nombreCompleto || '',
          correo: editData.correo || '',
          contrasenia: '', // No mostrar contraseña al editar
          telefono: editData.telefono || '',
          dni: editData.dni || '',
          fechaNacimiento: editData.fechaNacimiento || '',
          idDepartamento: editData.idDepartamento || '',
          fechaInicioContrato: editData.fechaInicioContrato || '',
          fechaFinContrato: editData.fechaFinContrato || '',
          montoMensual: editData.montoMensual || ''
        });
      } else if (prefilledData) {
        // ✨ MODO NUEVO CON DATOS PRELLENADOS - Datos del postulante aprobado
        setFormData({
          nombreCompleto: prefilledData.nombreCompleto || prefilledData.nombre_completo || '',
          correo: prefilledData.correo || '',
          contrasenia: '', // Debe ingresar contraseña nueva
          telefono: prefilledData.telefono || '',
          dni: prefilledData.dni || '',
          fechaNacimiento: '',
          idDepartamento: '',
          fechaInicioContrato: '',
          fechaFinContrato: '',
          montoMensual: prefilledData.montoMensual || prefilledData.monto_alquiler || ''
        });
      } else {
        // 🆕 MODO NUEVO VACÍO
        setFormData({
          nombreCompleto: '',
          correo: '',
          contrasenia: '',
          telefono: '',
          dni: '',
          fechaNacimiento: '',
          idDepartamento: '',
          fechaInicioContrato: '',
          fechaFinContrato: '',
          montoMensual: ''
        });
      }
    }
  }, [editData, prefilledData, isOpen]);

  // Cargar departamentos disponibles
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        setDepartmentsLoading(true);
        setDepartmentsError('');
        console.log('🔄 Cargando departamentos disponibles...');
        
        const response = await adminAPI.getAvailableDepartments();
        console.log('📦 Respuesta de departamentos:', response.data);
        
        if (response.data.success) {
          let deptsList = response.data.data || [];
          
          // Si estamos editando y el inquilino tiene un departamento, agregarlo a la lista
          if (editData && editData.departamento) {
            const currentDept = editData.departamento;
            // Verificar si el departamento actual ya está en la lista
            const existsInList = deptsList.some(d => d.idDepartamento === currentDept.idDepartamento);
            
            if (!existsInList) {
              // Agregar el departamento actual al inicio de la lista
              deptsList = [currentDept, ...deptsList];
            }
          }
          
          setDepartments(deptsList);
          console.log(`✅ ${deptsList.length} departamentos cargados`);
        } else {
          setDepartmentsError('Error al cargar departamentos');
        }
      } catch (error) {
        console.error('❌ Error cargando departamentos:', error);
        setDepartmentsError('No se pudieron cargar los departamentos');
        setDepartments([]);
      } finally {
        setDepartmentsLoading(false);
      }
    };

    if (isOpen) {
      loadDepartments();
    }
  }, [isOpen, editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('📤 Enviando datos del inquilino:', formData);
      
      if (editData) {
        // Actualizar inquilino existente
        await adminAPI.updateTenant(editData.idUsuario, formData);
      } else {
        // Crear nuevo inquilino
        await adminAPI.createTenant(formData);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('❌ Error guardando inquilino:', error);
      alert(error.response?.data?.message || 'Error al guardar inquilino');
    } finally {
      setLoading(false);
    }
  };

  const calculateDuracionMeses = () => {
    if (formData.fechaInicioContrato && formData.fechaFinContrato) {
      const inicio = new Date(formData.fechaInicioContrato);
      const fin = new Date(formData.fechaFinContrato);
      const diffTime = Math.abs(fin - inicio);
      const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
      return diffMonths;
    }
    return 0;
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={editData ? 'Editar Inquilino' : 'Nuevo Inquilino'} // ✅ Título correcto
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ✅ Mostrar alerta cuando vienen datos prellenados */}
        {prefilledData && !editData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  📋 <strong>Datos prellenados desde el postulante aprobado</strong>
                  <br />
                  <span className="text-xs">Completa los campos faltantes para crear el nuevo inquilino.</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Información Personal */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Información Personal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                name="nombreCompleto"
                value={formData.nombreCompleto}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Juan Pérez García"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico *
              </label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: juan@correo.com"
              />
            </div>

            {!editData && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña * {prefilledData && <span className="text-red-500 text-xs">(Requerida)</span>}
                </label>
                <input
                  type="password"
                  name="contrasenia"
                  value={formData.contrasenia}
                  onChange={handleChange}
                  required={!editData}
                  minLength="6"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: +51 987654321"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DNI
              </label>
              <input
                type="text"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: 87654321"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Asignación de Departamento */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Asignación de Departamento</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Departamento
            </label>
            <select
              name="idDepartamento"
              value={formData.idDepartamento}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={departmentsLoading}
            >
              <option value="">Seleccionar departamento</option>
              {departmentsLoading && (
                <option value="" disabled>Cargando departamentos...</option>
              )}
              {!departmentsLoading && departments.length === 0 && (
                <option value="" disabled>No hay departamentos disponibles</option>
              )}
              {departments.map(dept => (
                <option key={dept.idDepartamento} value={dept.idDepartamento}>
                  {dept.numero} - Piso {dept.piso} - {dept.edificio?.nombre || 'Sin edificio'}
                </option>
              ))}
            </select>
            
            {departmentsError && (
              <p className="text-red-500 text-sm mt-1">{departmentsError}</p>
            )}
            
            {!departmentsLoading && departments.length === 0 && !departmentsError && (
              <p className="text-yellow-600 text-sm mt-1">
                No hay departamentos disponibles. Crea departamentos primero.
              </p>
            )}
            
            {departments.length > 0 && (
              <p className="text-green-600 text-sm mt-1">
                {departments.length} departamento(s) disponible(s)
              </p>
            )}
          </div>
        </div>

        {/* Información del Contrato */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Contrato</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Inicio
              </label>
              <input
                type="date"
                name="fechaInicioContrato"
                value={formData.fechaInicioContrato}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Fin
              </label>
              <input
                type="date"
                name="fechaFinContrato"
                value={formData.fechaFinContrato}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duración
              </label>
              <input
                type="text"
                value={`${calculateDuracionMeses()} meses`}
                disabled
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto Mensual (S/)
              </label>
              <input
                type="number"
                name="montoMensual"
                value={formData.montoMensual}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: 1500.00"
              />
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading || departmentsLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {loading ? 'Guardando...' : (editData ? 'Actualizar' : 'Crear Inquilino')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TenantForm;