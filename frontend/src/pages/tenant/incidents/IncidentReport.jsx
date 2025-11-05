import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tenantAPI } from '../../../services/api/tenant';

/**
 * Formulario para reportar nueva incidencia
 */
export default function IncidentReport() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tipoProblema: '',
    descripcion: '',
    urgencia: 'Media',
    categoria: 'General'
  });
  const [loading, setLoading] = useState(false);

  /**
   * Manejar envío del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await tenantAPI.reportIncident(formData);
      
      if (response.success) {
        alert('✅ Incidencia reportada correctamente');
        navigate('/tenant/incidencias');
      }
    } catch (error) {
      console.error('Error reportando incidencia:', error);
      alert('❌ Error al reportar incidencia: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Manejar cambio en los campos del formulario
   */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          {/* Encabezado */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Reportar Nueva Incidencia</h1>
            <p className="text-slate-600">Describe el problema que has encontrado</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo de Problema */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tipo de Problema *
              </label>
              <input
                type="text"
                name="tipoProblema"
                value={formData.tipoProblema}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Ej: Fuga de agua, Luz no funciona, Cerradura dañada..."
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Descripción Detallada *
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Describe el problema en detalle. Incluye ubicación exacta, cuándo comenzó, etc."
              />
            </div>

            {/* Urgencia y Categoría */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nivel de Urgencia
                </label>
                <select
                  name="urgencia"
                  value={formData.urgencia}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Baja">Baja (Puede esperar algunos días)</option>
                  <option value="Media">Media (Necesita atención pronto)</option>
                  <option value="Alta">Alta (Requiere atención inmediata)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Categoría
                </label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="General">General</option>
                  <option value="Electricidad">Electricidad</option>
                  <option value="Fontanería">Fontanería</option>
                  <option value="Carpintería">Carpintería</option>
                  <option value="Limpieza">Limpieza</option>
                  <option value="Seguridad">Seguridad</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Reportando...' : '🚨 Reportar Incidencia'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/tenant/incidencias')}
                className="flex-1 bg-slate-300 text-slate-700 py-2 px-4 rounded-lg hover:bg-slate-400 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>

          {/* Información adicional */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">📋 ¿Qué información incluir?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Ubicación exacta del problema</li>
              <li>• Fecha y hora en que notaste el problema</li>
              <li>• Si es recurrente o es la primera vez</li>
              <li>• Cualquier detalle que pueda ayudar a solucionarlo</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}