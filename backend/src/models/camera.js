module.exports = (sequelize, DataTypes) => {
    const Camera = sequelize.define('Camera', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'Nombre descriptivo de la cámara'
        },
        rtsp_url: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'URL del stream RTSP'
        },
        location: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Ubicación física de la cámara'
        },
        building_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Edificio al que pertenece'
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            comment: 'Si la cámara está activa'
        },
        fps: {
            type: DataTypes.FLOAT,
            defaultValue: 0.5,
            comment: 'Frames por segundo para captura (0.5 = cada 2 seg)'
        },
        status: {
            type: DataTypes.ENUM('online', 'offline', 'error'),
            defaultValue: 'offline',
            comment: 'Estado de conexión de la cámara'
        },
        last_connection: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Última vez que se conectó exitosamente'
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Notas adicionales'
        }
    }, {
        tableName: 'cameras',
        timestamps: true,
        underscored: true,
        comment: 'Cámaras RTSP del sistema'
    });

    Camera.associate = (models) => {
        // Una cámara pertenece a un edificio
        if (models.Building) {
            Camera.belongsTo(models.Building, {
                foreignKey: 'building_id',
                as: 'building'
            });
        }
    };

    return Camera;
};
