const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// LOGIN DE USUARIO
const login = async (req, res) => {
  try {
    console.log('=== 🔍 DEBUG BACKEND REGISTRO ===');
    console.log('📥 Body COMPLETO recibido:', JSON.stringify(req.body, null, 2));
    console.log('📥 Headers:', req.headers);
    console.log('📥 Content-Type:', req.get('Content-Type'));

    const { correo, contrasenia } = req.body;

    // Validar campos requeridos
    if (!correo || !contrasenia) {
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

    console.log('✅ Usuario encontrado ID:', usuario.idUsuario); // ✅ CAMBIADO: id_usuario → idUsuario

        // ✅ AGREGAR ESTOS LOGS CRÍTICOS:
    console.log('🔍 Estado del usuario:', usuario.estado);
    console.log('🔍 Contraseña recibida del frontend:', contrasenia ? '***' : 'VACÍA');
    console.log('🔍 Contraseña en BD existe?:', usuario.contrasenia ? 'SÍ' : 'NO');
    console.log('🔍 Método validarContrasenia existe?:', typeof usuario.validarContrasenia);


    // Verificar contraseña usando el método del modelo
    let contraseniaValida;
    if (typeof usuario.validarContrasenia === 'function') {
      contraseniaValida = await usuario.validarContrasenia(contrasenia);
    } else {
      // Fallback si el método no existe
      console.log('⚠️ Usando bcrypt directamente');
      contraseniaValida = await bcrypt.compare(contrasenia, usuario.contrasenia);
    }

    if (!contraseniaValida) {
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
        id: usuario.idUsuario, // ✅ CAMBIADO: id_usuario → idUsuario
        correo: usuario.correo,
        rol: usuario.rol 
      },
      process.env.JWT_SECRET || 'fallback_secret_2024',
      { expiresIn: '24h' }
    );

    // Responder con datos del usuario - USAR LOS NOMBRES DEL MODELO
    const usuarioData = {
      id: usuario.idUsuario, // ✅ CAMBIADO
      nombre: usuario.nombreCompleto, // ✅ CAMBIADO: nombre_completo → nombreCompleto
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
      user: usuarioData // ✅ CAMBIADO: usuario → user (para consistencia con frontend)
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor: ' + error.message
    });
  }
};

// REGISTRO DE ADMINISTRADOR
// REGISTRO DE ADMINISTRADOR - VERSIÓN CORREGIDA
const registerAdmin = async (req, res) => {
  try {
    console.log('=== 🔍 DEBUG BACKEND REGISTRO ===');
    console.log('📥 Body COMPLETO recibido:', req.body);

    // ✅ ACEPTAR nombre_completo Y nombre
    const { 
      nombre, 
      nombre_completo,  // ← AGREGAR ESTE CAMPO
      correo, 
      contrasenia, 
      telefono, 
      dni 
    } = req.body;

    console.log('🔍 Campos recibidos:', {
      nombre,
      nombre_completo,
      correo,
      contrasenia: contrasenia ? '***' : 'VACÍA',
      telefono,
      dni
    });

    // ✅ USAR nombre_completo SI ESTÁ PRESENTE, SINO nombre
    const nombreFinal = nombre_completo || nombre;

    console.log('🔍 Nombre final a usar:', nombreFinal);

    // Validar campos requeridos CON EL NOMBRE FINAL
    if (!nombreFinal || !correo || !contrasenia) {
      console.log('❌ Campos faltantes:', {
        nombre: !!nombreFinal,
        correo: !!correo,
        contrasenia: !!contrasenia
      });
      return res.status(400).json({
        success: false,
        message: 'Nombre, correo y contraseña son requeridos'
      });
    }

    // Verificar si el correo ya existe
    const usuarioExistente = await User.findOne({ where: { correo } });
    if (usuarioExistente) {
      console.log('❌ Correo ya registrado:', correo);
      return res.status(400).json({
        success: false,
        message: 'El correo ya está registrado'
      });
    }

    console.log('👤 Creando nuevo usuario administrador...');

    // Crear usuario administrador - USAR nombreFinal
    const nuevoUsuario = await User.create({
      nombreCompleto: nombreFinal,  // ✅ Usar el nombre normalizado
      correo,
      contrasenia,
      rol: 'Administrador',
      telefono: telefono || null,
      dni: dni || null,
      estado: 'Activo'
    });

    console.log('✅ Usuario creado ID:', nuevoUsuario.idUsuario);

    // Generar token
    const token = jwt.sign(
      { 
        id: nuevoUsuario.idUsuario,
        correo: nuevoUsuario.correo,
        rol: nuevoUsuario.rol 
      },
      process.env.JWT_SECRET || 'fallback_secret_2024',
      { expiresIn: '24h' }
    );

    // Responder sin contraseña
    const usuarioData = {
      id: nuevoUsuario.idUsuario,
      nombre: nuevoUsuario.nombreCompleto,
      correo: nuevoUsuario.correo,
      rol: nuevoUsuario.rol,
      telefono: nuevoUsuario.telefono,
      estado: nuevoUsuario.estado
    };

    console.log('🎉 Registro exitoso para:', nuevoUsuario.correo);

    res.status(201).json({
      success: true,
      message: 'Administrador registrado exitosamente',
      token,
      user: usuarioData
    });

  } catch (error) {
    console.error('❌ Error completo en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor: ' + error.message
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_2024');
    
    // Buscar usuario
    const usuario = await User.findByPk(decoded.id, {
      attributes: { exclude: ['contrasenia'] }
    });

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      user: { // ✅ CAMBIADO: usuario → user
        id: usuario.idUsuario, // ✅ CAMBIADO
        nombre: usuario.nombreCompleto, // ✅ CAMBIADO
        correo: usuario.correo,
        rol: usuario.rol,
        telefono: usuario.telefono,
        estado: usuario.estado
      }
    });

  } catch (error) {
    console.error('❌ Error verificando token:', error);
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

module.exports = {
  login,
  registerAdmin,
  verifyToken
};