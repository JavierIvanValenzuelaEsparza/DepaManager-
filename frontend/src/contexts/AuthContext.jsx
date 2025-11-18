// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api/auth';
import { GoogleOAuthProvider } from '@react-oauth/google';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// ✅ WRAPPER PARA GOOGLE OAUTH (en el mismo archivo o crear uno nuevo)
export const GoogleAuthProvider = ({ children }) => {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  );
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ FUNCIÓN ÚNICA PARA VERIFICAR AUTENTICACIÓN
  const checkAuth = useCallback(async () => {
    console.log('🔍 AuthContext.checkAuth - INICIANDO verificación...');
    try {
      const token = localStorage.getItem('depamanager_token');
      const userData = localStorage.getItem('depamanager_user');

      console.log('📦 Datos en localStorage:');
      console.log('   - Token existe:', token ? 'SÍ' : 'NO');
      console.log('   - UserData existe:', userData ? 'SÍ' : 'NO');

      if (token && userData) {
        const user = JSON.parse(userData);
        console.log('✅ Usuario recuperado de localStorage:', user);
        console.log('   - Correo:', user.correo);
        console.log('   - Rol:', user.rol);
        console.log('   - ID:', user.id);
        
        setUser(user);
        setIsAuthenticated(true);
        
        console.log('✅ Estado actualizado: isAuthenticated = true');
      } else {
        console.log('❌ No hay datos de autenticación en localStorage');
      }
    } catch (error) {
      console.error('❌ Error en checkAuth:', error);
      clearAuth();
    } finally {
      setLoading(false);
      console.log('✅ checkAuth completado - loading = false');
    }
  }, []);

  // ✅ FUNCIÓN PARA LIMPIAR AUTENTICACIÓN
  const clearAuth = () => {
    localStorage.removeItem('depamanager_token');
    localStorage.removeItem('depamanager_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  // ✅ EFFECT PARA VERIFICAR AUTENTICACIÓN AL INICIAR
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // ✅ FUNCIÓN DE LOGIN - Funciona para Admin e Inquilino
  const login = async (correo, contrasenia) => {
    try {
      console.log('🔐 AuthContext.login - INICIO');
      console.log('📧 Parámetro correo recibido:', correo);
      console.log('🔑 Parámetro contrasenia recibido:', contrasenia);
      console.log('📦 Tipo de correo:', typeof correo);
      console.log('📦 Tipo de contrasenia:', typeof contrasenia);
      
      // ✅ Crear objeto de credenciales
      const credentials = { correo, contrasenia };
      console.log('� Objeto credentials creado:', JSON.stringify(credentials, null, 2));
      
      // ✅ IMPORTANTE: Enviar datos directamente, NO dentro de objeto "email"
      const response = await authAPI.login(credentials);
      
      console.log('✅ Respuesta del servidor:', response.data);
      
      if (response.data.success) {
        const { token, user } = response.data;
        
        console.log('✅ Login exitoso - Datos recibidos del servidor:');
        console.log('   - Token recibido:', token ? 'SÍ (' + token.substring(0, 20) + '...)' : 'NO');
        console.log('   - Usuario:', user);
        console.log('   - Rol:', user.rol);
        console.log('   - Nombre:', user.nombre);
        
        // Guardar en localStorage
        localStorage.setItem('depamanager_token', token);
        localStorage.setItem('depamanager_user', JSON.stringify(user));
        
        console.log('💾 Datos guardados en localStorage');
        console.log('   - Token guardado:', localStorage.getItem('depamanager_token') ? 'SÍ' : 'NO');
        console.log('   - User guardado:', localStorage.getItem('depamanager_user') ? 'SÍ' : 'NO');
        
        // Actualizar estado global
        setUser(user);
        setIsAuthenticated(true);
        
        console.log('🔄 Estado del contexto actualizado');
        console.log('   - isAuthenticated:', true);
        console.log('   - user.rol:', user.rol);
        
        console.log('✅ Login completado - NO redirigiendo desde AuthContext');
        console.log('   El LoginPage se encargará de la redirección');
        
        // ✅ NO redirigir aquí - dejar que el componente que llama maneje la redirección
        // Esto evita conflictos con React Router
        
        return { success: true, user };
      } else {
        return { 
          success: false, 
          error: response.data.message 
        };
      }
    } catch (error) {
      console.error('❌ Error en login:', error);
      
      // Manejo de errores de respuesta del servidor
      if (error.response) {
        return { 
          success: false, 
          error: error.response.data?.message || `Error ${error.response.status}` 
        };
      }
      
      // Error de conexión
      return { 
        success: false, 
        error: 'Error de conexión con el servidor' 
      };
    }
  };
  // Función de login con Google con contexto
  const loginWithGoogle = (context = 'tenant') => {
    const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
    // Pasar el contexto como parámetro state
    window.location.href = `${backendUrl}/auth/google?context=${context}`;
  };

  // ✅ FUNCIÓN DE LOGOUT
  const logout = () => {
    console.log('🚪 Cerrando sesión...');
    clearAuth();
    window.location.href = '/';
  };

  // ✅ FUNCIÓN DE REGISTRO PARA ADMINISTRADOR
  const registerAdmin = async (userData) => {
    try {
      console.log('👤 Registrando nuevo administrador...', userData);
      const response = await authAPI.registerAdmin(userData);
      
      console.log('✅ Respuesta del registro:', response.data);
      
      if (response.data.success) {
        // Guardar token y usuario en localStorage
        localStorage.setItem('depamanager_token', response.data.token);
        localStorage.setItem('depamanager_user', JSON.stringify(response.data.user));
        
        setUser(response.data.user);
        setIsAuthenticated(true);
        
        console.log('✅ Administrador registrado exitosamente:', response.data.user.correo);
        
        // ✅ LOGS DEL EDIFICIO CREADO
        if (response.data.buildingCreated && response.data.building) {
          console.log('🏢 Edificio creado automáticamente:');
          console.log('   - ID:', response.data.building.id);
          console.log('   - Nombre:', response.data.building.nombre);
          console.log('   - Dirección:', response.data.building.direccion);
        } else {
          console.warn('⚠️ No se pudo crear el edificio automáticamente');
        }
        
        // Redirigir al dashboard de admin
        window.location.href = '/admin/dashboard';
        
        return { 
          success: true, 
          user: response.data.user,
          buildingCreated: response.data.buildingCreated,
          building: response.data.building
        };
      } else {
        return { 
          success: false, 
          error: response.data.message 
        };
      }
    } catch (error) {
      console.error('❌ Error en registro:', error);
      
      if (error.response) {
        const errorMessage = error.response.data?.message || `Error ${error.response.status}`;
        console.error('❌ Error del servidor:', errorMessage);
        
        return { 
          success: false, 
          error: errorMessage
        };
      }
      
      console.error('❌ Error de conexión con el servidor');
      return { 
        success: false, 
        error: 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.' 
      };
    }
  };

  // ✅ VALOR DEL CONTEXTO
  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    registerAdmin,
    checkAuth,
    loginWithGoogle 
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};