const { Notification } = require('../../models');
const { Op } = require('sequelize');

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { leido } = req.query;

    const whereConditions = {
      [Op.or]: [
        { destinatario: 'Todos' },
        { 
          destinatario: 'Individual',
          idInquilino: userId 
        }
      ]
    };

    if (leido !== undefined) {
      whereConditions.leido = leido === 'true';
    }

    const notifications = await Notification.findAll({
      where: whereConditions,
      order: [['fechaEnvio', 'DESC']]
    });

    res.json({
      success: true,
      data: notifications
    });

  } catch (error) {
    console.error('Error obteniendo notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener notificaciones'
    });
  }
};

const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await Notification.findOne({
      where: { 
        idNotificacion: id,
        [Op.or]: [
          { destinatario: 'Todos' },
          { 
            destinatario: 'Individual',
            idInquilino: userId 
          }
        ]
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    await notification.update({ leido: true });

    res.json({
      success: true,
      message: 'Notificación marcada como leída'
    });

  } catch (error) {
    console.error('Error marcando notificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar notificación'
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead
};