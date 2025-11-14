const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware');

// Importar controladores (AGREGAR ESTOS)
const dashboardController = require('../controllers/admin/dashboard.controller');
const departmentsController = require('../controllers/admin/departments.controller');
const buildingsController = require('../controllers/admin/buildings.controller');
const tenantsController = require('../controllers/admin/tenants.controller');
const incidentsController = require('../controllers/admin/incidents.controller'); // ✅ NUEVO
const providersController = require('../controllers/admin/providers.controller'); // ✅ NUEVO
const applicantController = require('../controllers/admin/applicants.controller');

console.log('✅ Controladores cargados correctamente');

// ==================== ✅ RUTAS DEL DASHBOARD ====================
router.get('/dashboard', verifyToken, verifyAdmin, dashboardController.getDashboardData);

// ==================== ✅ RUTAS DE EDIFICIOS ====================
router.get('/buildings', verifyToken, verifyAdmin, buildingsController.getBuildings);

// ==================== ✅ RUTAS DE DEPARTAMENTOS ====================
router.get('/departments', verifyToken, verifyAdmin, departmentsController.getDepartments);
router.get('/departments/available', verifyToken, verifyAdmin, departmentsController.getAvailableDepartments);
router.get('/departments/:id', verifyToken, verifyAdmin, departmentsController.getDepartmentDetails);
router.post('/departments/batch', verifyToken, verifyAdmin, departmentsController.createDepartmentsBatch);
router.put('/departments/:id', verifyToken, verifyAdmin, departmentsController.updateDepartment);
router.delete('/departments/:id', verifyToken, verifyAdmin, departmentsController.deleteDepartment);

// ==================== ✅ RUTAS DE INQUILINOS ====================
router.get('/tenants', verifyToken, verifyAdmin, tenantsController.getTenants);
router.get('/tenants/:id', verifyToken, verifyAdmin, tenantsController.getTenantDetails);
router.post('/tenants', verifyToken, verifyAdmin, tenantsController.createTenant);
router.put('/tenants/:id', verifyToken, verifyAdmin, tenantsController.updateTenant);
router.delete('/tenants/:id', verifyToken, verifyAdmin, tenantsController.deleteTenant);
router.patch('/tenants/:id/status', verifyToken, verifyAdmin, tenantsController.updateTenantStatus);

// ==================== ✅ RUTAS DE INCIDENCIAS ====================
// El administrador puede ver todas las incidencias, asignar proveedores y cambiar estados
router.get('/incidencias', verifyToken, verifyAdmin, incidentsController.getIncidents);
router.get('/incidencias/:id', verifyToken, verifyAdmin, incidentsController.getIncidentDetails);
router.put('/incidencias/:id', verifyToken, verifyAdmin, incidentsController.updateIncident);

// ==================== ✅ RUTAS DE PROVEEDORES ====================
// Lista de proveedores para asignar a incidencias
router.get('/proveedores', verifyToken, verifyAdmin, providersController.getAllProviders);
router.get('/proveedores/available', verifyToken, verifyAdmin, providersController.getAvailableProviders);
router.get('/proveedores/:id', verifyToken, verifyAdmin, providersController.getProviderById);
router.post('/proveedores', verifyToken, verifyAdmin, providersController.createProvider);
router.put('/proveedores/:id', verifyToken, verifyAdmin, providersController.updateProvider);
router.delete('/proveedores/:id', verifyToken, verifyAdmin, providersController.deleteProvider);

// ==================== ✅ RUTAS COMPLETAS DE POSTULANTES ====================
router.get('/applicants', verifyToken, verifyAdmin, applicantController.getAllApplicants);
router.get('/applicants/stats', verifyToken, verifyAdmin, applicantController.getApplicantsStats);
router.get('/applicants/search', verifyToken, verifyAdmin, applicantController.searchApplicants);
router.get('/applicants/:id', verifyToken, verifyAdmin, applicantController.getApplicantDetails);
router.post('/applicants', verifyToken, verifyAdmin, applicantController.createApplicant);
router.put('/applicants/:id', verifyToken, verifyAdmin, applicantController.updateApplicant);
router.put('/applicants/:id/status', verifyToken, verifyAdmin, applicantController.updateApplicantStatus);
router.delete('/applicants/:id', verifyToken, verifyAdmin, applicantController.deleteApplicant);



// ==================== ✅ RUTA DE SALUD ====================
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Admin routes funcionando',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;