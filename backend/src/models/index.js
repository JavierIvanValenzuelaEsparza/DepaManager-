// backend/src/models/index.js
const sequelize = require('../config/sequelize');
const { DataTypes } = require('sequelize');
const Applicant = require('./applicant')(sequelize, DataTypes);

// Cargar modelos
const User = require('./user')(sequelize, DataTypes);
const Department = require('./department')(sequelize, DataTypes);
const Building = require('./building')(sequelize, DataTypes);
const Payment = require('./payment')(sequelize, DataTypes);
const Incident = require('./incident')(sequelize, DataTypes);
const Contract = require('./contract')(sequelize, DataTypes);
const Notification = require('./notification')(sequelize, DataTypes);
const Provider = require('./provider')(sequelize, DataTypes);
const PlateDetection = require('./plate-detection.model')(sequelize, DataTypes);

// 🔥 CORRECCIÓN: Definir asociaciones CORRECTAS

// Usuario -> Departamento (como inquilino) - RELACIÓN UNO A MUCHOS
User.hasMany(Department, {
  foreignKey: 'idInquilino',
  as: 'departamentosInquilino'
});

Department.belongsTo(User, {
  foreignKey: 'idInquilino',
  as: 'inquilino'
});

// Departamento -> Edificio
Department.belongsTo(Building, {
  foreignKey: 'idEdificio',
  as: 'edificio'
});

Building.hasMany(Department, {
  foreignKey: 'idEdificio',
  as: 'departamentos'
});

// Edificio -> Administrador
Building.belongsTo(User, {
  foreignKey: 'idAdministrador',
  as: 'administrador'
});

User.hasMany(Building, {
  foreignKey: 'idAdministrador',
  as: 'edificios'
});

// Usuario -> Pagos
User.hasMany(Payment, {
  foreignKey: 'idInquilino',
  as: 'pagos'
});

Payment.belongsTo(User, {
  foreignKey: 'idInquilino',
  as: 'inquilino'
});

// Usuario -> Incidencias
User.hasMany(Incident, {
  foreignKey: 'idInquilino',
  as: 'incidencias'
});

Incident.belongsTo(User, {
  foreignKey: 'idInquilino',
  as: 'inquilino'
});

// Usuario -> Contratos
User.hasMany(Contract, {
  foreignKey: 'idInquilino',
  as: 'contratos'
});

Contract.belongsTo(User, {
  foreignKey: 'idInquilino',
  as: 'inquilino'
});

// Contrato -> Pagos
Contract.hasMany(Payment, {
  foreignKey: 'idContrato',
  as: 'pagos'
});

Payment.belongsTo(Contract, {
  foreignKey: 'idContrato',
  as: 'contrato'
});

// Departamento -> Contrato
Department.hasMany(Contract, {
  foreignKey: 'idDepartamento',
  as: 'contratos'
});

Contract.belongsTo(Department, {
  foreignKey: 'idDepartamento',
  as: 'departamento'
});

// Proveedor -> Administrador
Provider.belongsTo(User, {
  foreignKey: 'idAdministrador',
  as: 'administrador'
});

User.hasMany(Provider, {
  foreignKey: 'idAdministrador',
  as: 'proveedores'
});

// 🔥 CORRECCIÓN: Agregar relación entre Incidencia y Proveedor
Incident.belongsTo(Provider, {
  foreignKey: 'idProveedor',
  as: 'proveedor'
});

Provider.hasMany(Incident, {
  foreignKey: 'idProveedor',
  as: 'incidencias'
});

const db = {
  User,
  Department,
  Building,
  Payment,
  Incident,
  Contract,
  Notification,
  Provider,
  Applicant,
  PlateDetection,
  sequelize,
  Sequelize: require('sequelize')
};

console.log('✅ Modelos y asociaciones cargados correctamente para Sequelize');

module.exports = db;