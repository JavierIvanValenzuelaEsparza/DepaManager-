const db = require('../../models');
const Provider = db.Provider;
const User = db.User;

// Obtener todos los proveedores
exports.getAllProviders = async (req, res) => {
  try {
    console.log('🔧 getAllProviders - Iniciando...');
    console.log('🔧 req.user:', req.user);
    console.log('🔧 idUsuario:', req.user.idUsuario);
    
    const providers = await Provider.findAll({
      where: { idAdministrador: req.user.idUsuario },
      order: [['nombre', 'ASC']]
    });
    
    console.log('✅ Proveedores encontrados:', providers.length);
    
    res.json({
      success: true,
      data: providers
    });
  } catch (error) {
    console.error('❌ Error en getAllProviders:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener proveedores',
      error: error.message
    });
  }
};

// Obtener proveedor por ID
exports.getProviderById = async (req, res) => {
  try {
    const provider = await Provider.findOne({
      where: {
        idProveedor: req.params.id,
        idAdministrador: req.user.idUsuario
      }
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado'
      });
    }

    res.json({
      success: true,
      data: provider
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener proveedor',
      error: error.message
    });
  }
};

// Crear nuevo proveedor
exports.createProvider = async (req, res) => {
  try {
    const {
      nombre,
      especialidad,
      contacto,
      ubicacion,
      disponibilidad,
      rating,
      servicios
    } = req.body;

    const newProvider = await Provider.create({
      idAdministrador: req.user.idUsuario,
      nombre,
      especialidad,
      contacto,
      ubicacion,
      disponibilidad: disponibilidad || 'Disponible',
      rating: rating || 0.00,
      servicios,
      estado: 'Activo'
    });

    res.status(201).json({
      success: true,
      message: 'Proveedor creado exitosamente',
      data: newProvider
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear proveedor',
      error: error.message
    });
  }
};

// Actualizar proveedor
exports.updateProvider = async (req, res) => {
  try {
    const {
      nombre,
      especialidad,
      contacto,
      ubicacion,
      disponibilidad,
      rating,
      servicios,
      estado
    } = req.body;

    const provider = await Provider.findOne({
      where: {
        idProveedor: req.params.id,
        idAdministrador: req.user.idUsuario
      }
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado'
      });
    }

    await provider.update({
      nombre,
      especialidad,
      contacto,
      ubicacion,
      disponibilidad,
      rating,
      servicios,
      estado
    });

    res.json({
      success: true,
      message: 'Proveedor actualizado exitosamente',
      data: provider
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar proveedor',
      error: error.message
    });
  }
};

// Eliminar proveedor
exports.deleteProvider = async (req, res) => {
  try {
    const provider = await Provider.findOne({
      where: {
        idProveedor: req.params.id,
        idAdministrador: req.user.idUsuario
      }
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado'
      });
    }

    await provider.destroy();

    res.json({
      success: true,
      message: 'Proveedor eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar proveedor',
      error: error.message
    });
  }
};

// Obtener proveedores disponibles para incidencias
exports.getAvailableProviders = async (req, res) => {
  try {
    const providers = await Provider.findAll({
      where: {
        idAdministrador: req.user.idUsuario,
        estado: 'Activo',
        disponibilidad: 'Disponible'
      },
      attributes: ['idProveedor', 'nombre', 'especialidad', 'contacto', 'rating'],
      order: [['rating', 'DESC']]
    });

    res.json({
      success: true,
      data: providers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener proveedores disponibles',
      error: error.message
    });
  }
};