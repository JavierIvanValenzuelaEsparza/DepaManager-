const express = require('express');
const router = express.Router();

// ✅ IMPORTAR CORRECTAMENTE desestructurando
const { login, registerAdmin, verifyToken } = require('../controllers/auth.controller');

// ✅ Debug: Verificar que las funciones existen
console.log('🔍 AuthController - login:', typeof login);
console.log('🔍 AuthController - registerAdmin:', typeof registerAdmin);
console.log('🔍 AuthController - verifyToken:', typeof verifyToken);

// Rutas públicas
router.post('/login', login);
router.post('/register-admin', registerAdmin);
router.get('/verify', verifyToken);

// Ruta de prueba para auth
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: '✅ Auth routes funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;