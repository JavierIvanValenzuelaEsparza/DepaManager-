// frontend/src/pages/admin/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api/admin';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      console.log('🔄 Cargando datos del dashboard...');
      const response = await adminAPI.getDashboard();
      
      if (response.data.success) {
        setDashboardData(response.data.data);
        console.log('✅ Datos del dashboard cargados');
      } else {
        setError(response.data.message || 'Error al cargar datos');
      }
    } catch (err) {
      console.error('❌ Error cargando dashboard:', err);
      setError(err.response?.data?.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-600">Cargando dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 p-8">
        <div className="text-4xl mb-4">⚠️</div>
        <p className="text-red-500 text-lg mb-4 text-center">{error}</p>
        <button 
          onClick={fetchDashboardData}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const { summary, recentActivities } = dashboardData || { 
    summary: {}, 
    recentActivities: []
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-2">Resumen general de tu administración</p>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Edificios</h3>
              <p className="text-2xl font-bold text-gray-800 mt-1">{summary.totalBuildings || 0}</p>
            </div>
            <div className="text-3xl text-blue-500">🏢</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Departamentos</h3>
              <p className="text-2xl font-bold text-gray-800 mt-1">{summary.totalDepartments || 0}</p>
              <div className="flex gap-3 mt-2 text-xs text-gray-500">
                <span>Disponibles: {summary.availableDepartments || 0}</span>
                <span>Ocupados: {summary.occupiedDepartments || 0}</span>
              </div>
            </div>
            <div className="text-3xl text-green-500">🏠</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Inquilinos</h3>
              <p className="text-2xl font-bold text-gray-800 mt-1">{summary.totalTenants || 0}</p>
            </div>
            <div className="text-3xl text-purple-500">👥</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Ocupación</h3>
              <p className="text-2xl font-bold text-gray-800 mt-1">{summary.occupancyRate || 0}%</p>
            </div>
            <div className="text-3xl text-orange-500">📊</div>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link 
              to="/admin/departments" 
              className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-4 text-center transition-colors"
            >
              <div className="text-2xl text-blue-500 mb-2">🏠</div>
              <p className="text-sm font-medium text-blue-800">Gestionar Departamentos</p>
            </Link>
            <Link 
              to="/admin/tenants" 
              className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg p-4 text-center transition-colors"
            >
              <div className="text-2xl text-purple-500 mb-2">👥</div>
              <p className="text-sm font-medium text-purple-800">Gestionar Inquilinos</p>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Actividad Reciente</h3>
          <p className="text-xs text-gray-500 mb-4">Últimos 7 días</p>
          <div className="space-y-3">
            {recentActivities && recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => {
                const colorClasses = {
                  green: 'bg-green-100 text-green-600',
                  blue: 'bg-blue-100 text-blue-600',
                  purple: 'bg-purple-100 text-purple-600',
                  emerald: 'bg-emerald-100 text-emerald-600',
                  red: 'bg-red-100 text-red-600'
                };
                
                return (
                  <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-start flex-1">
                      <div className={`w-8 h-8 ${colorClasses[activity.color] || 'bg-gray-100 text-gray-600'} rounded-full flex items-center justify-center mr-3 flex-shrink-0`}>
                        <span className="text-sm">{activity.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                        <p className="text-xs text-gray-600 truncate">{activity.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(activity.date).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-sm text-center py-8">No hay actividad reciente en los últimos 7 días</p>
            )}
          </div>
        </div>
      </div>

      {/* Mensaje de bienvenida si no hay datos */}
      {summary.totalBuildings === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h3 className="text-xl font-semibold text-blue-800 mb-2">¡Bienvenido a DepaManager!</h3>
          <p className="text-blue-600 mb-4">
            Comienza agregando tu primer edificio y departamentos para gestionar tu propiedad.
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              to="/admin/departments" 
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Agregar Primer Departamento
            </Link>
            <button className="px-6 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors">
              Ver Tutorial
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;