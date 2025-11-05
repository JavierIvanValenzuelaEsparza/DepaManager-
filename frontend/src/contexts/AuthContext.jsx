import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('depamanager_token');
      if (token) {
        console.log('🔍 Verificando token...');
        const response = await authAPI.verifyToken();
        if (response.success) {
          // ✅ CAMBIAR: response.usuario → response.user
          setUser(response.user);
          console.log('✅ Usuario autenticado:', response.user.correo);
        } else {
          localStorage.removeItem('depamanager_token');
          localStorage.removeItem('depamanager_user');
        }
      }
    } catch (error) {
      console.error('❌ Error verificando autenticación:', error);
      localStorage.removeItem('depamanager_token');
      localStorage.removeItem('depamanager_user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      console.log('🔐 Iniciando proceso de login...');
      const response = await authAPI.login(credentials);
      
      console.log('✅ Respuesta completa del login:', response);
      
      if (response.success) {
        // ✅ CAMBIAR: response.usuario → response.user
        localStorage.setItem('depamanager_token', response.token);
        localStorage.setItem('depamanager_user', JSON.stringify(response.user));
        setUser(response.user);
        console.log('✅ Login exitoso, usuario:', response.user.correo);
        return { success: true, data: response };
      } else {
        console.log('❌ Login falló:', response.message);
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('❌ Error completo en login:', error);
      const errorMessage = error.response?.data?.message || 'Error de conexión con el servidor';
      console.error('❌ Error en login:', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const registerAdmin = async (userData) => {
    try {
      console.log('👤 Iniciando proceso de registro...');
      const response = await authAPI.registerAdmin(userData);
      
      console.log('✅ Respuesta completa del registro:', response);
      
      if (response.success) {
        // ✅ CAMBIAR: response.usuario → response.user
        localStorage.setItem('depamanager_token', response.token);
        localStorage.setItem('depamanager_user', JSON.stringify(response.user));
        setUser(response.user);
        console.log('✅ Registro exitoso, usuario:', response.user.correo);
        return { success: true, data: response };
      } else {
        console.log('❌ Registro falló:', response.message);
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('❌ Error completo en registro:', error);
      const errorMessage = error.response?.data?.message || 'Error de conexión con el servidor';
      console.error('❌ Error en registro:', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    console.log('🚪 Cerrando sesión...');
    localStorage.removeItem('depamanager_token');
    localStorage.removeItem('depamanager_user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    registerAdmin,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};