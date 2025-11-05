import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { tenantAPI } from '../../services/api/tenant';

/**
 * Dashboard principal del inquilino
 * Muestra resumen de pagos, departamento, incidencias y actividad reciente
 */
export default function TenantDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Cargar datos del dashboard al montar el componente
   */
  useEffect(() => {
    loadDashboardData();
  }, []);

  /**
   * Función para cargar datos del dashboard desde la API
   */
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Cargando datos del dashboard...');
      
      const response = await tenantAPI.getDashboard();
      
      if (response.success) {
        setDashboardData(response.data);
        console.log('✅ Dashboard cargado exitosamente');
      } else {
        throw new Error(response.message || 'Error al cargar dashboard');
      }
    } catch (err) {
      console.error('❌ Error cargando dashboard:', err);
      setError(err.response?.data?.message || 'Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Formatear fecha actual en español
   */
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <div className="text-red-600 text-lg mb-2">❌ Error</div>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={loadDashboardData}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Hola, {dashboardData?.usuario?.nombreCompleto || user?.nombreCompleto || 'Usuario'}
          </h1>
          <p className="text-slate-600 capitalize">{getCurrentDate()}</p>
        </header>

        <hr className="border-t border-slate-300 mb-8" />

        {/* Grid de tarjetas informativas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Próximo Pago */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <h2 className="text-lg font-semibold text-slate-700 mb-2">Próximo Pago</h2>
            <p className="text-3xl font-bold text-slate-900">
              {formatMoney(dashboardData?.proximoPago?.monto || 0)}
            </p>
            <p className="text-slate-600">
              {dashboardData?.proximoPago?.fechaVencimiento || 'Sin pagos pendientes'}
            </p>
            {dashboardData?.proximoPago?.concepto && (
              <p className="text-sm text-slate-500 mt-1">
                {dashboardData.proximoPago.concepto}
              </p>
            )}
          </div>

          {/* Mi Departamento */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <h2 className="text-lg font-semibold text-slate-700 mb-2">Mi Departamento</h2>
            <p className="text-3xl font-bold text-slate-900">
              {dashboardData?.departamento?.numero || 'No asignado'}
            </p>
            <p className="text-slate-600">
              {dashboardData?.departamento?.edificio || 'Sin edificio asignado'}
            </p>
            {dashboardData?.departamento?.direccion && (
              <p className="text-sm text-slate-500 mt-1 truncate">
                {dashboardData.departamento.direccion}
              </p>
            )}
          </div>

          {/* Pagos Este Año */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <h2 className="text-lg font-semibold text-slate-700 mb-2">Pagos Este Año</h2>
            <p className="text-3xl font-bold text-slate-900">
              {dashboardData?.estadisticas?.pagosEsteAnio || 0}
            </p>
            <p className="text-slate-600">Realizados</p>
          </div>

          {/* Incidencias Activas */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <h2 className="text-lg font-semibold text-slate-700 mb-2">Incidencias Activas</h2>
            <p className="text-3xl font-bold text-slate-900">
              {dashboardData?.estadisticas?.incidenciasActivas || 0}
            </p>
            <p className="text-slate-600">En seguimiento</p>
          </div>
        </div>

        {/* Acciones rápidas y actividad reciente */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Acciones rápidas */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-slate-700 mb-4">Acciones rápidas</h2>
              <ul className="space-y-3">
                <li>
                  <button 
                    onClick={() => navigate('/tenant/pagos')}
                    className="w-full text-left text-emerald-600 hover:text-emerald-700 font-medium p-2 rounded-lg hover:bg-emerald-50 transition-colors"
                  >
                    📋 Ver mis pagos
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/tenant/incidencias')}
                    className="w-full text-left text-emerald-600 hover:text-emerald-700 font-medium p-2 rounded-lg hover:bg-emerald-50 transition-colors"
                  >
                    🚨 Reportar incidencia
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/tenant/notificaciones')}
                    className="w-full text-left text-emerald-600 hover:text-emerald-700 font-medium p-2 rounded-lg hover:bg-emerald-50 transition-colors"
                  >
                    🔔 Ver notificaciones
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/tenant/contratos')}
                    className="w-full text-left text-emerald-600 hover:text-emerald-700 font-medium p-2 rounded-lg hover:bg-emerald-50 transition-colors"
                  >
                    📄 Mis contratos
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Actividad reciente */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-slate-700 mb-4">Actividad reciente</h2>
              
              {dashboardData?.actividadReciente && dashboardData.actividadReciente.length > 0 ? (
                <ul className="space-y-4">
                  {dashboardData.actividadReciente.map((actividad, index) => (
                    <li key={index} className="flex justify-between items-center p-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <div>
                        <span className="font-medium text-slate-900">{actividad.tipo}</span>
                        {actividad.concepto && (
                          <p className="text-sm text-slate-600">{actividad.concepto}</p>
                        )}
                        {actividad.descripcion && (
                          <p className="text-sm text-slate-600">{actividad.descripcion}</p>
                        )}
                        {actividad.monto && (
                          <p className="text-sm text-slate-600">{formatMoney(actividad.monto)}</p>
                        )}
                      </div>
                      <span className="text-slate-600 text-sm">{actividad.fecha}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <p>No hay actividad reciente</p>
                  <p className="text-sm">Tu actividad aparecerá aquí</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botón para recargar datos */}
        <div className="mt-6 text-center">
          <button
            onClick={loadDashboardData}
            className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors"
          >
            🔄 Actualizar datos
          </button>
        </div>
      </div>
    </div>
  );
}