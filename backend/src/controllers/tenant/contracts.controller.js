const { Contract, Department, Building } = require('../../models');

const getContracts = async (req, res) => {
  try {
    const userId = req.user.id;

    const contracts = await Contract.findAll({
      where: { idInquilino: userId },
      include: [{
        model: Department,
        as: 'departamento',
        include: [{
          model: Building,
          as: 'edificio',
          attributes: ['nombre', 'direccion']
        }]
      }],
      order: [['fechaInicio', 'DESC']]
    });

    res.json({
      success: true,
      data: contracts
    });

  } catch (error) {
    console.error('Error obteniendo contratos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener contratos'
    });
  }
};

module.exports = {
  getContracts
};