const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middlewares/auth.middleware');
const tenantMiddleware = require('../middlewares/tenant.middleware');

// Controladores
const dashboardController = require('../controllers/tenant/dashboard.controller');
const paymentsController = require('../controllers/tenant/payments.controller');
const incidentsController = require('../controllers/tenant/incidents.controller');
const contractsController = require('../controllers/tenant/contracts.controller');
const notificationsController = require('../controllers/tenant/notifications.controller');

// Aplicar middlewares a todas las rutas
router.use(verifyToken);
router.use(tenantMiddleware);

// Dashboard
router.get('/dashboard', dashboardController.getDashboard);

// Pagos
router.get('/pagos', paymentsController.getPayments);
router.post('/pagos/:idPago/comprobante', paymentsController.uploadPaymentReceipt);

// Incidencias
router.get('/incidencias', incidentsController.getIncidents);
router.post('/incidencias', incidentsController.reportIncident);

// Contratos
router.get('/contratos', contractsController.getContracts);

// Notificaciones
router.get('/notificaciones', notificationsController.getNotifications);
router.patch('/notificaciones/:id/leer', notificationsController.markAsRead);

module.exports = router;