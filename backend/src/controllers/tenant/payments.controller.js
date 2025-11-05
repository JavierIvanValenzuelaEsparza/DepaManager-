const { Payment, Contract } = require('../../models');
const { Op } = require('sequelize');

const getPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { estado } = req.query;

    const whereConditions = { idInquilino: userId };
    if (estado) whereConditions.estado = estado;

    const payments = await Payment.findAll({
      where: whereConditions,
      include: [{
        model: Contract,
        as: 'contrato',
        attributes: ['idContrato', 'fechaInicio', 'fechaFin']
      }],
      order: [['fechaVencimiento', 'DESC']]
    });

    res.json({
      success: true,
      data: payments
    });

  } catch (error) {
    console.error('Error obteniendo pagos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pagos'
    });
  }
};

const uploadPaymentReceipt = async (req, res) => {
  try {
    const userId = req.user.id;
    const { idPago } = req.params;
    const { urlComprobante } = req.body;

    const payment = await Payment.findOne({
      where: { 
        idPago: idPago,
        idInquilino: userId 
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }

    await payment.update({
      comprobanteSubido: true,
      fechaComprobante: new Date(),
      urlComprobante: urlComprobante,
      estado: 'Pendiente de Verificación'
    });

    res.json({
      success: true,
      message: 'Comprobante subido correctamente'
    });

  } catch (error) {
    console.error('Error subiendo comprobante:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir comprobante'
    });
  }
};

module.exports = {
  getPayments,
  uploadPaymentReceipt
};