require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ CORS ESPECÍFICO PARA CREATE REACT APP
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/auth', require('./routes/auth.routes'));

// Ruta de salud
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ 
      success: true, 
      message: 'DepaManager API funcionando',
      database: 'Conectado',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error de base de datos',
      error: error.message
    });
  }
});

// Manejo de errores 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Sincronizar BD y iniciar servidor
const startServer = async () => {
  try {
    console.log('🔄 Sincronizando base de datos...');
    
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Base de datos sincronizada correctamente');
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`📊 BD: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
      console.log(`🔑 JWT: ${process.env.JWT_SECRET ? '✅ Configurado' : '❌ FALTANTE'}`);
      console.log(`🌐 CORS: Habilitado para http://localhost:3001`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();