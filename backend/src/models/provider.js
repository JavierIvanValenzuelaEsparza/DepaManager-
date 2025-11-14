const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Provider = sequelize.define('Provider', {
    idProveedor: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_proveedor'
    },
    idAdministrador: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_administrador'
    },
    nombre: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    especialidad: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    contacto: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    ubicacion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    disponibilidad: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.00
    },
    servicios: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    estado: {
      type: DataTypes.ENUM('Activo', 'Inactivo'),
      defaultValue: 'Activo'
    }
  }, {
    tableName: 'proveedores',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: false
  });

  return Provider;
};