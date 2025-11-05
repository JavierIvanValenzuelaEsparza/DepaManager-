/**
 * Middleware para verificar que el usuario es un inquilino
 * Compatible con sincronización automática de Sequelize
 */
const tenantMiddleware = (req, res, next) => {
  try {
    console.log('🔍 Verificando rol de inquilino para usuario:', req.user.id);
    
    // Verificar que el usuario tenga rol de inquilino
    if (req.user.rol !== 'Inquilino') {
      console.log('❌ Usuario no es inquilino:', req.user.rol);
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Solo los inquilinos pueden acceder a esta ruta.'
      });
    }

    console.log('✅ Usuario verificado como inquilino');
    next();
  } catch (error) {
    console.error('❌ Error en middleware de inquilino:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = tenantMiddleware;