const { Incident } = require('../../models');

const getIncidents = async (req, res) => {
  try {
    const userId = req.user.id;
    const { estado } = req.query;

    const whereConditions = { idInquilino: userId };
    if (estado) whereConditions.estado = estado;

    const incidents = await Incident.findAll({
      where: whereConditions,
      order: [['fechaReporte', 'DESC']]
    });

    res.json({
      success: true,
      data: incidents
    });

  } catch (error) {
    console.error('Error obteniendo incidencias:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener incidencias'
    });
  }
};

const reportIncident = async (req, res) => {
  try {
    const userId = req.user.id;
    const { tipoProblema, descripcion, urgencia = 'Media', categoria = 'General' } = req.body;

    const newIncident = await Incident.create({
      idInquilino: userId,
      tipoProblema,
      descripcion,
      urgencia,
      categoria,
      estado: 'Abierta'
    });

    res.status(201).json({
      success: true,
      message: 'Incidencia reportada correctamente',
      data: newIncident
    });

  } catch (error) {
    console.error('Error reportando incidencia:', error);
    res.status(500).json({
      success: false,
      message: 'Error al reportar incidencia'
    });
  }
};

module.exports = {
  getIncidents,
  reportIncident
};