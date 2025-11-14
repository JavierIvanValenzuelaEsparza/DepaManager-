const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Contract = sequelize.define('Contract', {
    idContrato: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_contrato'
    },
    idInquilino: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_inquilino'
    },
    idDepartamento: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_departamento'
    },
    fechaInicio: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'fecha_inicio'
    },
    fechaFin: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'fecha_fin'
    },
    montoMensual: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false,
      field: 'monto_mensual'
    },
    depositoGarantia: {
      type: DataTypes.DECIMAL(12,2),
      defaultValue: 0,
      field: 'deposito_garantia'
    },
    duracionMeses: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'duracion_meses'
    },
    archivoPdf: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'archivo_pdf'
    },
    estado: {
      type: DataTypes.ENUM('Activo', 'Finalizado'),
      defaultValue: 'Activo'
    }
  }, {
    tableName: 'contratos',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: false
  });

  return Contract;
};