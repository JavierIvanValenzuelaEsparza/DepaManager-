const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Rutas públicas
router.post('/login', authController.login);
router.post('/register-admin', authController.registerAdmin);

// Ruta protegida para verificar token
router.get('/verify', authMiddleware.verifyToken, authController.verifyToken);

module.exports = router;