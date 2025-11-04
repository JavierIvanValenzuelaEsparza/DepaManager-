import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import registerAdminIllustration from '../../assets/register-admin-illustration.png';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nombre_completo: '',
    correo: '',
    contraseña: '',
    confirmarContraseña: '',
    telefono: '',
    dni: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { registerAdmin } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (formData.contraseña !== formData.confirmarContraseña) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.contraseña.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const { confirmarContraseña, ...userData } = formData;
      
      const result = await registerAdmin(userData);

      if (result.success) {
        navigate('/admin/dashboard');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* COLUMNA IZQUIERDA - FORMULARIO */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-md">
          {/* Encabezado */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Crear Cuenta
            </h1>
            <p className="text-slate-600 text-sm">
              Registro exclusivo para administradores
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo Nombre Completo */}
            <div>
              <label htmlFor="nombre_completo" className="block text-sm font-medium text-slate-700 mb-2">
                Nombre Completo*
              </label>
              <input
                id="nombre_completo"
                name="nombre_completo"
                type="text"
                value={formData.nombre_completo}
                onChange={handleChange}
                required
                className="w-full px-5 py-3 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="Juan Pérez García"
              />
            </div>

            {/* Campo Correo */}
            <div>
              <label htmlFor="correo" className="block text-sm font-medium text-slate-700 mb-2">
                Correo Electrónico*
              </label>
              <input
                id="correo"
                name="correo"
                type="email"
                value={formData.correo}
                onChange={handleChange}
                required
                className="w-full px-5 py-3 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="tu@email.com"
              />
            </div>

            {/* Campo Teléfono */}
            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-slate-700 mb-2">
                Teléfono
              </label>
              <input
                id="telefono"
                name="telefono"
                type="tel"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full px-5 py-3 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="+51 999 999 999"
              />
            </div>

            {/* Campo DNI */}
            <div>
              <label htmlFor="dni" className="block text-sm font-medium text-slate-700 mb-2">
                DNI
              </label>
              <input
                id="dni"
                name="dni"
                type="text"
                value={formData.dni}
                onChange={handleChange}
                className="w-full px-5 py-3 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="12345678"
              />
            </div>

            {/* Campo Contraseña */}
            <div>
              <label htmlFor="contraseña" className="block text-sm font-medium text-slate-700 mb-2">
                Contraseña*
              </label>
              <input
                id="contraseña"
                name="contraseña"
                type="password"
                value={formData.contraseña}
                onChange={handleChange}
                required
                className="w-full px-5 py-3 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            {/* Campo Confirmar Contraseña */}
            <div>
              <label htmlFor="confirmarContraseña" className="block text-sm font-medium text-slate-700 mb-2">
                Confirmar Contraseña*
              </label>
              <input
                id="confirmarContraseña"
                name="confirmarContraseña"
                type="password"
                value={formData.confirmarContraseña}
                onChange={handleChange}
                required
                className="w-full px-5 py-3 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Botón de Registro */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-3 px-6 rounded-full hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/30 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          {/* Link de login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              ¿Ya tienes una cuenta?{' '}
              <button
                onClick={() => navigate('/admin/login')}
                className="text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                Inicia sesión aquí
              </button>
            </p>
          </div>

          {/* Botón volver */}
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-sm text-slate-500 hover:text-slate-700 flex items-center justify-center w-full"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inicio
          </button>
        </div>
      </div>

      {/* COLUMNA DERECHA - ILUSTRACIÓN */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 items-center justify-center p-12 relative overflow-hidden">
        {/* Círculos decorativos de fondo */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white opacity-10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        
        {/* Contenedor de la imagen */}
        <div className="relative z-10 w-full max-w-lg">
          <img 
            src={registerAdminIllustration}
            alt="Ilustración de registro de administrador"
            className="w-full h-auto drop-shadow-2xl"
          />
        </div>

        {/* Texto adicional */}
        <div className="absolute bottom-8 left-8 right-8 text-center text-white z-10">
          <p className="text-2xl font-bold mb-2">Comienza tu Gestión</p>
          <p className="text-emerald-50">Administra propiedades de forma inteligente</p>
        </div>
      </div>
    </div>
  );
}