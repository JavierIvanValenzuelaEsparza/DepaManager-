const { User, Building, Department, Contract, Payment, Incident, Provider, Applicant } = require('../../models');
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
      // ✅ CORREGIDO: Usar el nombre correcto del campo
      const buildingsIds = await Building.findAll({
        where: { idAdministrador: adminId },
        attributes: ['idEdificio']
      });
      const buildingIdsList = buildingsIds.map(b => b.idEdificio);
      
      console.log('🏢 IDs de edificios del admin:', buildingIdsList);
      
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
      console.log('✅ Departamentos disponibles:', availableDepartments);
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
      console.log('✅ Departamentos ocupados:', occupiedDepartments);
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
      console.log('✅ Departamentos en mantenimiento:', maintenanceDepartments);
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
      console.log('🔧 Total proveedores:', totalProviders);
    } catch (error) {
      console.error('Error contando proveedores:', error);
    }

    try {
      totalIncidents = await Incident.count({ 
        where: { 
          estado: { [Op.in]: ['Abierta', 'En Revisión', 'Asignada', 'En Proceso'] } 
        }
      });
      console.log('🚨 Total incidencias activas:', totalIncidents);
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
      console.log('💰 Total pagos del mes:', totalPayments);
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
      console.log('💵 Ingresos mensuales:', monthlyRevenue);
    } catch (error) {
      console.error('Error calculando ingresos:', error);
    }

    try {
      // ✅ CORREGIDO: Calcular ocupación de forma más simple
      if (totalDepartments > 0) {
        occupancyRate = Math.round((occupiedDepartments / totalDepartments) * 100);
      }
      console.log('📊 Tasa de ocupación:', occupancyRate + '%');
    } catch (error) {
      console.error('Error calculando ocupación:', error);
    }

    // Obtener actividades recientes (últimos 7 días)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    let recentActivities = [];

    try {
      // Pagos recientes
      const recentPayments = await Payment.findAll({
        include: [
          {
            model: User,
            as: 'inquilino',
            attributes: ['nombreCompleto']
          }
        ],
        where: {
          estado: 'Pagado',
          fechaPago: {
            [Op.gte]: sevenDaysAgo
          }
        },
        order: [['fechaPago', 'DESC']],
        limit: 10
      });

      recentPayments.forEach(payment => {
        recentActivities.push({
          type: 'payment',
          icon: '💰',
          color: 'green',
          title: 'Pago recibido',
          description: `${payment.inquilino?.nombreCompleto || 'Inquilino'} - $${payment.monto}`,
          date: payment.fechaPago,
          timestamp: new Date(payment.fechaPago).getTime()
        });
      });
    } catch (error) {
      console.error('Error obteniendo pagos recientes:', error);
    }

    try {
      // Inquilinos nuevos
      const recentTenants = await User.findAll({
        where: {
          rol: 'Inquilino',
          createdAt: {
            [Op.gte]: sevenDaysAgo
          }
        },
        order: [['createdAt', 'DESC']],
        limit: 10,
        attributes: ['idUsuario', 'nombreCompleto', 'createdAt']
      });

      recentTenants.forEach(tenant => {
        recentActivities.push({
          type: 'tenant',
          icon: '👤',
          color: 'blue',
          title: 'Nuevo inquilino registrado',
          description: tenant.nombreCompleto,
          date: tenant.createdAt,
          timestamp: new Date(tenant.createdAt).getTime()
        });
      });
    } catch (error) {
      console.error('Error obteniendo inquilinos recientes:', error);
    }

    try {
      // Contratos creados
      const recentContracts = await Contract.findAll({
        include: [
          {
            model: User,
            as: 'inquilino',
            attributes: ['nombreCompleto']
          },
          {
            model: Department,
            as: 'departamento',
            attributes: ['numero']
          }
        ],
        where: {
          createdAt: {
            [Op.gte]: sevenDaysAgo
          }
        },
        order: [['createdAt', 'DESC']],
        limit: 10
      });

      recentContracts.forEach(contract => {
        recentActivities.push({
          type: 'contract',
          icon: '📄',
          color: 'purple',
          title: 'Contrato creado',
          description: `${contract.inquilino?.nombreCompleto || 'Inquilino'} - Depto ${contract.departamento?.numero || 'N/A'}`,
          date: contract.createdAt,
          timestamp: new Date(contract.createdAt).getTime()
        });
      });
    } catch (error) {
      console.error('Error obteniendo contratos recientes:', error);
    }

    try {
      // Postulantes aprobados
      const approvedApplicants = await Applicant.findAll({
        where: {
          estado: 'Aprobado',
          fecha_aprobacion: {
            [Op.gte]: sevenDaysAgo
          }
        },
        order: [['fecha_aprobacion', 'DESC']],
        limit: 10,
        attributes: ['id_postulante', 'nombre_completo', 'fecha_aprobacion']
      });

      approvedApplicants.forEach(applicant => {
        recentActivities.push({
          type: 'applicant',
          icon: '✅',
          color: 'emerald',
          title: 'Postulante aprobado',
          description: applicant.nombre_completo,
          date: applicant.fecha_aprobacion,
          timestamp: new Date(applicant.fecha_aprobacion).getTime()
        });
      });
    } catch (error) {
      console.error('Error obteniendo postulantes aprobados:', error);
    }

    try {
      // Incidencias nuevas
      const recentIncidents = await Incident.findAll({
        include: [
          {
            model: User,
            as: 'inquilino',
            attributes: ['nombreCompleto']
          }
        ],
        where: {
          fechaReporte: {
            [Op.gte]: sevenDaysAgo
          }
        },
        order: [['fechaReporte', 'DESC']],
        limit: 10
      });

      recentIncidents.forEach(incident => {
        recentActivities.push({
          type: 'incident',
          icon: '🚨',
          color: 'red',
          title: 'Nueva incidencia',
          description: `${incident.inquilino?.nombreCompleto || 'Inquilino'} - ${incident.tipo}`,
          date: incident.fechaReporte,
          timestamp: new Date(incident.fechaReporte).getTime()
        });
      });
    } catch (error) {
      console.error('Error obteniendo incidencias recientes:', error);
    }

    // Ordenar todas las actividades por fecha (más reciente primero) y limitar a 5
    recentActivities.sort((a, b) => b.timestamp - a.timestamp);
    recentActivities = recentActivities.slice(0, 5);

    // Eliminar el timestamp antes de enviar
    recentActivities.forEach(activity => delete activity.timestamp);

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
      recentActivities
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