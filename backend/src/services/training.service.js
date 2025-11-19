const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

class TrainingService {
    constructor() {
        this.trainingDataPath = path.join(__dirname, '../../training_data');
        this.trainingLogPath = path.join(this.trainingDataPath, 'training_log.jsonl');
        this.modelPath = path.join(__dirname, '../../eng.traineddata');
    }

    async initialize() {
        try {
            await fs.mkdir(this.trainingDataPath, { recursive: true });
            console.log('✅ Carpeta de entrenamiento inicializada');
        } catch (error) {
            console.error('❌ Error al inicializar carpeta de entrenamiento:', error);
        }
    }

    async logDetection(detectionData, correctedText = null) {
        try {
            await this.initialize();

            const trainingEntry = {
                timestamp: new Date().toISOString(),
                detected: {
                    text: detectionData.plateText,
                    rawText: detectionData.rawText,
                    confidence: detectionData.confidence,
                    pattern: detectionData.pattern,
                    engine: detectionData.engine,
                    isValid: detectionData.isValid
                },
                corrected: correctedText,
                needsCorrection: correctedText !== null && correctedText !== detectionData.plateText,
                metadata: {
                    score: detectionData.score || 0,
                    processingMethod: detectionData.processingMethod || 'unknown'
                }
            };

            const logLine = JSON.stringify(trainingEntry) + '\n';
            await fs.appendFile(this.trainingLogPath, logLine);

            console.log('📝 Detección registrada para entrenamiento');

            await this.checkTrainingThreshold();

            return {
                success: true,
                logged: true,
                trainingDataCount: await this.getTrainingDataCount()
            };

        } catch (error) {
            console.error('❌ Error al registrar detección:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getTrainingDataCount() {
        try {
            const content = await fs.readFile(this.trainingLogPath, 'utf-8');
            const lines = content.trim().split('\n').filter(line => line.length > 0);
            return lines.length;
        } catch (error) {
            return 0;
        }
    }

    async checkTrainingThreshold() {
        const count = await this.getTrainingDataCount();
        const threshold = 100;

        if (count > 0 && count % threshold === 0) {
            console.log(`🎓 Se alcanzaron ${count} detecciones. Considere reentrenar el modelo.`);
        }
    }

    async getTrainingStats() {
        try {
            const content = await fs.readFile(this.trainingLogPath, 'utf-8');
            const lines = content.trim().split('\n').filter(line => line.length > 0);

            if (lines.length === 0) {
                return {
                    totalDetections: 0,
                    correctionsNeeded: 0,
                    avgConfidence: 0,
                    patterns: {},
                    engines: {}
                };
            }

            const entries = lines.map(line => JSON.parse(line));

            const stats = {
                totalDetections: entries.length,
                correctionsNeeded: entries.filter(e => e.needsCorrection).length,
                avgConfidence: entries.reduce((sum, e) => sum + e.detected.confidence, 0) / entries.length,
                patterns: {},
                engines: {}
            };

            entries.forEach(e => {
                const pattern = e.detected.pattern || 'unknown';
                stats.patterns[pattern] = (stats.patterns[pattern] || 0) + 1;

                const engine = e.detected.engine || 'unknown';
                stats.engines[engine] = (stats.engines[engine] || 0) + 1;
            });

            return stats;

        } catch (error) {
            console.error('❌ Error al obtener estadísticas:', error);
            return null;
        }
    }

    async getDetectionsNeedingReview(limit = 50) {
        try {
            const content = await fs.readFile(this.trainingLogPath, 'utf-8');
            const lines = content.trim().split('\n').filter(line => line.length > 0);

            const entries = lines
                .map(line => JSON.parse(line))
                .filter(e => 
                    !e.corrected || 
                    (e.detected.confidence < 80) || 
                    !e.detected.isValid 
                )
                .slice(-limit);

            return {
                success: true,
                count: entries.length,
                detections: entries
            };

        } catch (error) {
            console.error('❌ Error al obtener detecciones para revisar:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async exportTrainingData() {
        try {
            const stats = await this.getTrainingStats();

            if (!stats || stats.totalDetections === 0) {
                return {
                    success: false,
                    message: 'No hay datos de entrenamiento disponibles'
                };
            }

            const exportPath = path.join(this.trainingDataPath, 'export');
            await fs.mkdir(exportPath, { recursive: true });

            const content = await fs.readFile(this.trainingLogPath, 'utf-8');
            const lines = content.trim().split('\n').filter(line => line.length > 0);
            const entries = lines.map(line => JSON.parse(line));

            const correctedEntries = entries.filter(e => e.corrected);

            if (correctedEntries.length === 0) {
                return {
                    success: false,
                    message: 'No hay detecciones corregidas para exportar'
                };
            }

            const mappingPath = path.join(exportPath, 'training_mapping.txt');
            const mappingContent = correctedEntries
                .map(e => `${e.detected.text}\t${e.corrected}`)
                .join('\n');

            await fs.writeFile(mappingPath, mappingContent);

            console.log(`✅ Exportados ${correctedEntries.length} pares de entrenamiento`);

            return {
                success: true,
                exported: correctedEntries.length,
                exportPath: exportPath,
                mappingFile: mappingPath,
                message: 'Datos exportados correctamente. Use estos datos con tesseract training tools.'
            };

        } catch (error) {
            console.error('❌ Error al exportar datos:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async cleanOldTrainingData(daysOld = 90) {
        try {
            const content = await fs.readFile(this.trainingLogPath, 'utf-8');
            const lines = content.trim().split('\n').filter(line => line.length > 0);

            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            const recentEntries = lines
                .map(line => JSON.parse(line))
                .filter(e => new Date(e.timestamp) > cutoffDate);

            const newContent = recentEntries.map(e => JSON.stringify(e)).join('\n') + '\n';
            await fs.writeFile(this.trainingLogPath, newContent);

            const removed = lines.length - recentEntries.length;
            console.log(`🧹 Limpiados ${removed} registros antiguos`);

            return {
                success: true,
                removed: removed,
                remaining: recentEntries.length
            };

        } catch (error) {
            console.error('❌ Error al limpiar datos:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new TrainingService();
