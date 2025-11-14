// backend/src/controllers/admin/applicants.controller.js
const { Applicant } = require('../../models');
const { Op } = require('sequelize');

// ==================== OBTENER TODOS LOS POSTULANTES ====================
exports.getAllApplicants = async (req, res) => {
  try {
    console.log('📋 Obteniendo lista de postulantes...');
    
    const applicants = await Applicant.findAll({
      order: [['fecha_postulacion', 'DESC']],
      attributes: [
        'id_postulante',
        'id_administrador',
        'nombre_completo',
        'dni',
        'telefono',
        'correo',
        'red_social',
        'departamento_deseado',
        'ocupacion',
        'monto_alquiler',
        'observaciones',
        'estado',
        'fecha_aprobacion',
        'fecha_postulacion'
      ]
    });

    console.log(`✅ Se encontraron ${applicants.length} postulantes`);

    res.json({
      success: true,
      message: 'Lista de postulantes obtenida correctamente',
      data: applicants
    });
  } catch (error) {
    console.error('❌ Error obteniendo postulantes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener postulantes',
      error: error.message
    });
  }
};

// ==================== OBTENER DETALLES DE UN POSTULANTE ====================
exports.getApplicantDetails = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Obteniendo detalles del postulante ${id}...`);

    const applicant = await Applicant.findByPk(id);

    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: 'Postulante no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Detalles del postulante obtenidos correctamente',
      data: applicant
    });
  } catch (error) {
    console.error('❌ Error obteniendo detalles:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener detalles del postulante',
      error: error.message
    });
  }
};

// ==================== CREAR NUEVO POSTULANTE ====================
exports.createApplicant = async (req, res) => {
  try {
    const { 
      nombre_completo, 
      dni, 
      telefono, 
      correo, 
      red_social, 
      departamento_deseado, 
      ocupacion, 
      monto_alquiler, 
      observaciones 
    } = req.body;

    console.log('➕ Creando nuevo postulante:', { nombre_completo, dni, correo });

    // El id_administrador viene del token JWT
    const id_administrador = req.user.id;

    const newApplicant = await Applicant.create({
      id_administrador,
      nombre_completo,
      dni,
      telefono,
      correo,
      red_social,
      departamento_deseado,
      ocupacion,
      monto_alquiler,
      observaciones,
      estado: 'Pendiente'
    });

    console.log('✅ Postulante creado exitosamente:', newApplicant.id_postulante);

    res.status(201).json({
      success: true,
      message: 'Postulante creado exitosamente',
      data: newApplicant
    });
  } catch (error) {
    console.error('❌ Error creando postulante:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un postulante con ese DNI o correo'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear postulante',
      error: error.message
    });
  }
};

// ==================== ACTUALIZAR POSTULANTE ====================
exports.updateApplicant = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log(`✏️ Actualizando postulante ${id}:`, updateData);

    const applicant = await Applicant.findByPk(id);

    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: 'Postulante no encontrado'
      });
    }

    await applicant.update(updateData);

    console.log('✅ Postulante actualizado exitosamente');

    res.json({
      success: true,
      message: 'Postulante actualizado exitosamente',
      data: applicant
    });
  } catch (error) {
    console.error('❌ Error actualizando postulante:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar postulante',
      error: error.message
    });
  }
};

// ==================== ELIMINAR POSTULANTE ====================
exports.deleteApplicant = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Eliminando postulante ${id}...`);

    const applicant = await Applicant.findByPk(id);

    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: 'Postulante no encontrado'
      });
    }

    await applicant.destroy();

    console.log('✅ Postulante eliminado exitosamente');

    res.json({
      success: true,
      message: 'Postulante eliminado exitosamente'
    });
  } catch (error) {
    console.error('❌ Error eliminando postulante:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar postulante',
      error: error.message
    });
  }
};

// ==================== ACTUALIZAR ESTADO DEL POSTULANTE ====================
exports.updateApplicantStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log(`🔄 Actualizando estado del postulante ${id} a: ${status}`);

    const applicant = await Applicant.findByPk(id);

    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: 'Postulante no encontrado'
      });
    }

    await applicant.update({
      estado: status,
      fecha_aprobacion: status === 'Aprobado' ? new Date() : null
    });

    console.log('✅ Estado actualizado exitosamente');

    res.json({
      success: true,
      message: 'Estado actualizado exitosamente',
      data: applicant
    });
  } catch (error) {
    console.error('❌ Error actualizando estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado',
      error: error.message
    });
  }
};

// ==================== BUSCAR POSTULANTES ====================
exports.searchApplicants = async (req, res) => {
  try {
    const { query } = req.query;
    console.log('🔎 Buscando postulantes con:', query);

    const applicants = await Applicant.findAll({
      where: {
        [Op.or]: [
          { nombre_completo: { [Op.like]: `%${query}%` } },
          { dni: { [Op.like]: `%${query}%` } },
          { correo: { [Op.like]: `%${query}%` } }
        ]
      },
      order: [['fecha_postulacion', 'DESC']]
    });

    res.json({
      success: true,
      data: applicants
    });
  } catch (error) {
    console.error('❌ Error buscando postulantes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar postulantes',
      error: error.message
    });
  }
};

// ==================== ESTADÍSTICAS DE POSTULANTES ====================
exports.getApplicantsStats = async (req, res) => {
  try {
    console.log('📊 Obteniendo estadísticas de postulantes...');

    const [total, pendientes, aprobados, rechazados] = await Promise.all([
      Applicant.count(),
      Applicant.count({ where: { estado: 'Pendiente' } }),
      Applicant.count({ where: { estado: 'Aprobado' } }),
      Applicant.count({ where: { estado: 'Rechazado' } })
    ]);

    res.json({
      success: true,
      data: {
        total,
        pendientes,
        aprobados,
        rechazados
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};