const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Incident = sequelize.define('Incident', {
    idIncidencia: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_incidencia'
    },
    idInquilino: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_inquilino'
    },
    tipoProblema: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'tipo_problema'
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    imagen: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    urgencia: {
      type: DataTypes.ENUM('Baja', 'Media', 'Alta'),
      defaultValue: 'Media'
    },
    categoria: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    estado: {
      type: DataTypes.ENUM('Abierta', 'En Revisión', 'Asignada', 'En Proceso', 'Completada'),
      defaultValue: 'Abierta'
    },
    idProveedor: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'id_proveedor'
    },
    mensajeAsignacion: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'mensaje_asignacion'
    },
    fechaCierre: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'fecha_cierre'
    }
  }, {
    tableName: 'incidencias',
    timestamps: true,
    createdAt: 'fecha_reporte',
    updatedAt: false
  });

  return Incident;
};