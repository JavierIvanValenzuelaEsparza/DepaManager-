const { DataTypes } = require('sequelize');
const { ROLES, USER_STATUS } = require('../utils/constants');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id_usuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre_completo: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    correo: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    contraseña: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    rol: {
      type: DataTypes.ENUM(ROLES.ADMIN, ROLES.TENANT),
      allowNull: false
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    dni: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: true
    },
    fecha_nacimiento: {
      type: DataTypes.DATE,
      allowNull: true
    },
    foto_perfil: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    estado: {
      type: DataTypes.ENUM(USER_STATUS.ACTIVE, USER_STATUS.PENDING, USER_STATUS.RETIRED),
      defaultValue: USER_STATUS.ACTIVE
    },
    plan: {
      type: DataTypes.ENUM('Gratuito', 'Estándar', 'Premium'),
      defaultValue: 'Gratuito'
    },
    fecha_inicio_contrato: {
      type: DataTypes.DATE,
      allowNull: true
    },
    fecha_fin_contrato: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'usuarios',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: false
  });

  return User;
};