const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Department = sequelize.define('Department', {
    idDepartamento: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_departamento'
    },
    idEdificio: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_edificio'
    },
    numero: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    piso: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    metrosCuadrados: {
      type: DataTypes.DECIMAL(8,2),
      allowNull: true,
      field: 'metros_cuadrados'
    },
    habitaciones: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    banios: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    estado: {
      type: DataTypes.ENUM('Disponible', 'Ocupado', 'En Mantenimiento'),
      defaultValue: 'Disponible'
    },
    idInquilino: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'id_inquilino'
    }
  }, {
    tableName: 'departamentos',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: false
  });

  return Department;
};