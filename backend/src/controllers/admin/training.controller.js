const trainingService = require('../../services/training.service');

class TrainingController {
    async getTrainingStats(req, res) {
        try {
            const stats = await trainingService.getTrainingStats();

            if (!stats) {
                return res.status(404).json({
                    success: false,
                    message: 'No hay datos de entrenamiento disponibles'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Estadísticas obtenidas correctamente',
                data: stats
            });

        } catch (error) {
            console.error('❌ Error al obtener estadísticas:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas',
                error: error.message
            });
        }
    }

    /**
     * Obtiene detecciones que necesitan revisión
     * GET /admin/training/review
     */
    async getDetectionsForReview(req, res) {
        try {
            const { limit = 50 } = req.query;

            const result = await trainingService.getDetectionsNeedingReview(parseInt(limit));

            if (!result.success) {
                return res.status(500).json({
                    success: false,
                    message: 'Error al obtener detecciones',
                    error: result.error
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Detecciones obtenidas correctamente',
                data: result
            });

        } catch (error) {
            console.error('❌ Error al obtener detecciones:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener detecciones',
                error: error.message
            });
        }
    }

    /**
     * Registra una corrección manual de placa
     * POST /admin/training/correct
     * Body: { detectedText, correctedText, timestamp }
     */
    async submitCorrection(req, res) {
        try {
            const { detectedText, correctedText } = req.body;

            if (!detectedText || !correctedText) {
                return res.status(400).json({
                    success: false,
                    message: 'Se requiere detectedText y correctedText'
                });
            }

            // Registrar la corrección
            const result = await trainingService.logDetection({
                plateText: detectedText,
                rawText: detectedText,
                confidence: 100, // Es una corrección manual
                pattern: 'manual_correction',
                engine: 'human',
                isValid: true
            }, correctedText);

            return res.status(200).json({
                success: true,
                message: 'Corrección registrada correctamente',
                data: result
            });

        } catch (error) {
            console.error('❌ Error al registrar corrección:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al registrar corrección',
                error: error.message
            });
        }
    }

    /**
     * Exporta datos de entrenamiento
     * GET /admin/training/export
     */
    async exportTrainingData(req, res) {
        try {
            const result = await trainingService.exportTrainingData();

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    message: result.message || 'Error al exportar datos',
                    error: result.error
                });
            }

            return res.status(200).json({
                success: true,
                message: result.message,
                data: {
                    exported: result.exported,
                    exportPath: result.exportPath,
                    mappingFile: result.mappingFile
                }
            });

        } catch (error) {
            console.error('❌ Error al exportar datos:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al exportar datos',
                error: error.message
            });
        }
    }

    /**
     * Limpia datos de entrenamiento antiguos
     * DELETE /admin/training/clean
     * Query: daysOld (default: 90)
     */
    async cleanOldData(req, res) {
        try {
            const { daysOld = 90 } = req.query;

            const result = await trainingService.cleanOldTrainingData(parseInt(daysOld));

            if (!result.success) {
                return res.status(500).json({
                    success: false,
                    message: 'Error al limpiar datos',
                    error: result.error
                });
            }

            return res.status(200).json({
                success: true,
                message: `Datos antiguos limpiados correctamente`,
                data: {
                    removed: result.removed,
                    remaining: result.remaining
                }
            });

        } catch (error) {
            console.error('❌ Error al limpiar datos:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al limpiar datos',
                error: error.message
            });
        }
    }
}

module.exports = new TrainingController();
