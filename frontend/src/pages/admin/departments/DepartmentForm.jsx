// frontend/src/pages/admin/departments/DepartmentForm.jsx
import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../../services/api/admin';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';

const DepartmentForm = ({ isOpen, onClose, onSuccess, editData = null, department = null }) => {
  const [loading, setLoading] = useState(false);
  const [buildings, setBuildings] = useState([]);
  const [formData, setFormData] = useState({
    numero: '',
    piso: '',
    metrosCuadrados: '',
    habitaciones: 1,
    banios: 1,
    idEdificio: '',
    estado: 'Disponible'
  });

  // Cargar edificios
  useEffect(() => {
    const loadBuildings = async () => {
      try {
        const response = await adminAPI.getBuildings();
        if (response.data.success) {
          const buildingsList = response.data.data;
          setBuildings(buildingsList);
          
          // Si es modo crear (no editData ni department) y hay edificios, pre-seleccionar el primero
          if (!editData && !department && buildingsList.length > 0 && !formData.idEdificio) {
            setFormData(prev => ({
              ...prev,
              idEdificio: buildingsList[0].idEdificio
            }));
          }
        }
      } catch (error) {
        console.error('Error cargando edificios:', error);
      }
    };

    if (isOpen) {
      loadBuildings();
    }
  }, [isOpen, editData, department]);

  // Si estamos editando, cargar los datos
  useEffect(() => {
    const dataToEdit = editData || department;
    if (dataToEdit && isOpen) {
      setFormData({
        numero: dataToEdit.numero || '',
        piso: dataToEdit.piso || '',
        metrosCuadrados: dataToEdit.metrosCuadrados || '',
        habitaciones: dataToEdit.habitaciones || 1,
        banios: dataToEdit.banios || 1,
        idEdificio: dataToEdit.idEdificio || '',
        estado: dataToEdit.estado || 'Disponible'
      });
    } else if (isOpen) {
      // Reset form cuando se abre para crear nuevo
      setFormData({
        numero: '',
        piso: '',
        metrosCuadrados: '',
        habitaciones: 1,
        banios: 1,
        idEdificio: '',
        estado: 'Disponible'
      });
    }
  }, [editData, department, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'habitaciones' || name === 'banios' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToEdit = editData || department;
      if (dataToEdit) {
        // Actualizar departamento existente
        await adminAPI.updateDepartment(dataToEdit.idDepartamento, formData);
      } else {
        // Crear departamento individual
        const batchData = {
          idEdificio: formData.idEdificio,
          departamentos: [{
            numero: formData.numero,
            piso: parseInt(formData.piso),
            metrosCuadrados: parseFloat(formData.metrosCuadrados) || null,
            habitaciones: parseInt(formData.habitaciones),
            banios: parseInt(formData.banios),
            estado: formData.estado
          }]
        };
        await adminAPI.createDepartmentsBatch(batchData);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error guardando departamento:', error);
      alert(error.response?.data?.message || 'Error al guardar departamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={(editData || department) ? 'Editar Departamento' : 'Nuevo Departamento'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Edificio *
            </label>
            <select
              name="idEdificio"
              value={formData.idEdificio}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar edificio</option>
              {buildings.map(building => (
                <option key={building.idEdificio} value={building.idEdificio}>
                  {building.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número *
            </label>
            <input
              type="text"
              name="numero"
              value={formData.numero}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: 101, A-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Piso *
            </label>
            <input
              type="number"
              name="piso"
              value={formData.piso}
              onChange={handleChange}
              required
              min="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: 1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Metros Cuadrados
            </label>
            <input
              type="number"
              name="metrosCuadrados"
              value={formData.metrosCuadrados}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: 65.50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Habitaciones
            </label>
            <input
              type="number"
              name="habitaciones"
              value={formData.habitaciones}
              onChange={handleChange}
              min="1"
              max="10"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Baños
            </label>
            <input
              type="number"
              name="banios"
              value={formData.banios}
              onChange={handleChange}
              min="1"
              max="5"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Disponible">Disponible</option>
              <option value="Ocupado">Ocupado</option>
              <option value="En Mantenimiento">En Mantenimiento</option>
            </select>
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
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {loading ? 'Guardando...' : (editData ? 'Actualizar' : 'Crear Departamento')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DepartmentForm;