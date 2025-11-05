import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Sidebar específico para el módulo de inquilino
 * Navegación entre las diferentes secciones del portal
 */
export default function TenantSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Items del menú de navegación
   */
  const menuItems = [
    { 
      path: '/tenant/dashboard', 
      label: 'Dashboard', 
      icon: '🏠',
      description: 'Resumen general'
    },
    { 
      path: '/tenant/pagos', 
      label: 'Mis Pagos', 
      icon: '💳',
      description: 'Gestionar pagos'
    },
    { 
      path: '/tenant/incidencias', 
      label: 'Incidencias', 
      icon: '⚠️',
      description: 'Reportar y seguir'
    },
    { 
      path: '/tenant/contratos', 
      label: 'Mis Contratos', 
      icon: '📄',
      description: 'Documentos legales'
    },
    { 
      path: '/tenant/notificaciones', 
      label: 'Notificaciones', 
      icon: '🔔',
      description: 'Avisos importantes'
    },
    { 
      path: '/tenant/perfil', 
      label: 'Mi Perfil', 
      icon: '👤',
      description: 'Información personal'
    }
  ];

  /**
   * Manejar cierre de sesión
   */
  const handleLogout = () => {
    console.log('🚪 Cerrando sesión...');
    logout();
    navigate('/');
  };

  /**
   * Verificar si una ruta está activa
   */
  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col h-full">
      {/* Header del Sidebar */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">DM</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-emerald-600">DepaManager</h1>
            <p className="text-xs text-slate-500">Portal del Inquilino</p>
          </div>
        </div>
      </div>
      
      {/* Navegación Principal */}
      <nav className="flex-1 p-4">
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Navegación Principal
          </h2>
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full text-left p-3 rounded-lg transition-all group ${
                    isActivePath(item.path)
                      ? 'bg-emerald-50 text-emerald-700 border-r-2 border-emerald-500 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-3">{item.icon}</span>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-slate-500 group-hover:text-slate-600">
                        {item.description}
                      </p>
                    </div>
                    {isActivePath(item.path) && (
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Sección de Ayuda */}
        <div className="mt-8">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Ayuda y Soporte
          </h2>
          <ul className="space-y-1">
            <li>
              <button className="w-full text-left p-3 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all">
                <div className="flex items-center">
                  <span className="text-lg mr-3">📞</span>
                  <div>
                    <p className="font-medium text-sm">Soporte Técnico</p>
                    <p className="text-xs text-slate-500">24/7 disponible</p>
                  </div>
                </div>
              </button>
            </li>
            <li>
              <button className="w-full text-left p-3 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all">
                <div className="flex items-center">
                  <span className="text-lg mr-3">📋</span>
                  <div>
                    <p className="font-medium text-sm">Manual de Usuario</p>
                    <p className="text-xs text-slate-500">Guía completa</p>
                  </div>
                </div>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Footer del Sidebar - Información del Usuario */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-white font-semibold text-sm">
              {user?.nombreCompleto?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {user?.nombreCompleto || 'Usuario'}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user?.correo || 'inquilino@email.com'}
            </p>
            <p className="text-xs text-emerald-600 font-medium">Inquilino</p>
          </div>
        </div>

        {/* Botón de Cerrar Sesión */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-4 py-2 text-sm text-slate-600 hover:bg-white hover:text-slate-800 rounded-lg transition-all border border-transparent hover:border-slate-200"
        >
          <span className="mr-2">🚪</span>
          Cerrar Sesión
        </button>

        {/* Información de la aplicación */}
        <div className="mt-3 pt-3 border-t border-slate-200">
          <p className="text-xs text-slate-400 text-center">
            DepaManager v1.0
          </p>
        </div>
      </div>
    </div>
  );
}