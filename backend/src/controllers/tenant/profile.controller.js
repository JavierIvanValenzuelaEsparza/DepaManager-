const { User } = require('../../models');

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['contraseña'] }
    });

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil'
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { telefono, fecha_nacimiento } = req.body;

    await User.update({
      telefono,
      fecha_nacimiento
    }, {
      where: { id_usuario: userId }
    });

    res.json({
      success: true,
      message: 'Perfil actualizado correctamente'
    });

  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile
};