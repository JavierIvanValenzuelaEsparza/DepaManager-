require('dotenv').config();

// Para Railway que usa DATABASE_URL
const getDatabaseConfig = () => {
  // Si existe DATABASE_URL de Railway, la usamos
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    return {
      database: url.pathname.substring(1), // Remover el "/" inicial
      username: url.username,
      password: url.password,
      host: url.hostname,
      port: url.port || 3306,
      dialect: 'mysql',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      define: {
        timestamps: true,
        underscored: true
      }
    };
  }

  // Si no, usamos variables individuales (local o Railway)
  return {
    database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'depamanager',
    username: process.env.MYSQLUSER || process.env.DB_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
    host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
    port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true
    }
  };
};

module.exports = getDatabaseConfig();