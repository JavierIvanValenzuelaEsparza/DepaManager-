// frontend/src/components/layout/AdminSidebar.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  DollarSign,
  Wrench,
  Building,
  ClipboardList,
  Car,
  Camera,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/admin/auth');
  };

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  // Menú de navegación con íconos profesionales
  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/departments', icon: Building2, label: 'Departamentos' },
    { path: '/admin/tenants', icon: Users, label: 'Inquilinos' },
    { path: '/admin/contracts', icon: FileText, label: 'Contratos' },
    { path: '/admin/payments', icon: DollarSign, label: 'Pagos' },
    { path: '/admin/incidencias', icon: Wrench, label: 'Incidencias' },
    { path: '/admin/proveedores', icon: Building, label: 'Proveedores' },
    { path: '/admin/applicants', icon: ClipboardList, label: 'Postulantes' },
    { path: '/admin/vehicles', icon: Car, label: 'Vehículos' },
    { path: '/admin/cameras', icon: Camera, label: 'Cámaras' },
  ];

  return (
    <div
      className={`
        ${isExpanded ? 'w-64' : 'w-20'}
        min-h-screen bg-gradient-to-b from-emerald-700 to-emerald-600
        text-white transition-all duration-300 ease-in-out
        flex flex-col relative shadow-2xl
      `}
    >
      {/* Botón de Toggle - Posicionado sobre el contenido */}
      <button
        onClick={toggleSidebar}
        className="
          absolute -right-3 top-8 z-50
          bg-emerald-400 hover:bg-emerald-600
          text-white rounded-full p-1.5
          shadow-lg transition-all duration-300
          focus:outline-none focus:ring-2 focus:ring-emerald-500
        "
        aria-label={isExpanded ? 'Contraer sidebar' : 'Expandir sidebar'}
      >
        {isExpanded ? (
          <ChevronLeft className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>

      {/* Header - Logo y Título */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-center">
          {isExpanded ? (
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight">
                Depa<span className="text-emerald-300">Manager</span>
              </h1>
              <p className="text-xs text-emerald-200/70 mt-1">
                Panel de Administración
              </p>
              {user && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-sm text-emerald-100 font-medium">
                    Hola, {user.nombre}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <div className="
                w-12 h-12 bg-emerald-600 rounded-xl
                flex items-center justify-center
                font-bold text-xl shadow-lg
              ">
                DM
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navegación Principal */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                group relative flex items-center
                ${isExpanded ? 'px-4 py-3' : 'px-3 py-3 justify-center'}
                rounded-lg transition-all duration-200
                ${isActive
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              {/* Indicador de ítem activo (borde izquierdo) */}
              {isActive && isExpanded && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-300 rounded-r-full" />
              )}

              {/* Ícono */}
              <Icon
                className={`
                  ${isExpanded ? 'w-5 h-5' : 'w-6 h-6'}
                  transition-transform duration-200
                  ${isActive ? 'scale-110' : 'group-hover:scale-110'}
                `}
              />

              {/* Label (solo en modo expandido) */}
              {isExpanded && (
                <span className="ml-3 font-medium text-sm whitespace-nowrap">
                  {item.label}
                </span>
              )}

              {/* Tooltip (solo en modo contraído) */}
              {!isExpanded && (
                <div className="
                  absolute left-full ml-6 px-3 py-2
                  bg-emerald-800 text-white text-sm rounded-lg
                  shadow-xl opacity-0 invisible
                  group-hover:opacity-100 group-hover:visible
                  transition-all duration-200 whitespace-nowrap
                  pointer-events-none z-50
                ">
                  {item.label}
                  {/* Flecha del tooltip */}
                  <div className="
                    absolute right-full top-1/2 -translate-y-1/2
                    border-8 border-transparent border-r-emerald-800
                  " />
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Separador */}
      <div className="px-6">
        <div className="border-t border-white/20" />
      </div>

      {/* Cerrar Sesión */}
      <div className="p-3">
        <button
          onClick={handleLogout}
          className={`
            group relative w-full flex items-center
            ${isExpanded ? 'px-4 py-3' : 'px-3 py-3 justify-center'}
            rounded-lg transition-all duration-200
            text-white bg-emerald-700 hover:text-white
          `}
        >
          <LogOut
            className={`
              ${isExpanded ? 'w-5 h-5' : 'w-6 h-6'}
              transition-transform duration-200
              group-hover:scale-110
            `}
          />

          {isExpanded && (
            <span className="ml-3 font-medium text-sm whitespace-nowrap">
              Cerrar Sesión
            </span>
          )}

          {/* Tooltip (solo en modo contraído) */}
          {!isExpanded && (
            <div className="
              absolute left-full ml-6 px-3 py-2
              bg-red-600 text-white text-sm rounded-lg
              shadow-xl opacity-0 invisible
              group-hover:opacity-100 group-hover:visible
              transition-all duration-200 whitespace-nowrap
              pointer-events-none z-50
            ">
              Cerrar Sesión
              {/* Flecha del tooltip */}
              <div className="
                absolute right-full top-1/2 -translate-y-1/2
                border-8 border-transparent border-r-red-600
              " />
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;