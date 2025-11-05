const sequelize = require('../config/sequelize');
const { DataTypes } = require('sequelize');

// Cargar modelos
const User = require('./user')(sequelize, DataTypes);
const Department = require('./department')(sequelize, DataTypes);
const Building = require('./building')(sequelize, DataTypes);
const Payment = require('./payment')(sequelize, DataTypes);
const Incident = require('./incident')(sequelize, DataTypes);
const Contract = require('./contract')(sequelize, DataTypes);
const Notification = require('./notification')(sequelize, DataTypes);

// Definir asociaciones
// Usuario -> Departamento (como inquilino)
User.hasOne(Department, {
  foreignKey: 'idInquilino',
  as: 'departamento'
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

const db = {
  User,
  Department,
  Building,
  Payment,
  Incident,
  Contract,
  Notification,
  sequelize,
  Sequelize: require('sequelize')
};

console.log('🔍 Modelos y asociaciones cargados para Sequelize Auto-Sync');

module.exports = db;