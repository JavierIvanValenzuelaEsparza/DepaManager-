const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { ROLES, USER_STATUS } = require('../utils/constants');

const authController = {
  // LOGIN DE USUARIO
  login: async (req, res) => {
    try {
      const { correo, contraseña } = req.body;

      // Validar campos requeridos
      if (!correo || !contraseña) {
        return res.status(400).json({
          success: false,
          mensaje: 'Correo y contraseña son requeridos'
        });
      }

      // Buscar usuario por correo
      const usuario = await User.findOne({
        where: { correo }
      });

      if (!usuario) {
        return res.status(401).json({
          success: false,
          mensaje: 'Credenciales inválidas'
        });
      }

      // Verificar contraseña
      const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña);
      if (!contraseñaValida) {
        return res.status(401).json({
          success: false,
          mensaje: 'Credenciales inválidas'
        });
      }

      // Verificar que el usuario esté activo
      if (usuario.estado !== USER_STATUS.ACTIVE) {
        return res.status(401).json({
          success: false,
          mensaje: 'Tu cuenta no está activa. Contacta al administrador.'
        });
      }

      // Generar token JWT
      const token = jwt.sign(
        { 
          id: usuario.id_usuario, 
          correo: usuario.correo,
          rol: usuario.rol 
        },
        process.env.JWT_SECRET || 'secreto_depamanager',
        { expiresIn: '24h' }
      );

      // Responder con datos del usuario (sin contraseña)
      const usuarioData = {
        id: usuario.id_usuario,
        nombre_completo: usuario.nombre_completo,
        correo: usuario.correo,
        rol: usuario.rol,
        telefono: usuario.telefono,
        estado: usuario.estado,
        plan: usuario.plan
      };

      res.json({
        success: true,
        mensaje: 'Login exitoso',
        token,
        usuario: usuarioData
      });

    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error interno del servidor'
      });
    }
  },

  // REGISTRO DE ADMINISTRADOR
  registerAdmin: async (req, res) => {
    try {
      const { nombre_completo, correo, contraseña, telefono, dni } = req.body;

      // Validar campos requeridos
      if (!nombre_completo || !correo || !contraseña) {
        return res.status(400).json({
          success: false,
          mensaje: 'Nombre, correo y contraseña son requeridos'
        });
      }

      // Verificar si el correo ya existe
      const usuarioExistente = await User.findOne({ where: { correo } });
      if (usuarioExistente) {
        return res.status(400).json({
          success: false,
          mensaje: 'El correo ya está registrado'
        });
      }

      // Hashear contraseña
      const saltRounds = 10;
      const contraseñaHash = await bcrypt.hash(contraseña, saltRounds);

      // Crear usuario administrador
      const nuevoUsuario = await User.create({
        nombre_completo,
        correo,
        contraseña: contraseñaHash,
        rol: ROLES.ADMIN,
        telefono,
        dni,
        estado: USER_STATUS.ACTIVE
      });

      // Generar token
      const token = jwt.sign(
        { 
          id: nuevoUsuario.id_usuario, 
          correo: nuevoUsuario.correo,
          rol: nuevoUsuario.rol 
        },
        process.env.JWT_SECRET || 'secreto_depamanager',
        { expiresIn: '24h' }
      );

      // Responder sin contraseña
      const usuarioData = {
        id: nuevoUsuario.id_usuario,
        nombre_completo: nuevoUsuario.nombre_completo,
        correo: nuevoUsuario.correo,
        rol: nuevoUsuario.rol,
        telefono: nuevoUsuario.telefono,
        estado: nuevoUsuario.estado
      };

      res.status(201).json({
        success: true,
        mensaje: 'Administrador registrado exitosamente',
        token,
        usuario: usuarioData
      });

    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error interno del servidor'
      });
    }
  },

  // VERIFICAR TOKEN (para mantener sesión)
  verifyToken: async (req, res) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          success: false,
          mensaje: 'Token no proporcionado'
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_depamanager');
      
      // Buscar usuario
      const usuario = await User.findByPk(decoded.id, {
        attributes: { exclude: ['contraseña'] }
      });

      if (!usuario) {
        return res.status(401).json({
          success: false,
          mensaje: 'Usuario no encontrado'
        });
      }

      res.json({
        success: true,
        usuario
      });

    } catch (error) {
      console.error('Error verificando token:', error);
      res.status(401).json({
        success: false,
        mensaje: 'Token inválido'
      });
    }
  }
};

module.exports = authController;