const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Payment = sequelize.define('Payment', {
    idPago: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_pago'
    },
    idInquilino: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_inquilino'
    },
    idContrato: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_contrato'
    },
    concepto: {
      type: DataTypes.ENUM('Alquiler', 'Servicios', 'Otro'),
      defaultValue: 'Alquiler'
    },
    descripcionServicio: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'descripcion_servicio'
    },
    monto: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false
    },
    fechaVencimiento: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'fecha_vencimiento'
    },
    fechaPago: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'fecha_pago'
    },
    metodoPago: {
      type: DataTypes.ENUM('Efectivo', 'Yape', 'Plin', 'Transferencia'),
      allowNull: true,
      field: 'metodo_pago'
    },
    comprobanteSubido: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'comprobante_subido'
    },
    fechaComprobante: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'fecha_comprobante'
    },
    urlComprobante: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'url_comprobante'
    },
    estado: {
      type: DataTypes.ENUM('Pendiente', 'Pagado', 'Vencido', 'Pendiente de Verificación'),
      defaultValue: 'Pendiente'
    },
    mensajeAdministrador: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'mensaje_administrador'
    }
  }, {
    tableName: 'pagos',
    timestamps: true,
    createdAt: 'fechaCreacion',
    updatedAt: false
  });

  return Payment;
};