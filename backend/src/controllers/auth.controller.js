const bcrypt = require('bcryptjs');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const { User, Building } = require('../models'); // ✅ Ya está importado

// ✅ LOGIN DE USUARIO - Funciona para Admin e Inquilino
const login = async (req, res) => {
  try {
    console.log('=== 🔍 INICIANDO LOGIN EN BACKEND ===');
    console.log('📥 Body COMPLETO recibido:', JSON.stringify(req.body, null, 2));
    console.log('📥 Content-Type:', req.get('Content-Type'));

    // ✅ Extraer correo y contraseña (aceptar ambas variantes)
    const { correo, contrasenia, contraseña } = req.body;
    
    // Usar la que venga (con o sin ñ)
    const password = contrasenia || contraseña;

    // ✅ Validar campos requeridos
    if (!correo || !password) {
      console.log('❌ Campos faltantes - correo:', correo ? '✅' : '❌', 'password:', password ? '✅' : '❌');
      return res.status(400).json({
        success: false,
        message: 'Correo y contraseña son requeridos'
      });
    }

    console.log('🔍 Buscando usuario en BD:', correo);

    // ✅ Buscar usuario por correo
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
    console.log('� Rol:', usuario.rol);
    console.log('� Estado:', usuario.estado);

    // ✅ Verificar contraseña
    console.log('🔐 Verificando contraseña...');
    let contraseniaValida;
    
    try {
      if (typeof usuario.validarContrasenia === 'function') {
        contraseniaValida = await usuario.validarContrasenia(password);
      } else {
        contraseniaValida = await bcrypt.compare(password, usuario.contrasenia);
      }
      console.log('🔐 Contraseña válida:', contraseniaValida ? '✅' : '❌');
    } catch (bcryptError) {
      console.error('❌ Error en verificación de contraseña:', bcryptError);
      return res.status(500).json({
        success: false,
        message: 'Error al verificar contraseña'
      });
    }

    if (!contraseniaValida) {
      console.log('❌ Contraseña incorrecta');
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // ✅ Verificar que el usuario esté activo
    if (usuario.estado !== 'Activo') {
      console.log('❌ Usuario inactivo:', usuario.estado);
      return res.status(401).json({
        success: false,
        message: 'Tu cuenta no está activa. Contacta al administrador.'
      });
    }

    console.log('✅ Credenciales válidas, generando token...');

    // ✅ Generar token JWT
    const token = jwt.sign(
      { 
        id: usuario.idUsuario,
        correo: usuario.correo,
        rol: usuario.rol 
      },
      process.env.JWT_SECRET || 'fallback_secret_2024',
      { expiresIn: '24h' }
    );
    
    console.log('✅ Token generado correctamente');

    // ✅ Preparar datos del usuario para respuesta
    const usuarioData = {
      id: usuario.idUsuario,
      nombre: usuario.nombreCompleto,
      correo: usuario.correo,
      rol: usuario.rol,
      telefono: usuario.telefono,
      estado: usuario.estado,
      plan: usuario.plan
    };

    console.log('📤 Enviando respuesta exitosa al frontend');
    console.log('👤 Usuario:', usuarioData.correo);
    console.log('🎭 Rol:', usuarioData.rol);

    // ✅ ENVIAR RESPUESTA EXITOSA
    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      user: usuarioData
    });

    console.log('✅ Login completado exitosamente para:', usuario.correo);

  } catch (error) {
    console.error('❌ Error completo en login backend:', error);
    console.error('❌ Stack trace:', error.stack);
    
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

    const nombreFinal = nombre_completo || nombre;
    console.log('🔍 Nombre final a usar:', nombreFinal);

    if (!nombreFinal || !correo || !contrasenia) {
      console.log('❌ Campos faltantes');
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

    // Crear usuario administrador
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
      
      // ✅ MANEJO ESPECÍFICO DE ERRORES DE VALIDACIÓN
      if (createError.name === 'SequelizeUniqueConstraintError') {
        // Error de campo único duplicado (correo o DNI)
        const field = createError.errors[0]?.path;
        let mensaje = 'Ya existe un registro con estos datos';
        
        if (field === 'correo') {
          mensaje = 'El correo electrónico ya está registrado';
        } else if (field === 'dni') {
          mensaje = 'El DNI ya está registrado';
        }
        
        console.log('⚠️ Error de unicidad en campo:', field);
        return res.status(400).json({
          success: false,
          message: mensaje,
          field: field
        });
      }
      
      // ✅ Error genérico
      return res.status(500).json({
        success: false,
        message: 'Error al crear usuario: ' + createError.message
      });
    }

    // ✅ CREAR EDIFICIO POR DEFECTO AUTOMÁTICAMENTE
    console.log('🏗️ Creando edificio por defecto para el nuevo administrador...');
    console.log('🔍 ID del administrador:', nuevoUsuario.idUsuario);
    
    let edificioPorDefecto;
    let edificioCreado = false;
    
    try {
      edificioPorDefecto = await Building.create({
        idAdministrador: nuevoUsuario.idUsuario,
        nombre: 'Mi Edificio Principal',
        direccion: 'Actualiza la dirección en configuración',
        totalDepartamentos: 0
      });
      
      edificioCreado = true;
      console.log('✅ Edificio por defecto creado exitosamente!');
      console.log('🏢 ID Edificio:', edificioPorDefecto.idEdificio);
      console.log('🏢 Nombre:', edificioPorDefecto.nombre);
      console.log('🏢 Administrador ID:', edificioPorDefecto.idAdministrador);
      
    } catch (buildingError) {
      console.error('❌ Error creando edificio por defecto:', buildingError);
      console.error('❌ Detalles del error:', buildingError.message);
      console.error('❌ Stack:', buildingError.stack);
      // No hacemos return aquí para no interrumpir el registro, pero lo registramos
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

    // ✅ DATOS DEL EDIFICIO CREADO (si existe)
    const edificioData = edificioPorDefecto ? {
      id: edificioPorDefecto.idEdificio,
      nombre: edificioPorDefecto.nombre,
      direccion: edificioPorDefecto.direccion,
      totalDepartamentos: edificioPorDefecto.totalDepartamentos
    } : null;

    console.log('🎉 Registro exitoso para:', nuevoUsuario.correo);
    console.log('🏢 Edificio creado:', edificioCreado ? 'SÍ' : 'NO');
    console.log('🚀 Enviando respuesta de registro...');

    res.status(201).json({
      success: true,
      message: 'Administrador registrado exitosamente',
      token,
      user: usuarioData,
      buildingCreated: edificioCreado, // ✅ Booleano si se creó edificio
      building: edificioData // ✅ DATOS COMPLETOS DEL EDIFICIO CREADO
    });

    console.log('✅ Respuesta de registro enviada');
    console.log('📊 Resumen: Usuario creado + Edificio creado =', edificioCreado);

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
// ✅ INICIAR AUTENTICACIÓN CON GOOGLE
const googleAuth = (req, res, next) => {
  console.log('🔐 Iniciando autenticación Google...');
  // Capturar el contexto (admin o tenant)
  const context = req.query.context || 'tenant';
  console.log('📍 Contexto de login:', context);
  
  // Guardar contexto en cookie (más confiable que state)
  res.cookie('oauth_context', context, {
    httpOnly: true,
    maxAge: 10 * 60 * 1000, // 10 minutos
    sameSite: 'lax'
  });
  
  console.log('🍪 Cookie oauth_context guardada:', context);
  
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    state: JSON.stringify({ context })  // Mantener state como backup
  })(req, res, next);
};

// ✅ CALLBACK DE GOOGLE OAUTH
const googleCallback = (req, res, next) => {
  console.log('🔐 Google OAuth callback recibido');
  console.log('🔍 Query params:', req.query);
  console.log('🍪 Cookies:', req.cookies);
  
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/admin/auth?error=auth_failed`
  }, (err, user, info) => {
    if (err) {
      console.error('❌ Error en Google callback:', err);
      res.clearCookie('oauth_context');
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/admin/auth?error=auth_failed`);
    }

    if (!user) {
      console.error('❌ Usuario no encontrado en Google callback');
      res.clearCookie('oauth_context');
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/admin/auth?error=user_not_found`);
    }

    try {
      // Leer contexto desde cookie (más confiable)
      let context = req.cookies.oauth_context || 'tenant';
      
      // Si no hay cookie, intentar desde state
      if (!req.cookies.oauth_context && req.query.state) {
        try {
          const stateData = JSON.parse(req.query.state);
          context = stateData.context || 'tenant';
        } catch (e) {
          context = req.query.state || 'tenant';
        }
      }
      
      console.log('📍 Contexto del callback:', context);
      console.log('🎭 Rol del usuario:', user.rol);
      
      // Limpiar cookie
      res.clearCookie('oauth_context');
      
      // ✅ VALIDAR QUE EL ROL COINCIDA CON EL CONTEXTO
      if (context === 'admin' && user.rol !== 'Administrador') {
        console.error('❌ ACCESO DENEGADO: Inquilino intentando acceder a zona de admin');
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
        return res.redirect(`${frontendUrl}/tenant/login?error=wrong_portal&message=Esta cuenta es de inquilino`);
      }
      
      if (context === 'tenant' && user.rol !== 'Inquilino') {
        console.error('❌ ACCESO DENEGADO: Administrador intentando acceder a zona de inquilinos');
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
        return res.redirect(`${frontendUrl}/admin/auth?error=wrong_portal&message=Esta cuenta es de administrador`);
      }
      
      // Generar token JWT solo si el rol coincide
      const token = jwt.sign(
        { 
          id: user.idUsuario,
          correo: user.correo,
          rol: user.rol 
        },
        process.env.JWT_SECRET || 'fallback_secret_2024',
        { expiresIn: '24h' }
      );

      console.log('✅ Google OAuth exitoso para:', user.correo);
      console.log('✅ Validación de contexto pasada');
      
      // Redirigir al frontend con el token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      const redirectUrl = `${frontendUrl}/oauth-success?token=${token}&role=${user.rol}`;
      
      console.log('🔀 Redirigiendo a:', redirectUrl);
      res.redirect(redirectUrl);

    } catch (error) {
      console.error('❌ Error generando token en Google callback:', error);
      res.clearCookie('oauth_context');
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/admin/auth?error=token_error`);
    }
  })(req, res, next);
};

module.exports = {
  login,
  registerAdmin,
  verifyToken,
  googleAuth,
  googleCallback
};
