const { Incident, Provider } = require('../../models');

const getIncidents = async (req, res) => {
  try {
    const userId = req.user.id;
    const { estado } = req.query;

    const whereConditions = { idInquilino: userId };
    if (estado) whereConditions.estado = estado;

    const incidents = await Incident.findAll({
      where: whereConditions,
      include: [
        {
          model: Provider,
          as: 'proveedor',
          attributes: ['idProveedor', 'nombre', 'especialidad', 'contacto']
        }
      ],
      order: [['fechaReporte', 'DESC']]
    });

    // Calcular estadísticas
    const total = await Incident.count({ where: { idInquilino: userId } });
    const completadas = await Incident.count({ 
      where: { idInquilino: userId, estado: 'Completada' } 
    });
    const en_progreso = await Incident.count({ 
      where: { 
        idInquilino: userId, 
        estado: ['En Revisión', 'Asignada', 'En Proceso'] 
      } 
    });
    const pendientes = await Incident.count({ 
      where: { 
        idInquilino: userId, 
        estado: 'Abierta' 
      } 
    });

    res.json({
      success: true,
      data: {
        incidencias: incidents,
        estadisticas: {
          total,
          completadas,
          en_progreso,
          pendientes
        }
      }
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
      estado: 'Abierta',
      fechaReporte: new Date()
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

const getIncidentDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const incident = await Incident.findOne({
      where: {
        idIncidencia: id,
        idInquilino: userId
      },
      include: [
        {
          model: Provider,
          as: 'proveedor',
          attributes: ['idProveedor', 'nombre', 'especialidad', 'contacto']
        }
      ]
    });

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incidencia no encontrada'
      });
    }

    res.json({
      success: true,
      data: incident
    });

  } catch (error) {
    console.error('Error obteniendo detalle de incidencia:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener detalle de incidencia'
    });
  }
};

module.exports = {
  getIncidents,
  reportIncident,
  getIncidentDetails
};