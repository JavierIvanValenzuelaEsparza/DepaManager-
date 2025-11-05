import React, { useState, useEffect } from 'react';
import { tenantAPI } from '../../../services/api/tenant';

/**
 * Vista de contratos del inquilino
 * Muestra información del contrato activo
 */
export default function ContractDetails() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Cargar contratos al montar el componente
   */
  useEffect(() => {
    loadContracts();
  }, []);

  /**
   * Cargar contratos desde la API
   */
  const loadContracts = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando contratos...');

      const response = await tenantAPI.getContracts();
      
      if (response.success) {
        setContracts(response.data);
        console.log('✅ Contratos cargados exitosamente');
      }
    } catch (error) {
      console.error('❌ Error cargando contratos:', error);
      alert('Error al cargar los contratos: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Formatear fecha en español
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  /**
   * Formatear monto como dinero
   */
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  };

  /**
   * Calcular días restantes del contrato
   */
  const getDaysRemaining = (endDate) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Encabezado */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-slate-200">
            <h1 className="text-2xl font-bold text-slate-900">Mis Contratos</h1>
            <p className="text-slate-600">Información de tus contratos de alquiler</p>
          </div>
        </div>

        {contracts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-slate-500 text-lg mb-2">No tienes contratos registrados</p>
            <p className="text-slate-400">Contacta al administrador para más información</p>
          </div>
        ) : (
          <div className="space-y-6">
            {contracts.map((contrato) => (
              <div key={contrato.idContrato} className="bg-white rounded-lg shadow">
                {/* Encabezado del contrato */}
                <div className="px-6 py-4 border-b border-slate-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        Contrato de Alquiler
                      </h2>
                      <p className="text-slate-600">ID: {contrato.idContrato}</p>
                    </div>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      contrato.estado === 'Activo' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {contrato.estado}
                    </span>
                  </div>
                </div>

                {/* Información del contrato */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Información básica */}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Información del Contrato</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-slate-500">Fecha de Inicio</p>
                          <p className="font-medium text-slate-900">{formatDate(contrato.fechaInicio)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Fecha de Fin</p>
                          <p className="font-medium text-slate-900">{formatDate(contrato.fechaFin)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Duración</p>
                          <p className="font-medium text-slate-900">{contrato.duracionMeses || '12'} meses</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Días Restantes</p>
                          <p className="font-medium text-slate-900">
                            {getDaysRemaining(contrato.fechaFin)} días
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Información financiera */}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Información Financiera</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-slate-500">Renta Mensual</p>
                          <p className="font-medium text-slate-900">{formatMoney(contrato.montoMensual)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Depósito de Garantía</p>
                          <p className="font-medium text-slate-900">{formatMoney(contrato.depositoGarantia)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Próximo Pago</p>
                          <p className="font-medium text-slate-900">
                            {formatMoney(contrato.montoMensual)} (el día 1 de cada mes)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Información del departamento */}
                  {contrato.departamento && (
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Información del Departamento</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-500">Departamento</p>
                          <p className="font-medium text-slate-900">
                            {contrato.departamento.numero} (Piso {contrato.departamento.piso})
                          </p>
                        </div>
                        {contrato.departamento.edificio && (
                          <>
                            <div>
                              <p className="text-sm text-slate-500">Edificio</p>
                              <p className="font-medium text-slate-900">{contrato.departamento.edificio.nombre}</p>
                            </div>
                            <div className="md:col-span-2">
                              <p className="text-sm text-slate-500">Dirección</p>
                              <p className="font-medium text-slate-900">{contrato.departamento.edificio.direccion}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="mt-6 pt-6 border-t border-slate-200 flex gap-4">
                    {contrato.archivoPdf && (
                      <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
                        📄 Descargar Contrato PDF
                      </button>
                    )}
                    <button className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors">
                      📞 Contactar Administrador
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}