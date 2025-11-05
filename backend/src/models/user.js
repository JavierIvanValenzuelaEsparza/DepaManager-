const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    idUsuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_usuario'
    },
    nombreCompleto: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: 'nombre_completo'
    },
    correo: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    contrasenia: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'contraseña'
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
    fechaNacimiento: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'fecha_nacimiento'
    },
    fotoPerfil: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'foto_perfil'
    },
    estado: {
      type: DataTypes.ENUM('Activo', 'Pendiente', 'Retirado'),
      defaultValue: 'Activo'
    },
    plan: {
      type: DataTypes.ENUM('Gratuito', 'Estándar', 'Premium'),
      defaultValue: 'Gratuito'
    },
    fechaInicioContrato: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'fecha_inicio_contrato'
    },
    fechaFinContrato: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'fecha_fin_contrato'
    },
    fechaCreacion: {
      type: DataTypes.DATE,
      field: 'fecha_creacion',
      allowNull: true,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'usuarios',
    timestamps: false,
    hooks: {
      beforeCreate: async (user) => {
        try {
          console.log('🔐 Hook beforeCreate ejecutándose...');
          console.log('🔐 Contraseña antes del hash:', user.contrasenia);
          
          if (user.contrasenia) {
            // ✅ FORMA CORRECTA - Con salt explícito
            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);
            user.contrasenia = await bcrypt.hash(user.contrasenia, salt);
            
            console.log('✅ Contraseña hasheada correctamente');
            console.log('🔐 Hash generado (primeros 30 chars):', user.contrasenia.substring(0, 30) + '...');
          }
        } catch (error) {
          console.error('❌ Error crítico en beforeCreate:', error);
          throw new Error('No se pudo hashear la contraseña: ' + error.message);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('contrasenia')) {
          console.log('🔐 Actualizando contraseña...');
          try {
            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);
            user.contrasenia = await bcrypt.hash(user.contrasenia, salt);
            console.log('✅ Contraseña actualizada correctamente');
          } catch (error) {
            console.error('❌ Error al actualizar contraseña:', error);
            throw error;
          }
        }
      }
    }
  });

  // ✅ MÉTODO MEJORADO con logs de debug
  User.prototype.validarContrasenia = async function(contrasenia) {
    try {
      console.log('🔐 validarContrasenia - Iniciando verificación...');
      console.log('🔐 Contraseña recibida para validar:', contrasenia);
      console.log('🔐 Hash almacenado en BD:', this.contrasenia);
      console.log('🔐 Longitud del hash:', this.contrasenia?.length);
      
      // Verificar si el hash parece ser un hash bcrypt válido
      const isBcryptHash = this.contrasenia && this.contrasenia.startsWith('$2b$');
      console.log('🔐 ¿Parece ser hash bcrypt?:', isBcryptHash);
      
      const resultado = await bcrypt.compare(contrasenia, this.contrasenia);
      console.log('🔐 Resultado de bcrypt.compare:', resultado);
      
      return resultado;
    } catch (error) {
      console.error('❌ Error en validarContrasenia:', error);
      return false;
    }
  };

  return User;
};