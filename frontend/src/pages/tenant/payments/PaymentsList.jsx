import React, { useState, useEffect } from 'react';
import { tenantAPI } from '../../../services/api/tenant';

/**
 * Vista de gestión de pagos del inquilino
 * Muestra pagos pendientes y permite subir comprobantes
 */
export default function PaymentsList() {
  const [paymentsData, setPaymentsData] = useState({
    pagos: [],
    estadisticas: {}
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null);
  const [filters, setFilters] = useState({
    estado: ''
  });

  /**
   * Cargar pagos cuando cambian los filtros
   */
  useEffect(() => {
    loadPayments();
  }, [filters]);

  /**
   * Cargar pagos desde la API
   */
  const loadPayments = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando pagos...');

      const response = await tenantAPI.getPayments(filters);
      
      if (response.success) {
        setPaymentsData(response.data);
        console.log('✅ Pagos cargados exitosamente');
      }
    } catch (error) {
      console.error('❌ Error cargando pagos:', error);
      alert('Error al cargar los pagos: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Manejar subida de comprobante
   */
  const handleUploadReceipt = async (idPago) => {
    try {
      setUploading(idPago);
      
      // En una implementación real, aquí subirías el archivo
      const urlComprobante = `https://ejemplo.com/comprobantes/${idPago}.pdf`;
      
      await tenantAPI.uploadPaymentReceipt(idPago, urlComprobante);
      alert('Comprobante subido correctamente. Esperando verificación del administrador.');
      loadPayments(); // Recargar lista
    } catch (error) {
      console.error('Error subiendo comprobante:', error);
      alert('Error al subir comprobante: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(null);
    }
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
   * Obtener clase CSS para el estado del pago
   */
  const getStatusBadgeClass = (estado) => {
    switch (estado) {
      case 'Pagado':
        return 'bg-green-100 text-green-800';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Vencido':
        return 'bg-red-100 text-red-800';
      case 'Pendiente de Verificación':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
      <div className="max-w-6xl mx-auto">
        {/* Encabezado */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-slate-200">
            <h1 className="text-2xl font-bold text-slate-900">Mis Pagos</h1>
            <p className="text-slate-600">Gestiona tus pagos y comprobantes</p>
          </div>

          {/* Estadísticas */}
          {paymentsData.estadisticas && (
            <div className="px-6 py-4 bg-slate-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900">
                    {formatMoney(paymentsData.estadisticas.totalPagado || 0)}
                  </p>
                  <p className="text-sm text-slate-600">Total Pagado</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900">
                    {formatMoney(paymentsData.estadisticas.totalPendiente || 0)}
                  </p>
                  <p className="text-sm text-slate-600">Total Pendiente</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900">
                    {paymentsData.estadisticas.totalPagos || 0}
                  </p>
                  <p className="text-sm text-slate-600">Total Pagos</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-lg font-semibold text-slate-900">Filtrar Pagos</h2>
            <div className="flex gap-4">
              <select
                value={filters.estado}
                onChange={(e) => setFilters(prev => ({ ...prev, estado: e.target.value }))}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Todos los estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Pagado">Pagado</option>
                <option value="Vencido">Vencido</option>
                <option value="Pendiente de Verificación">Pendiente de Verificación</option>
              </select>
              <button
                onClick={loadPayments}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
              >
                🔄 Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Pagos */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {paymentsData.pagos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500">No hay pagos registrados</p>
                <p className="text-sm text-slate-400 mt-1">Todos tus pagos están al día</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  {filters.estado ? `Pagos ${filters.estado}` : 'Todos mis Pagos'}
                </h2>
                
                {paymentsData.pagos.map((pago) => (
                  <div key={pago.idPago} className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                      {/* Información del pago */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {pago.concepto} {pago.descripcionServicio && `- ${pago.descripcionServicio}`}
                          </h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(pago.estado)}`}>
                            {pago.estado}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600">
                          <p><strong>Vence:</strong> {formatDate(pago.fechaVencimiento)}</p>
                          <p><strong>Monto:</strong> {formatMoney(pago.monto)}</p>
                          {pago.fechaPago && (
                            <p><strong>Pagado:</strong> {formatDate(pago.fechaPago)}</p>
                          )}
                          {pago.metodoPago && (
                            <p><strong>Método:</strong> {pago.metodoPago}</p>
                          )}
                        </div>

                        {pago.mensajeAdministrador && (
                          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-sm text-blue-700">
                              <strong>Administrador:</strong> {pago.mensajeAdministrador}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Acciones */}
                      <div className="flex flex-col gap-2">
                        {pago.estado === 'Pendiente' && !pago.comprobanteSubido ? (
                          <button
                            onClick={() => navigate(`/tenant/pagos/subir/${pago.idPago}`)}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                            >
                            Subir Comprobante
                          </button>
                        ) : pago.comprobanteSubido ? (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm text-center">
                            ✅ Comprobante Subido
                          </span>
                        ) : null}
                        
                        <button className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors">
                          Ver Detalles
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}