const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');

console.log('🔐 Configurando Google OAuth:');
console.log('   - Client ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Configurado' : '❌ No configurado');
console.log('   - Callback URL:', process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || "/auth/google/callback",
  passReqToCallback: true  // Para acceder a req en el callback
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    console.log('🔐 Google OAuth Profile:', {
      id: profile.id,
      displayName: profile.displayName,
      email: profile.emails?.[0]?.value,
      provider: profile.provider
    });
    
    // Leer contexto desde cookie (más confiable)
    let context = req.cookies?.oauth_context || 'tenant';
    
    // Si no hay cookie, intentar desde state como fallback
    if (!req.cookies?.oauth_context) {
      try {
        if (req.query.state) {
          const stateData = JSON.parse(req.query.state);
          context = stateData.context || 'tenant';
        }
      } catch (e) {
        context = req.query.state || 'tenant';
      }
    }
    
    console.log('📍 Contexto decodificado:', context);
    console.log('🍪 Cookie context:', req.cookies?.oauth_context);
    
    // Buscar usuario por googleId
    let user = await User.findOne({ 
      where: { googleId: profile.id } 
    });

    if (user) {
      console.log('✅ Usuario existente encontrado con Google OAuth');
      console.log('🎭 Rol existente:', user.rol);
      return done(null, user);
    }

    // Buscar por email (en caso de que ya esté registrado localmente)
    user = await User.findOne({ 
      where: { correo: profile.emails[0].value } 
    });

    if (user) {
      // Actualizar usuario existente con googleId
      user.googleId = profile.id;
      user.authProvider = 'google';
      user.emailVerified = true;
      await user.save();
      console.log('✅ Usuario existente actualizado con Google OAuth');
      console.log('🎭 Rol existente:', user.rol);
      return done(null, user);
    }

    // Determinar rol según contexto
    const rol = context === 'admin' ? 'Administrador' : 'Inquilino';
    console.log('🎭 Rol asignado para nuevo usuario:', rol);
    
    // Crear nuevo usuario según el contexto
    const newUser = await User.create({
      googleId: profile.id,
      nombreCompleto: profile.displayName,
      correo: profile.emails[0].value,
      contrasenia: 'oauth_user_no_password', // Contraseña dummy para usuarios OAuth
      rol: rol,  // Rol según contexto de login
      authProvider: 'google',
      emailVerified: true,
      estado: 'Activo'
    });

    console.log('✅ Nuevo usuario creado con Google OAuth');
    return done(null, newUser);

  } catch (error) {
    console.error('❌ Error en Google OAuth:', error);
    return done(error, null);
  }
}));

// Serialización simple (no usamos sesiones)
passport.serializeUser((user, done) => {
  done(null, user.idUsuario);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;