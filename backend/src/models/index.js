const sequelize = require('../config/sequelize');

// ✅ Cargar modelos manualmente (más estable)
const User = require('./user')(sequelize, require('sequelize').DataTypes);

const db = {
  User,
  sequelize,
  Sequelize: require('sequelize')
};

console.log('🔍 Modelos cargados:', Object.keys(db));

module.exports = db;