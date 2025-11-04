export const storage = {
  // Guardar token
  setToken: (token) => {
    localStorage.setItem('token', token);
  },

  // Obtener token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Guardar datos de usuario
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Obtener datos de usuario
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Limpiar almacenamiento (logout)
  clear: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};