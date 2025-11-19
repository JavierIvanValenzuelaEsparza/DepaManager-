// backend/src/controllers/camera.controller.js
const ocrService = require('../services/ocr.service');
const trainingService = require('../services/training.service');
const rtspMonitorService = require('../services/rtsp-monitor.service');
const { PlateDetection } = require('../models');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');

class CameraController {

    /**
     * Endpoint PRODUCCIÓN - Detecta con UN motor y guarda en BD
     * POST /camera/detect
     * SÍ GUARDA en BD y en disco (uploads/plates)
     */
    async uploadAndDetect(req, res) {
        try {
            console.log('📸 Recibiendo imagen para detección...');

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No se recibió ninguna imagen'
                });
            }

            const imagePath = req.file.path;
            console.log('📁 Imagen guardada en:', imagePath);

            // Ejecutar OCR en la imagen
            const ocrResult = await ocrService.detectPlate(imagePath);

            if (!ocrResult.success) {
                return res.status(500).json({
                    success: false,
                    message: 'Error al procesar la imagen con OCR',
                    error: ocrResult.error
                });
            }

            // Guardar la detección en la base de datos
            const detection = await PlateDetection.create({
                plate_text: ocrResult.text || 'NO_DETECTADO',
                confidence: ocrResult.confidence,
                image_path: imagePath,
                detection_timestamp: ocrResult.timestamp,
                status: ocrResult.isValid ? 'pending' : 'rejected',
                notes: !ocrResult.isValid ? 'Texto detectado no parece una placa válida' : null
            });

            console.log('✅ Detección guardada con ID:', detection.id);

            // Registrar para entrenamiento
            await trainingService.logDetection({
                plateText: ocrResult.text,
                rawText: ocrResult.rawText,
                confidence: ocrResult.confidence,
                pattern: ocrResult.pattern,
                engine: 'node-tesseract',
                isValid: ocrResult.isValid,
                processingMethod: ocrResult.processingMethod
            });

            return res.status(200).json({
                success: true,
                message: 'Imagen procesada correctamente',
                data: {
                    id: detection.id,
                    plateText: ocrResult.text,
                    rawText: ocrResult.rawText,
                    confidence: ocrResult.confidence,
                    isValid: ocrResult.isValid,
                    timestamp: ocrResult.timestamp,
                    imagePath: imagePath
                }
            });

        } catch (error) {
            console.error('❌ Error en uploadAndDetect:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Endpoint PRODUCCIÓN Multi-Motor - Detecta con MÚLTIPLES motores y guarda en BD
     * POST /camera/detect-multi
     * SÍ GUARDA en BD - NO guarda imagen en disco (usa temporal y lo elimina)
     * Usa el mejor resultado de múltiples motores OCR
     */
    async uploadAndDetectMulti(req, res) {
        let tempFilePath = null;

        try {
            console.log('🚀 [MULTI-PROD] Recibiendo imagen para detección...');

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No se recibió ninguna imagen'
                });
            }

            // Si el archivo está en memoria (Buffer), crear archivo temporal
            if (req.file.buffer) {
                const tempDir = os.tmpdir();
                const tempFileName = `plate-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(req.file.originalname || '.jpg')}`;
                tempFilePath = path.join(tempDir, tempFileName);
                
                await fs.writeFile(tempFilePath, req.file.buffer);
                console.log('📁 [MULTI-PROD] Archivo temporal creado:', tempFilePath);
            } else {
                tempFilePath = req.file.path;
            }

            // Ejecutar multi-OCR
            const multiOcrService = require('../services/multi-ocr.service');
            const result = await multiOcrService.detectPlateMultiEngine(tempFilePath);

            if (!result.success) {
                return res.status(500).json({
                    success: false,
                    message: 'Error en detección multi-motor',
                    error: result.error || result.message
                });
            }

            const best = result.bestResult;

            // Guardar la detección en la base de datos (SIN ruta de imagen)
            const detection = await PlateDetection.create({
                plate_text: best.text || 'NO_DETECTADO',
                confidence: best.confidence,
                image_path: null, // NO guardar ruta de imagen
                detection_timestamp: result.timestamp,
                status: best.isValid && best.confidence >= 80 ? 'pending' : 'rejected',
                notes: `Motor: ${best.engine} | Patrón: ${best.pattern} | Score: ${Math.round(best.score * 10) / 10}`
            });

            console.log(`✅ [MULTI-PROD] Detección guardada con ID: ${detection.id} - Motor: ${best.engine}`);

            // Registrar para entrenamiento
            await trainingService.logDetection({
                plateText: best.text,
                rawText: best.rawText,
                confidence: best.confidence,
                pattern: best.pattern,
                engine: best.engine,
                isValid: best.isValid,
                score: best.score,
                processingMethod: best.extractionMethod || 'multi-ocr'
            });

            return res.status(200).json({
                success: true,
                message: `Imagen procesada con ${best.engine}`,
                saved_to_database: true,
                saved_to_disk: false,
                logged_for_training: true,
                data: {
                    id: detection.id,
                    plateText: best.text,
                    rawText: best.rawText,
                    confidence: best.confidence,
                    isValid: best.isValid,
                    pattern: best.pattern,
                    engine: best.engine,
                    score: best.score,
                    timestamp: result.timestamp,
                    allEngines: result.allResults.slice(0, 5).map(r => ({
                        engine: r.engine,
                        text: r.text,
                        confidence: r.confidence
                    }))
                }
            });

        } catch (error) {
            console.error('❌ [MULTI-PROD] Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        } finally {
            // SIEMPRE eliminar archivo temporal
            if (tempFilePath) {
                await fs.unlink(tempFilePath).catch(err => {
                    console.warn('⚠️ No se pudo eliminar archivo temporal:', err.message);
                });
                console.log('🗑️ Archivo temporal eliminado');
            }
        }
    }

    async getDetections(req, res) {
        try {
            const {
                status,
                limit = 50,
                offset = 0,
                startDate,
                endDate
            } = req.query;

            const where = {};

            if (status) {
                where.status = status;
            }

            if (startDate || endDate) {
                where.detection_timestamp = {};
                if (startDate) {
                    where.detection_timestamp.$gte = new Date(startDate);
                }
                if (endDate) {
                    where.detection_timestamp.$lte = new Date(endDate);
                }
            }

            // Obtener detecciones
            const detections = await PlateDetection.findAndCountAll({
                where,
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['detection_timestamp', 'DESC']]
            });

            return res.status(200).json({
                success: true,
                message: 'Detecciones obtenidas correctamente',
                data: {
                    total: detections.count,
                    detections: detections.rows
                }
            });

        } catch (error) {
            console.error('❌ Error en getDetections:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener detecciones',
                error: error.message
            });
        }
    }

    async getDetectionById(req, res) {
        try {
            const { id } = req.params;

            const detection = await PlateDetection.findByPk(id);

            if (!detection) {
                return res.status(404).json({
                    success: false,
                    message: 'Detección no encontrada'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Detección obtenida correctamente',
                data: detection
            });

        } catch (error) {
            console.error('❌ Error en getDetectionById:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener detección',
                error: error.message
            });
        }
    }

    async updateDetectionStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, notes } = req.body;

            // Validar estado
            if (status && !['pending', 'verified', 'rejected'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Estado inválido. Debe ser: pending, verified o rejected'
                });
            }

            const detection = await PlateDetection.findByPk(id);

            if (!detection) {
                return res.status(404).json({
                    success: false,
                    message: 'Detección no encontrada'
                });
            }

            // Actualizar
            if (status) detection.status = status;
            if (notes !== undefined) detection.notes = notes;

            await detection.save();

            return res.status(200).json({
                success: true,
                message: 'Detección actualizada correctamente',
                data: detection
            });

        } catch (error) {
            console.error('❌ Error en updateDetectionStatus:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al actualizar detección',
                error: error.message
            });
        }
    }

    /**
     * Endpoint Multi-Motor OCR - usa múltiples motores en paralelo
     * POST /camera/test-multi-ocr
     * NO GUARDA ARCHIVOS EN DISCO - usa archivos temporales que se eliminan
     */
    async testMultiOCR(req, res) {
        let tempFilePath = null;

        try {
            console.log('🚀 [MULTI-OCR] Recibiendo imagen...');

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No se recibió ninguna imagen'
                });
            }

            // Si el archivo está en memoria (Buffer), crear archivo temporal
            if (req.file.buffer) {
                const tempDir = os.tmpdir();
                const tempFileName = `plate-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(req.file.originalname)}`;
                tempFilePath = path.join(tempDir, tempFileName);
                
                await fs.writeFile(tempFilePath, req.file.buffer);
                console.log('📁 [MULTI-OCR] Archivo temporal creado:', tempFilePath);
            } else {
                tempFilePath = req.file.path;
            }

            // Ejecutar multi-OCR
            const multiOcrService = require('../services/multi-ocr.service');
            const result = await multiOcrService.detectPlateMultiEngine(tempFilePath);

            if (!result.success) {
                return res.status(500).json({
                    success: false,
                    message: 'Error en detección multi-motor',
                    error: result.error || result.message
                });
            }

            const best = result.bestResult;
            const meetsConfidence = best.confidence >= 80;

            console.log(`🏆 [MULTI-OCR] Mejor: ${best.engine} - "${best.text}" (${best.confidence}%)`);

            // Registrar para entrenamiento (sin guardar imagen)
            await trainingService.logDetection({
                plateText: best.text,
                rawText: best.rawText,
                confidence: best.confidence,
                pattern: best.pattern,
                engine: best.engine,
                isValid: best.isValid,
                score: best.score,
                processingMethod: best.extractionMethod || 'multi-ocr'
            });

            return res.status(200).json({
                success: true,
                message: meetsConfidence
                    ? `✅ Placa detectada con ${best.engine} (alta confianza)`
                    : `⚠️ Placa detectada con ${best.engine} (baja confianza)`,
                test_mode: true,
                saved_to_database: false,
                saved_to_disk: false,
                logged_for_training: true,
                data: {
                    // Mejor resultado
                    winner: {
                        engine: best.engine,
                        plateText: best.text,
                        rawText: best.rawText,
                        confidence: best.confidence,
                        score: Math.round(best.score * 10) / 10,
                        pattern: best.pattern,
                        isValid: best.isValid,
                        meetsMinimumConfidence: meetsConfidence
                    },
                    // Comparativa de todos los motores
                    allEngines: result.allResults.map(r => ({
                        engine: r.engine,
                        text: r.text,
                        confidence: r.confidence,
                        score: Math.round(r.score * 10) / 10,
                        pattern: r.pattern
                    })),
                    // Metadata
                    timestamp: result.timestamp,
                    validationDetails: {
                        minimumRequired: 80,
                        detected: best.confidence,
                        passes: meetsConfidence
                    }
                }
            });

        } catch (error) {
            console.error('❌ [MULTI-OCR] Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        } finally {
            // SIEMPRE eliminar archivo temporal
            if (tempFilePath) {
                await fs.unlink(tempFilePath).catch(err => {
                    console.warn('⚠️ No se pudo eliminar archivo temporal:', err.message);
                });
                console.log('🗑️ Archivo temporal eliminado');
            }
        }
    }

    /**
     * Endpoint de PRUEBA para detectar placas sin guardar en BD
     * POST /camera/test-detect
     * NO GUARDA ARCHIVOS EN DISCO - usa archivos temporales que se eliminan
     * @description Solo para pruebas, no persiste datos
     */
    async testPlateDetection(req, res) {
        let tempFilePath = null;

        try {
            console.log('🧪 [TEST] Recibiendo imagen para detección...');

            // Validar que se recibió una imagen
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No se recibió ninguna imagen'
                });
            }

            // Si el archivo está en memoria (Buffer), crear archivo temporal
            if (req.file.buffer) {
                const tempDir = os.tmpdir();
                const tempFileName = `plate-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(req.file.originalname)}`;
                tempFilePath = path.join(tempDir, tempFileName);
                
                await fs.writeFile(tempFilePath, req.file.buffer);
                console.log('📁 [TEST] Archivo temporal creado:', tempFilePath);
            } else {
                tempFilePath = req.file.path;
            }

            // Ejecutar OCR en la imagen
            const ocrResult = await ocrService.detectPlate(tempFilePath);

            if (!ocrResult.success) {
                return res.status(500).json({
                    success: false,
                    message: 'Error al procesar la imagen con OCR',
                    error: ocrResult.error
                });
            }

            // Verificar si cumple con el 80% de confianza
            const meetsConfidence = ocrResult.confidence >= 80;

            console.log(`📊 [TEST] Confianza: ${ocrResult.confidence}% - Válida: ${ocrResult.isValid} - Cumple 80%: ${meetsConfidence}`);

            // Registrar para entrenamiento (sin guardar imagen)
            await trainingService.logDetection({
                plateText: ocrResult.text,
                rawText: ocrResult.rawText,
                confidence: ocrResult.confidence,
                pattern: ocrResult.pattern,
                engine: 'node-tesseract',
                isValid: ocrResult.isValid,
                processingMethod: ocrResult.processingMethod
            });

            // Responder con el resultado SIN guardar en BD ni disco
            return res.status(200).json({
                success: true,
                message: meetsConfidence
                    ? '✅ Placa detectada con alta confianza'
                    : '⚠️ Placa detectada pero con baja confianza',
                test_mode: true,
                saved_to_database: false,
                saved_to_disk: false,
                logged_for_training: true,
                data: {
                    plateText: ocrResult.text,
                    rawText: ocrResult.rawText,
                    confidence: ocrResult.confidence,
                    isValid: ocrResult.isValid,
                    meetsMinimumConfidence: meetsConfidence,
                    pattern: ocrResult.pattern,
                    timestamp: ocrResult.timestamp,
                    validationDetails: {
                        minimumRequired: 80,
                        detected: ocrResult.confidence,
                        passes: meetsConfidence,
                        patternMatched: ocrResult.pattern
                    }
                }
            });

        } catch (error) {
            console.error('❌ [TEST] Error en testPlateDetection:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        } finally {
            // SIEMPRE eliminar archivo temporal
            if (tempFilePath) {
                await fs.unlink(tempFilePath).catch(err => {
                    console.warn('⚠️ No se pudo eliminar archivo temporal:', err.message);
                });
                console.log('🗑️ Archivo temporal eliminado');
            }
        }
    }

    /**
     * Elimina una detección
     * DELETE /camera/detections/:id
     */
    async deleteDetection(req, res) {
        try {
            const { id } = req.params;

            const detection = await PlateDetection.findByPk(id);

            if (!detection) {
                return res.status(404).json({
                    success: false,
                    message: 'Detección no encontrada'
                });
            }

            // Eliminar archivo de imagen si existe
            if (detection.image_path) {
                await fs.unlink(detection.image_path).catch(err => {
                    console.warn('⚠️ No se pudo eliminar imagen:', err.message);
                });
            }

            await detection.destroy();

            return res.status(200).json({
                success: true,
                message: 'Detección eliminada correctamente'
            });

        } catch (error) {
            console.error('❌ Error en deleteDetection:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al eliminar detección',
                error: error.message
            });
        }
    }

    // ==================== RTSP ====================

    /**
     * Inicia monitoreo RTSP
     * POST /camera/rtsp/start
     * Body (opcional): { 
     *   rtspUrl, cameraName, fps, cooldownTime,
     *   framesPerAnalysis, minConfidenceToSave, frameIntervalMs 
     * }
     */
    async startRTSP(req, res) {
        try {
            const { 
                rtspUrl, 
                cameraName, 
                fps = 0.1, // Por defecto: cada 10 segundos
                cooldownTime = 30000, // Por defecto: 30 segundos
                framesPerAnalysis = 5, // Cantidad de frames por análisis
                minConfidenceToSave = 80, // Confianza mínima para guardar
                frameIntervalMs = 500 // Intervalo entre frames de análisis
            } = req.body;

            // Configurar parámetros del servicio
            if (cooldownTime) {
                rtspMonitorService.cooldownTime = cooldownTime;
            }
            if (framesPerAnalysis) {
                rtspMonitorService.framesPerAnalysis = framesPerAnalysis;
            }
            if (minConfidenceToSave) {
                rtspMonitorService.minConfidenceToSave = minConfidenceToSave;
            }
            if (frameIntervalMs) {
                rtspMonitorService.frameIntervalMs = frameIntervalMs;
            }

            const result = await rtspMonitorService.start(
                rtspUrl,
                cameraName || 'Cámara Principal',
                fps
            );

            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            console.error('❌ Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al iniciar',
                error: error.message
            });
        }
    }

    /**
     * Detiene monitoreo RTSP
     * POST /camera/rtsp/stop
     */
    async stopRTSP(req, res) {
        try {
            const result = rtspMonitorService.stop();
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            console.error('❌ Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al detener',
                error: error.message
            });
        }
    }

    /**
     * Estado RTSP
     * GET /camera/rtsp/status
     */
    async statusRTSP(req, res) {
        try {
            const status = rtspMonitorService.getStatus();
            return res.status(200).json({
                success: true,
                data: status
            });
        } catch (error) {
            console.error('❌ Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener estado',
                error: error.message
            });
        }
    }

    /**
     * Diagnóstico de conexión RTSP
     * GET /camera/rtsp/diagnose
     */
    async diagnoseRTSP(req, res) {
        try {
            const { rtspUrl = '' } = req.query;
            
            console.log(`\n🔍 Diagnosticando conexión RTSP...`);
            console.log(`📡 URL: ${rtspUrl}`);
            
            const { spawn } = require('child_process');
            const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
            
            // Intentar conexión simple con timeout corto
            const args = [
                '-rtsp_transport', 'tcp',
                '-i', rtspUrl,
                '-frames:v', '1', // Solo 1 frame
                '-f', 'null',
                '-'
            ];
            
            const ffprobe = spawn(ffmpegPath, args);
            
            let output = '';
            let errorOutput = '';
            
            ffprobe.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });
            
            ffprobe.on('close', (code) => {
                console.log(`\n📊 Resultado del diagnóstico:`);
                console.log(`   Código de salida: ${code}`);
                console.log(`   Output: ${errorOutput.substring(0, 500)}`);
                
                const isConnectable = code === 0 || errorOutput.includes('Stream #0:0');
                const hasVideo = errorOutput.includes('Video:');
                
                return res.status(200).json({
                    success: isConnectable,
                    rtspUrl,
                    exitCode: code,
                    isConnectable,
                    hasVideo,
                    details: {
                        streamInfo: errorOutput.includes('Stream #0:0') ? 
                            errorOutput.match(/Stream #0:0.*\n/g) : null,
                        videoCodec: errorOutput.includes('Video:') ? 
                            errorOutput.match(/Video: [^\n]+/g) : null,
                        rawOutput: errorOutput.substring(0, 1000)
                    },
                    suggestions: isConnectable ? 
                        ['✅ La conexión RTSP funciona correctamente'] :
                        [
                            '❌ No se pudo conectar al stream RTSP',
                            'Verifica que la cámara esté encendida',
                            'Verifica la URL y el puerto',
                            'Verifica que haya conexión de red',
                        ]
                });
            });
            
        } catch (error) {
            console.error('❌ Error en diagnóstico:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al diagnosticar',
                error: error.message
            });
        }
    }
}

module.exports = new CameraController();
