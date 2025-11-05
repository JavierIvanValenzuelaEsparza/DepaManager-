const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Building = sequelize.define('Building', {
    idEdificio: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_edificio'
    },
    idAdministrador: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_administrador'
    },
    nombre: {
      type: DataTypes.STRING(100),
      defaultValue: 'Mi Edificio'
    },
    direccion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    totalDepartamentos: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'total_departamentos'
    }
  }, {
    tableName: 'edificios',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: false
  });

  return Building;
};