// backend/src/models/plate-detection.model.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const PlateDetection = sequelize.define('PlateDetection', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        plate_text: {
            type: DataTypes.STRING(20),
            allowNull: false,
            comment: 'Texto de la placa detectada por OCR'
        },
        confidence: {
            type: DataTypes.FLOAT,
            allowNull: true,
            defaultValue: 0,
            comment: 'Nivel de confianza de la detección (0-100)'
        },
        image_path: {
            type: DataTypes.STRING(500),
            allowNull: true,
            comment: 'Ruta donde se guardó la imagen procesada'
        },
        device_ip: {
            type: DataTypes.STRING(45),
            allowNull: true,
            comment: 'Dirección IP del dispositivo/cámara que escaneó la placa'
        },
        detection_timestamp: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            comment: 'Fecha y hora de la detección'
        },
        status: {
            type: DataTypes.ENUM('pending', 'verified', 'rejected'),
            defaultValue: 'pending',
            comment: 'Estado de verificación de la detección'
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Notas adicionales sobre la detección'
        }
    }, {
        tableName: 'plate_detections',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                fields: ['detection_timestamp']
            },
            {
                fields: ['plate_text']
            },
            {
                fields: ['status']
            },
            {
                fields: ['device_ip']
            }
        ]
    });

    return PlateDetection;
};
