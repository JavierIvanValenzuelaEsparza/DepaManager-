const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

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
      unique: true,
      validate: {
        isEmail: true
      }
    },
    contraseña: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    rol: {
      type: DataTypes.ENUM('Administrador', 'Inquilino'),
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
      type: DataTypes.ENUM('Activo', 'Pendiente', 'Retirado'),
      defaultValue: 'Activo'
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
    updatedAt: false,
    hooks: {
      beforeCreate: async (user) => {
        if (user.contraseña) {
          user.contraseña = await bcrypt.hash(user.contraseña, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('contraseña')) {
          user.contraseña = await bcrypt.hash(user.contraseña, 10);
        }
      }
    }
  });

  return User;
};