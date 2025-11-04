const sequelize = require('../config/sequelize');

// Importar modelos
const User = require('./user')(sequelize);

// Sincronizar asociaciones
Object.keys(sequelize.models).forEach(modelName => {
  if (sequelize.models[modelName].associate) {
    sequelize.models[modelName].associate(sequelize.models);
  }
});

const db = {
  sequelize,
  Sequelize: require('sequelize'),
  User
};

module.exports = db;