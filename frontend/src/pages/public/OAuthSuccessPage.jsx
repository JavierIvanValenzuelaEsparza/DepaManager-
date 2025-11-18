import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

export default function OAuthSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const processOAuthLogin = async () => {
      const token = searchParams.get('token');
      const role = searchParams.get('role');

      if (token && role) {
        console.log('✅ OAuthSuccess - Token recibido:', token.substring(0, 20) + '...');
        console.log('✅ OAuthSuccess - Rol recibido:', role);
        
        try {
          // Verificar el token con el backend para obtener los datos completos del usuario
          const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
          const response = await axios.get(`${API_URL}/auth/verify`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          console.log('✅ Datos completos del usuario obtenidos:', response.data);

          if (response.data.success && response.data.user) {
            const user = response.data.user;
            
            // Verificar el contexto de login
            const loginContext = sessionStorage.getItem('login_context');
            console.log('🔍 Contexto de login:', loginContext);
            console.log('🎭 Rol del usuario:', user.rol);
            
            // Validar que el rol coincida con el contexto de login
            if (loginContext === 'admin' && user.rol !== 'Administrador') {
              console.error('❌ Intento de acceso: Inquilino en zona de administradores');
              setError('⚠️ Esta cuenta es de inquilino. Por favor, usa el portal de inquilinos.');
              sessionStorage.removeItem('login_context');
              setTimeout(() => {
                window.location.href = '/tenant/login';
              }, 3000);
              return;
            }
            
            if (loginContext === 'tenant' && user.rol !== 'Inquilino') {
              console.error('❌ Intento de acceso: Administrador en zona de inquilinos');
              setError('⚠️ Esta cuenta es de administrador. Por favor, usa el portal de administradores.');
              sessionStorage.removeItem('login_context');
              setTimeout(() => {
                window.location.href = '/admin/auth';
              }, 3000);
              return;
            }
            
            // Limpiar contexto
            sessionStorage.removeItem('login_context');
            
            // Guardar token y datos completos del usuario
            localStorage.setItem('depamanager_token', token);
            localStorage.setItem('depamanager_user', JSON.stringify(user));
            
            console.log('💾 OAuthSuccess - Datos completos guardados en localStorage');
            console.log('   - ID:', user.id);
            console.log('   - Nombre:', user.nombre);
            console.log('   - Correo:', user.correo);
            console.log('   - Rol:', user.rol);
            
            // Redirigir según el rol del usuario
            setTimeout(() => {
              if (user.rol === 'Administrador') {
                console.log('🔀 Redirigiendo a /admin/dashboard');
                window.location.href = '/admin/dashboard';
              } else if (user.rol === 'Inquilino') {
                console.log('🔀 Redirigiendo a /tenant/dashboard');
                window.location.href = '/tenant/dashboard';
              } else {
                console.error('❌ Rol no reconocido:', user.rol);
                setError('Rol de usuario no válido');
                setTimeout(() => navigate('/'), 2000);
              }
            }, 1000);
          } else {
            throw new Error('No se pudieron obtener los datos del usuario');
          }
        } catch (err) {
          console.error('❌ Error verificando token:', err);
          setError('Error al verificar la autenticación');
          setTimeout(() => navigate('/'), 2000);
        }
      } else {
        console.error('❌ OAuthSuccess - Faltan token o role');
        setError('Datos de autenticación incompletos');
        setTimeout(() => navigate('/'), 2000);
      }
    };

    processOAuthLogin();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {error ? (
          <>
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error de autenticación</h2>
            <p className="text-gray-600">{error}</p>
            <p className="text-sm text-gray-500 mt-2">Redirigiendo a la página principal...</p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">🎉 Autenticación exitosa</h2>
            <p className="text-gray-600">Verificando tus datos...</p>
            <p className="text-sm text-gray-500 mt-2">Redirigiendo a tu dashboard...</p>
          </>
        )}
      </div>
    </div>
  );
}