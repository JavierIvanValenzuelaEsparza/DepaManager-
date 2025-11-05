const { User, Department, Building, Payment, Incident, Contract } = require('../../models');
const { Op } = require('sequelize');

/**
 * Controlador para el dashboard del inquilino
 */
const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Obtener información del usuario
    const user = await User.findByPk(userId, {
      attributes: ['nombreCompleto', 'correo', 'telefono']
    });

    // Obtener departamento del usuario
    const department = await Department.findOne({
      where: { idInquilino: userId },
      include: [{
        model: Building,
        as: 'edificio',
        attributes: ['nombre', 'direccion']
      }]
    });

    // Obtener próximo pago pendiente
    const nextPayment = await Payment.findOne({
      where: {
        idInquilino: userId,
        estado: 'Pendiente',
        fechaVencimiento: {
          [Op.gte]: new Date()
        }
      },
      order: [['fechaVencimiento', 'ASC']]
    });

    // Contar pagos del año actual
    const currentYear = new Date().getFullYear();
    const paymentCount = await Payment.count({
      where: {
        idInquilino: userId,
        estado: 'Pagado',
        fechaPago: {
          [Op.gte]: new Date(`${currentYear}-01-01`),
          [Op.lte]: new Date(`${currentYear}-12-31`)
        }
      }
    });

    // Contar incidencias activas
    const incidentsCount = await Incident.count({
      where: {
        idInquilino: userId,
        estado: {
          [Op.in]: ['Abierta', 'En Revisión', 'Asignada', 'En Proceso']
        }
      }
    });

    // Actividad reciente (pagos + incidencias)
    const recentPayments = await Payment.findAll({
      where: { idInquilino: userId },
      order: [['fechaCreacion', 'DESC']],
      limit: 3
    });

    const recentIncidents = await Incident.findAll({
      where: { idInquilino: userId },
      order: [['fechaReporte', 'DESC']],
      limit: 2
    });

    const recentActivity = [
      ...recentPayments.map(p => ({
        tipo: `Pago ${p.estado.toLowerCase()}`,
        fecha: p.fechaCreacion.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }),
        monto: p.monto
      })),
      ...recentIncidents.map(i => ({
        tipo: `Incidencia ${i.estado.toLowerCase()}`,
        fecha: i.fechaReporte.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }),
        descripcion: i.tipoProblema
      }))
    ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 4);

    // Construir respuesta
    const dashboardData = {
      usuario: {
        nombreCompleto: user.nombreCompleto
      },
      proximoPago: {
        monto: nextPayment ? nextPayment.monto : 0,
        fechaVencimiento: nextPayment ? 
          nextPayment.fechaVencimiento.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }) : 'Sin pagos pendientes'
      },
      departamento: {
        numero: department ? department.numero : 'No asignado',
        edificio: department && department.edificio ? department.edificio.nombre : 'No asignado'
      },
      estadisticas: {
        pagosEsteAnio: paymentCount,
        incidenciasActivas: incidentsCount
      },
      actividadReciente: recentActivity
    };

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Error en dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  getDashboard
};