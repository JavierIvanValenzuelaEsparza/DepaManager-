const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authMiddleware = {
  // Verificar token
  verifyToken: async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          success: false,
          mensaje: 'Acceso denegado. Token no proporcionado.'
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_depamanager');
      
      // Verificar que el usuario exista
      const usuario = await User.findByPk(decoded.id);
      if (!usuario) {
        return res.status(401).json({
          success: false,
          mensaje: 'Token inválido - usuario no existe'
        });
      }

      // Agregar usuario al request
      req.usuario = usuario;
      next();

    } catch (error) {
      console.error('Error en auth middleware:', error);
      res.status(401).json({
        success: false,
        mensaje: 'Token inválido'
      });
    }
  },

  // Verificar rol de administrador
  verifyAdmin: (req, res, next) => {
    if (req.usuario.rol !== 'Administrador') {
      return res.status(403).json({
        success: false,
        mensaje: 'Acceso denegado. Se requiere rol de administrador.'
      });
    }
    next();
  },

  // Verificar rol de inquilino
  verifyTenant: (req, res, next) => {
    if (req.usuario.rol !== 'Inquilino') {
      return res.status(403).json({
        success: false,
        mensaje: 'Acceso denegado. Se requiere rol de inquilino.'
      });
    }
    next();
  }
};

module.exports = authMiddleware;