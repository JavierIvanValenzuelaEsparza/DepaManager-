const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// LOGIN DE USUARIO
const login = async (req, res) => {
  try {
    const { correo, contraseña } = req.body;

    // Validar campos requeridos
    if (!correo || !contraseña) {
      return res.status(400).json({
        success: false,
        message: 'Correo y contraseña son requeridos'
      });
    }

    console.log('🔍 Buscando usuario:', correo);

    // Buscar usuario por correo
    const usuario = await User.findOne({
      where: { correo }
    });

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    console.log('✅ Usuario encontrado:', usuario.id_usuario);

    // Verificar contraseña
    const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!contraseñaValida) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar que el usuario esté activo
    if (usuario.estado !== 'Activo') {
      return res.status(401).json({
        success: false,
        message: 'Tu cuenta no está activa. Contacta al administrador.'
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: usuario.id_usuario, 
        correo: usuario.correo,
        rol: usuario.rol 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Responder con datos del usuario
    const usuarioData = {
      id: usuario.id_usuario,
      nombre_completo: usuario.nombre_completo,
      correo: usuario.correo,
      rol: usuario.rol,
      telefono: usuario.telefono,
      estado: usuario.estado,
      plan: usuario.plan
    };

    console.log('✅ Login exitoso para:', usuario.correo);

    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      usuario: usuarioData
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// REGISTRO DE ADMINISTRADOR
const registerAdmin = async (req, res) => {
  try {
    const { nombre_completo, correo, contraseña, telefono, dni } = req.body;

    // Validar campos requeridos
    if (!nombre_completo || !correo || !contraseña) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, correo y contraseña son requeridos'
      });
    }

    // Verificar si el correo ya existe
    const usuarioExistente = await User.findOne({ where: { correo } });
    if (usuarioExistente) {
      return res.status(400).json({
        success: false,
        message: 'El correo ya está registrado'
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
      rol: 'Administrador',
      telefono,
      dni,
      estado: 'Activo'
    });

    // Generar token
    const token = jwt.sign(
      { 
        id: nuevoUsuario.id_usuario, 
        correo: nuevoUsuario.correo,
        rol: nuevoUsuario.rol 
      },
      process.env.JWT_SECRET,
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
      message: 'Administrador registrado exitosamente',
      token,
      usuario: usuarioData
    });

  } catch (error) {
    console.error('❌ Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// VERIFICAR TOKEN
const verifyToken = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuario
    const usuario = await User.findByPk(decoded.id, {
      attributes: { exclude: ['contraseña'] }
    });

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      usuario
    });

  } catch (error) {
    console.error('❌ Error verificando token:', error);
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

// ✅ EXPORTAR LAS FUNCIONES DIRECTAMENTE
module.exports = {
  login,
  registerAdmin,
  verifyToken
};