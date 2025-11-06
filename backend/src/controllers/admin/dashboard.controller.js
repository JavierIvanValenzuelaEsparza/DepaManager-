// backend/src/controllers/admin/dashboard.controller.js
const { User, Building, Department, Contract, Payment, Incident, Provider } = require('../../models');
const { Op } = require('sequelize');

const getDashboardData = async (req, res) => {
  try {
    console.log('🔍 Obteniendo datos del dashboard para admin:', req.user.correo);
    console.log('🔍 User object:', req.user);
    
    // ✅ CORREGIDO: Usar el campo correcto del usuario
    const adminId = req.user.idUsuario || req.user.id;
    console.log('🔍 Admin ID:', adminId);
    
    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: 'ID de administrador no encontrado'
      });
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Obtener conteos principales con manejo de errores individual
    let totalBuildings = 0, totalDepartments = 0, availableDepartments = 0, 
        occupiedDepartments = 0, maintenanceDepartments = 0, totalTenants = 0,
        totalProviders = 0, totalIncidents = 0, totalPayments = 0, 
        monthlyRevenue = 0, occupancyRate = 0;

    try {
      totalBuildings = await Building.count({ 
        where: { idAdministrador: adminId } 
      });
      console.log('🏢 Total edificios:', totalBuildings);
    } catch (error) {
      console.error('Error contando edificios:', error);
    }

    try {
      // ✅ CORREGIDO: Primero obtener IDs de edificios del admin
      const buildingsIds = await Building.findAll({
        where: { idAdministrador: adminId },
        attributes: ['idEdificio']
      });
      const buildingIdsList = buildingsIds.map(b => b.idEdificio);
      
      console.log('🏢 IDs de edificios del admin:', buildingIdsList); // ✅ LOG
      
      if (buildingIdsList.length > 0) {
        totalDepartments = await Department.count({
          where: { idEdificio: buildingIdsList }
        });
      }
      
      console.log('🏠 Total departamentos:', totalDepartments);
    } catch (error) {
      console.error('❌ Error contando departamentos:', error);
    }

    try {
      const buildingsIds = await Building.findAll({
        where: { idAdministrador: adminId },
        attributes: ['idEdificio']
      });
      const buildingIdsList = buildingsIds.map(b => b.idEdificio);
      
      if (buildingIdsList.length > 0) {
        availableDepartments = await Department.count({
          where: { 
            idEdificio: buildingIdsList,
            estado: 'Disponible' 
          }
        });
      }
      console.log('✅ Departamentos disponibles:', availableDepartments); // ✅ LOG
    } catch (error) {
      console.error('❌ Error contando departamentos disponibles:', error);
    }

    try {
      const buildingsIds = await Building.findAll({
        where: { idAdministrador: adminId },
        attributes: ['idEdificio']
      });
      const buildingIdsList = buildingsIds.map(b => b.idEdificio);
      
      if (buildingIdsList.length > 0) {
        occupiedDepartments = await Department.count({
          where: { 
            idEdificio: buildingIdsList,
            estado: 'Ocupado' 
          }
        });
      }
      console.log('✅ Departamentos ocupados:', occupiedDepartments); // ✅ LOG
    } catch (error) {
      console.error('❌ Error contando departamentos ocupados:', error);
    }

    try {
      const buildingsIds = await Building.findAll({
        where: { idAdministrador: adminId },
        attributes: ['idEdificio']
      });
      const buildingIdsList = buildingsIds.map(b => b.idEdificio);
      
      if (buildingIdsList.length > 0) {
        maintenanceDepartments = await Department.count({
          where: { 
            idEdificio: buildingIdsList,
            estado: 'En Mantenimiento' 
          }
        });
      }
      console.log('✅ Departamentos en mantenimiento:', maintenanceDepartments); // ✅ LOG
    } catch (error) {
      console.error('❌ Error contando departamentos en mantenimiento:', error);
    }

    try {
      totalTenants = await User.count({ 
        where: { 
          rol: 'Inquilino', 
          estado: 'Activo' 
        }
      });
      console.log('👥 Total inquilinos:', totalTenants);
    } catch (error) {
      console.error('Error contando inquilinos:', error);
    }

    try {
      totalProviders = await Provider.count({ 
        where: { idAdministrador: adminId } 
      });
    } catch (error) {
      console.error('Error contando proveedores:', error);
    }

    try {
      totalIncidents = await Incident.count({ 
        where: { 
          estado: { [Op.in]: ['Abierta', 'En Revisión', 'Asignada', 'En Proceso'] } 
        }
      });
    } catch (error) {
      console.error('Error contando incidencias:', error);
    }

    try {
      const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
      const endOfMonth = new Date(currentYear, currentMonth, 0);

      totalPayments = await Payment.count({
        where: {
          fechaVencimiento: {
            [Op.between]: [startOfMonth, endOfMonth]
          }
        }
      });
    } catch (error) {
      console.error('Error contando pagos:', error);
    }

    try {
      const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
      const endOfMonth = new Date(currentYear, currentMonth, 0);

      const revenueResult = await Payment.sum('monto', {
        where: {
          estado: 'Pagado',
          fechaPago: {
            [Op.between]: [startOfMonth, endOfMonth]
          }
        }
      });
      monthlyRevenue = revenueResult || 0;
    } catch (error) {
      console.error('Error calculando ingresos:', error);
    }

    try {
      // Calcular ocupación
      const depts = await Department.findAll({
        include: [{
          model: Building,
          where: { idAdministrador: adminId }
        }],
        attributes: ['estado']
      });
      
      const total = depts.length;
      const occupied = depts.filter(d => d.estado === 'Ocupado').length;
      occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;
    } catch (error) {
      console.error('Error calculando ocupación:', error);
    }

    // Obtener actividades recientes
    let recentPayments = [];
    let recentIncidents = [];

    try {
      recentPayments = await Payment.findAll({
        include: [
          {
            model: User,
            as: 'inquilino',
            attributes: ['nombreCompleto']
          },
          {
            model: Contract,
            as: 'contrato',
            attributes: ['idContrato']
          }
        ],
        where: {
          estado: 'Pagado'
        },
        order: [['fechaPago', 'DESC']],
        limit: 5
      });
    } catch (error) {
      console.error('Error obteniendo pagos recientes:', error);
    }

    try {
      recentIncidents = await Incident.findAll({
        include: [
          {
            model: User,
            as: 'inquilino',
            attributes: ['nombreCompleto']
          }
        ],
        order: [['fechaReporte', 'DESC']],
        limit: 5
      });
    } catch (error) {
      console.error('Error obteniendo incidencias recientes:', error);
    }

    const dashboardData = {
      summary: {
        totalBuildings,
        totalDepartments,
        availableDepartments,
        occupiedDepartments,
        maintenanceDepartments,
        totalTenants,
        totalProviders,
        totalIncidents,
        totalPayments,
        monthlyRevenue,
        occupancyRate
      },
      recentActivities: {
        payments: recentPayments,
        incidents: recentIncidents
      }
    };

    console.log('✅ Dashboard data obtenido exitosamente');
    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('❌ Error en getDashboardData:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener datos del dashboard',
      error: error.message 
    });
  }
};

module.exports = {
  getDashboardData
};