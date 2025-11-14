import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../../services/api/admin';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';

const ApplicantsForm = ({ isOpen, onClose, onSuccess, editData = null }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre_completo: '',
    dni: '',
    telefono: '',
    correo: '',
    red_social: '',
    departamento_deseado: '',
    ocupacion: '',
    monto_alquiler: '',
    observaciones: ''
  });

  // Si estamos editando, cargar los datos
  useEffect(() => {
    if (editData && isOpen) {
      setFormData({
        nombre_completo: editData.nombre_completo || '',
        dni: editData.dni || '',
        telefono: editData.telefono || '',
        correo: editData.correo || '',
        red_social: editData.red_social || '',
        departamento_deseado: editData.departamento_deseado || '',
        ocupacion: editData.ocupacion || '',
        monto_alquiler: editData.monto_alquiler || '',
        observaciones: editData.observaciones || ''
      });
    } else if (isOpen) {
      // Reset form cuando se abre para crear nuevo
      setFormData({
        nombre_completo: '',
        dni: '',
        telefono: '',
        correo: '',
        red_social: '',
        departamento_deseado: '',
        ocupacion: '',
        monto_alquiler: '',
        observaciones: ''
      });
    }
  }, [editData, isOpen]);

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
      console.log('📤 Enviando datos del postulante:', formData);
      
      if (editData) {
        // Actualizar postulante existente
        await adminAPI.updateApplicant(editData.id_postulante, formData);
      } else {
        // Crear nuevo postulante
        await adminAPI.createApplicant(formData);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('❌ Error guardando postulante:', error);
      alert(error.response?.data?.message || 'Error al guardar postulante');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={editData ? 'Editar Postulante' : 'Nuevo Postulante'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
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
                name="nombre_completo"
                value={formData.nombre_completo}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: María García López"
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
                maxLength="20"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: 87654321"
              />
            </div>

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
                Correo Electrónico
              </label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: maria@correo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Red Social
              </label>
              <input
                type="text"
                name="red_social"
                value={formData.red_social}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: @maria_garcia"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ocupación
              </label>
              <input
                type="text"
                name="ocupacion"
                value={formData.ocupacion}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Ingeniera"
              />
            </div>
          </div>
        </div>

        {/* Información del Departamento */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Departamento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Departamento Deseado
              </label>
              <input
                type="text"
                name="departamento_deseado"
                value={formData.departamento_deseado}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Depto 101"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto Alquiler (S/)
              </label>
              <input
                type="number"
                name="monto_alquiler"
                value={formData.monto_alquiler}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: 1500.00"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones
              </label>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                rows="4"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Notas adicionales sobre el postulante..."
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
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {loading ? 'Guardando...' : (editData ? 'Actualizar' : 'Crear Postulante')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ApplicantsForm;