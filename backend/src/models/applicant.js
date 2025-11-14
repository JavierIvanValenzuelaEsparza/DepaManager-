// backend/src/models/applicant.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Applicant = sequelize.define('Applicant', {
    id_postulante: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_postulante'
    },
    id_administrador: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_administrador',
      references: {
        model: 'usuarios',
        key: 'id_usuario'
      }
    },
    nombre_completo: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: 'nombre_completo'
    },
    dni: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
      field: 'dni'
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'telefono'
    },
    correo: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: true
      },
      field: 'correo'
    },
    red_social: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'red_social'
    },
    departamento_deseado: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'departamento_deseado'
    },
    ocupacion: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'ocupacion'
    },
    monto_alquiler: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      field: 'monto_alquiler'
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'observaciones'
    },
    estado: {
      type: DataTypes.ENUM('Pendiente', 'Aprobado', 'Rechazado'),
      defaultValue: 'Pendiente',
      allowNull: false,
      field: 'estado'
    },
    fecha_aprobacion: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'fecha_aprobacion'
    },
    fecha_postulacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
      field: 'fecha_postulacion'
    }
  }, {
    tableName: 'postulantes',
    timestamps: false
  });

  return Applicant;
};