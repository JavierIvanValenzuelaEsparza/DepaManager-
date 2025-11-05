const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// LOGIN DE USUARIO
const login = async (req, res) => {
  try {
    console.log('=== 🔍 INICIANDO LOGIN EN BACKEND ===');
    console.log('📥 Body COMPLETO recibido:', JSON.stringify(req.body, null, 2));
    console.log('📥 Headers:', req.headers);
    console.log('📥 Content-Type:', req.get('Content-Type'));

    const { correo, contrasenia } = req.body;

    // Validar campos requeridos
    if (!correo || !contrasenia) {
      console.log('❌ Campos faltantes en backend');
      return res.status(400).json({
        success: false,
        message: 'Correo y contraseña son requeridos'
      });
    }

    console.log('🔍 Buscando usuario en BD:', correo);

    // Buscar usuario por correo
    const usuario = await User.findOne({
      where: { correo }
    });

    if (!usuario) {
      console.log('❌ Usuario no encontrado en BD');
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    console.log('✅ Usuario encontrado ID:', usuario.idUsuario);
    console.log('🔍 Estado del usuario:', usuario.estado);
    console.log('🔍 Contraseña en BD existe?:', usuario.contrasenia ? 'SÍ' : 'NO');
    console.log('🔍 Método validarContrasenia existe?:', typeof usuario.validarContrasenia);

    // Verificar contraseña
    console.log('🔐 Iniciando verificación de contraseña...');
    let contraseniaValida;
    
    try {
      if (typeof usuario.validarContrasenia === 'function') {
        console.log('🔐 Usando método validarContrasenia...');
        contraseniaValida = await usuario.validarContrasenia(contrasenia);
      } else {
        console.log('⚠️ Usando bcrypt directamente...');
        contraseniaValida = await bcrypt.compare(contrasenia, usuario.contrasenia);
      }
      console.log('🔐 Resultado verificación contraseña:', contraseniaValida);
    } catch (bcryptError) {
      console.error('❌ Error en verificación de contraseña:', bcryptError);
      return res.status(500).json({
        success: false,
        message: 'Error al verificar contraseña'
      });
    }

    if (!contraseniaValida) {
      console.log('❌ Contraseña incorrecta en backend');
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar que el usuario esté activo
    if (usuario.estado !== 'Activo') {
      console.log('❌ Usuario inactivo en backend:', usuario.estado);
      return res.status(401).json({
        success: false,
        message: 'Tu cuenta no está activa. Contacta al administrador.'
      });
    }

    console.log('✅ Credenciales válidas, generando token...');

    // Generar token JWT
    let token;
    try {
      console.log('🔑 JWT_SECRET configurado?:', process.env.JWT_SECRET ? 'SÍ' : 'NO');
      console.log('🔑 Longitud JWT_SECRET:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 'NO DEFINIDO');
      
      token = jwt.sign(
        { 
          id: usuario.idUsuario,
          correo: usuario.correo,
          rol: usuario.rol 
        },
        process.env.JWT_SECRET || 'fallback_secret_2024',
        { expiresIn: '24h' }
      );
      console.log('✅ Token generado correctamente');
      console.log('🔑 Token (primeros 50 chars):', token ? token.substring(0, 50) + '...' : 'NO GENERADO');
    } catch (jwtError) {
      console.error('❌ Error al generar token JWT:', jwtError);
      return res.status(500).json({
        success: false,
        message: 'Error al generar token de autenticación'
      });
    }

    // Responder con datos del usuario
    const usuarioData = {
      id: usuario.idUsuario,
      nombre: usuario.nombreCompleto,
      correo: usuario.correo,
      rol: usuario.rol,
      telefono: usuario.telefono,
      estado: usuario.estado,
      plan: usuario.plan
    };

    console.log('📤 Preparando respuesta para frontend:', {
      success: true,
      message: 'Login exitoso',
      token: token ? 'PRESENTE' : 'AUSENTE',
      user: usuarioData
    });

    // ✅ ENVIAR RESPUESTA
    console.log('🚀 Enviando respuesta al frontend...');
    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      user: usuarioData
    });

    console.log('✅ Respuesta enviada al frontend para:', usuario.correo);

  } catch (error) {
    console.error('❌ Error completo en login backend:', error);
    console.error('❌ Stack trace:', error.stack);
    console.error('❌ Tipo de error:', error.name);
    console.error('❌ Mensaje de error:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor: ' + error.message
    });
  }
};

// REGISTRO DE ADMINISTRADOR - VERSIÓN CORREGIDA
const registerAdmin = async (req, res) => {
  try {
    console.log('=== 🔍 INICIANDO REGISTRO EN BACKEND ===');
    console.log('📥 Body COMPLETO recibido:', req.body);

    // ✅ ACEPTAR nombre_completo Y nombre
    const { 
      nombre, 
      nombre_completo,
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
    console.log('🔍 Verificando si el correo existe:', correo);
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
    let nuevoUsuario;
    try {
      nuevoUsuario = await User.create({
        nombreCompleto: nombreFinal,
        correo,
        contrasenia,
        rol: 'Administrador',
        telefono: telefono || null,
        dni: dni || null,
        estado: 'Activo'
      });
      console.log('✅ Usuario creado ID:', nuevoUsuario.idUsuario);
    } catch (createError) {
      console.error('❌ Error al crear usuario:', createError);
      return res.status(500).json({
        success: false,
        message: 'Error al crear usuario: ' + createError.message
      });
    }

    // Generar token
    let token;
    try {
      token = jwt.sign(
        { 
          id: nuevoUsuario.idUsuario,
          correo: nuevoUsuario.correo,
          rol: nuevoUsuario.rol 
        },
        process.env.JWT_SECRET || 'fallback_secret_2024',
        { expiresIn: '24h' }
      );
      console.log('✅ Token generado para registro');
    } catch (jwtError) {
      console.error('❌ Error al generar token en registro:', jwtError);
      return res.status(500).json({
        success: false,
        message: 'Error al generar token de autenticación'
      });
    }

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
    console.log('🚀 Enviando respuesta de registro...');

    res.status(201).json({
      success: true,
      message: 'Administrador registrado exitosamente',
      token,
      user: usuarioData
    });

    console.log('✅ Respuesta de registro enviada');

  } catch (error) {
    console.error('❌ Error completo en registro:', error);
    console.error('❌ Stack trace:', error.stack);
    console.error('❌ Tipo de error:', error.name);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor: ' + error.message
    });
  }
};

// VERIFICAR TOKEN
const verifyToken = async (req, res) => {
  try {
    console.log('=== 🔍 VERIFICANDO TOKEN ===');
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    console.log('🔑 Token recibido:', token ? 'PRESENTE' : 'AUSENTE');
    
    if (!token) {
      console.log('❌ Token no proporcionado');
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_2024');
    console.log('✅ Token decodificado:', decoded);
    
    // Buscar usuario
    const usuario = await User.findByPk(decoded.id, {
      attributes: { exclude: ['contrasenia'] }
    });

    if (!usuario) {
      console.log('❌ Usuario no encontrado para token:', decoded.id);
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    console.log('✅ Usuario encontrado para verificación:', usuario.correo);

    res.json({
      success: true,
      user: {
        id: usuario.idUsuario,
        nombre: usuario.nombreCompleto,
        correo: usuario.correo,
        rol: usuario.rol,
        telefono: usuario.telefono,
        estado: usuario.estado
      }
    });

  } catch (error) {
    console.error('❌ Error verificando token:', error);
    console.error('❌ Stack trace:', error.stack);
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