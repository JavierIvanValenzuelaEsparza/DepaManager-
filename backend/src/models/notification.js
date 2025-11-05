const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Notification = sequelize.define('Notification', {
    idNotificacion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_notificacion'
    },
    idAdministrador: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_administrador'
    },
    categoria: {
      type: DataTypes.ENUM('Avisos Administrativos', 'Mantenimiento', 'Pagos'),
      allowNull: false
    },
    tipo: {
      type: DataTypes.ENUM('Automatica', 'Manual'),
      defaultValue: 'Manual'
    },
    asunto: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    destinatario: {
      type: DataTypes.ENUM('Todos', 'Individual'),
      defaultValue: 'Todos'
    },
    idInquilino: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'id_inquilino'
    },
    idMensajeOriginal: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'id_mensaje_original'
    },
    leido: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'notificaciones',
    timestamps: true,
    createdAt: 'fecha_envio',
    updatedAt: false
  });

  return Notification;
};