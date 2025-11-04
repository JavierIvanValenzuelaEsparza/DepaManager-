const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// ✅ Debug: Verificar que el controlador se importa correctamente
console.log('🔍 AuthController importado en routes:', typeof authController.login);

// Rutas públicas
router.post('/login', authController.login);
router.post('/register-admin', authController.registerAdmin);
router.get('/verify', authController.verifyToken);

module.exports = router;