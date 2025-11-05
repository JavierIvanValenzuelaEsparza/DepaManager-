const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

/**
 * MODELO DE USUARIO (User)
 * Define la estructura y comportamiento de la entidad Usuario en la base de datos
 * Se encarga de la autenticación, validación y gestión de usuarios del sistema
 */
module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    // 🔑 IDENTIFICACIÓN PRINCIPAL
    idUsuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,           // ✅ Llave primaria
      autoIncrement: true,        // ✅ Auto-incrementable
      field: 'id_usuario'         // ✅ Mapea a columna 'id_usuario' en BD
    },

    // 👤 INFORMACIÓN PERSONAL
    nombreCompleto: {
      type: DataTypes.STRING(150),
      allowNull: false,           // ✅ Campo obligatorio
      field: 'nombre_completo'    // ✅ Mapea a columna 'nombre_completo' en BD
    },
    
    // 📧 CREDENCIALES DE ACCESO
    correo: {
      type: DataTypes.STRING(100),
      allowNull: false,           // ✅ Campo obligatorio
      unique: true,               // ✅ Email único en el sistema
      validate: {
        isEmail: true            // ✅ Validación de formato email
      }
    },
    
    // 🔐 CONTRASEÑA SEGURA
    contrasenia: {
      type: DataTypes.STRING(255),
      allowNull: false,           // ✅ Campo obligatorio
      field: 'contraseña'         // ✅ Mapea a columna 'contraseña' en BD (con ñ)
      // ⚠️ NOTA: El campo en código usa 'contrasenia' (sin ñ) pero en BD es 'contraseña' (con ñ)
      // Esto evita problemas con caracteres especiales en JavaScript
    },

    // 🎯 ROLES DEL SISTEMA
    rol: {
      type: DataTypes.ENUM('Administrador', 'Inquilino'),
      allowNull: false           // ✅ Campo obligatorio
    },

    // 📞 INFORMACIÓN DE CONTACTO
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true            // ✅ Campo opcional
    },
    
    dni: {
      type: DataTypes.STRING(20),
      unique: true,              // ✅ DNI único en el sistema
      allowNull: true            // ✅ Campo opcional
    },

    // 🎂 INFORMACIÓN DEMOGRÁFICA
    fechaNacimiento: {
      type: DataTypes.DATE,
      allowNull: true,           // ✅ Campo opcional
      field: 'fecha_nacimiento'  // ✅ Mapea a columna 'fecha_nacimiento' en BD
    },

    // 🖼️ ARCHIVOS MULTIMEDIA
    fotoPerfil: {
      type: DataTypes.STRING(255),
      allowNull: true,           // ✅ Campo opcional
      field: 'foto_perfil'       // ✅ Mapea a columna 'foto_perfil' en BD
    },

    // 🚦 ESTADOS DEL USUARIO
    estado: {
      type: DataTypes.ENUM('Activo', 'Pendiente', 'Retirado'),
      defaultValue: 'Activo'     // ✅ Valor por defecto: Activo
    },

    // 💼 PLANES DE SUSCRIPCIÓN
    plan: {
      type: DataTypes.ENUM('Gratuito', 'Estándar', 'Premium'),
      defaultValue: 'Gratuito'   // ✅ Valor por defecto: Gratuito
    },

    // 📅 INFORMACIÓN DE CONTRATOS
    fechaInicioContrato: {
      type: DataTypes.DATE,
      allowNull: true,           // ✅ Campo opcional
      field: 'fecha_inicio_contrato'  // ✅ Mapea a columna en BD
    },
    
    fechaFinContrato: {
      type: DataTypes.DATE,
      allowNull: true,           // ✅ Campo opcional
      field: 'fecha_fin_contrato'     // ✅ Mapea a columna en BD
    },

    // 🕐 METADATOS DEL SISTEMA
    fechaCreacion: {
      type: DataTypes.DATE,
      field: 'fecha_creacion',   // ✅ Mapea a columna 'fecha_creacion' en BD
      allowNull: true,           // ✅ Campo opcional
      defaultValue: DataTypes.NOW // ✅ Valor por defecto: fecha/hora actual
    }
  }, {
    // ⚙️ CONFIGURACIÓN DEL MODELO
    tableName: 'usuarios',       // ✅ Nombre real de la tabla en BD
    timestamps: false,           // ✅ Desactiva createdAt/updatedAt automáticos
    
    // 🪝 HOOKS (GANCHOS) - Se ejecutan automáticamente en ciertos eventos
    hooks: {
      /**
       * 🎯 BEFORE CREATE - Se ejecuta ANTES de crear un nuevo usuario
       * Responsabilidades:
       * 1. Hashear la contraseña para seguridad
       * 2. Asegurar fecha de creación
       */
      beforeCreate: async (user) => {
        // 🔐 HASH DE CONTRASEÑA - CRÍTICO PARA SEGURIDAD
        if (user.contrasenia) {
          console.log('🔐 Hasheando contraseña para nuevo usuario...');
          try {
            // ✅ FORMA CORRECTA: Generar salt y hashear
            const saltRounds = 10;
            user.contrasenia = await bcrypt.hash(user.contrasenia, saltRounds);
            console.log('✅ Contraseña hasheada correctamente');
          } catch (error) {
            console.error('❌ Error al hashear contraseña:', error);
            throw error; // ⚠️ Importante: No crear usuario sin contraseña hasheada
          }
        }

        // 📅 FECHA DE CREACIÓN - Backup por si defaultValue falla
        if (!user.fechaCreacion) {
          user.fechaCreacion = new Date();
        }
      },

      /**
       * 🎯 BEFORE UPDATE - Se ejecuta ANTES de actualizar un usuario
       * Responsabilidades:
       * 1. Hashear la contraseña solo si fue modificada
       */
      beforeUpdate: async (user) => {
        // 🔐 ACTUALIZAR HASH si la contraseña cambió
        if (user.changed('contrasenia')) {
          console.log('🔐 Actualizando contraseña hasheada...');
          try {
            const saltRounds = 10;
            user.contrasenia = await bcrypt.hash(user.contrasenia, saltRounds);
            console.log('✅ Contraseña actualizada y hasheada correctamente');
          } catch (error) {
            console.error('❌ Error al actualizar contraseña:', error);
            throw error; // ⚠️ Importante: No actualizar con contraseña sin hashear
          }
        }
      }
    }
  });

  // 🎯 MÉTODOS DE INSTANCIA - Funciones disponibles en cada objeto User
  /**
   * 🔐 VALIDAR CONTRASEÑA
   * Compara una contraseña en texto plano con el hash almacenado en BD
   * @param {string} contrasenia - Contraseña en texto plano a validar
   * @returns {Promise<boolean>} - True si coincide, False si no
   * 
   * ⚠️ CRÍTICO: Este método es esencial para el proceso de login
   */
  User.prototype.validarContrasenia = function(contrasenia) {
    return bcrypt.compare(contrasenia, this.contrasenia);
  };

  // 🏁 RETORNO DEL MODELO COMPLETO
  return User;
};