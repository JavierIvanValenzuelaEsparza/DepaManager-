import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api/auth';
import { storage } from '../services/storage';

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
      const token = storage.getToken();
      if (token) {
        const response = await authAPI.verifyToken();
        if (response.success) {
          setUser(response.usuario);
          storage.setUser(response.usuario);
        }
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      storage.clear();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      if (response.success) {
        storage.setToken(response.token);
        storage.setUser(response.usuario);
        setUser(response.usuario);
        return { success: true, data: response };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.mensaje || 'Error en el login' 
      };
    }
  };

  const registerAdmin = async (userData) => {
    try {
      const response = await authAPI.registerAdmin(userData);
      if (response.success) {
        storage.setToken(response.token);
        storage.setUser(response.usuario);
        setUser(response.usuario);
        return { success: true, data: response };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.mensaje || 'Error en el registro' 
      };
    }
  };

  const logout = () => {
    storage.clear();
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