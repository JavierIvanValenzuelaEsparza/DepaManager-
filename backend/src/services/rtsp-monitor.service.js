const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const path = require('path');
const fs = require('fs').promises;
const multiOcrService = require('./multi-ocr.service');
const imageEnhancement = require('./image-enhancement.service');

ffmpeg.setFfmpegPath(ffmpegPath);

class RTSPMonitorService {
    constructor() {
        this.isActive = false;
        this.stream = null;
        this.rtspUrl = null;
        this.cameraName = null;
        this.deviceIp = null;
        this.fps = 0.1;
        this.captureInterval = null;
        this.stats = {
            framesProcessed: 0,
            platesDetected: 0,
            errors: 0,
            startTime: null
        };
        this.lastDetectedPlates = new Map();
        this.cooldownTime = 30000;
        this.isProcessing = false;
        
        this.currentAnalysis = null;
        this.framesPerAnalysis = 5;
        this.minConfidenceToSave = 80;
        this.frameIntervalMs = 500;
    }

    /**
     * Inicia el monitoreo RTSP
     */
    async start(rtspUrl, cameraName = 'Cámara Principal', fps = 0.1) {
        try {
            if (this.isActive) {
                return {
                    success: false,
                    message: '⚠️ El monitoreo ya está activo'
                };
            }

            this.deviceIp = this.extractIpFromUrl(rtspUrl);

            console.log('\n🎥 Iniciando monitoreo RTSP...');
            console.log(`📡 URL: ${rtspUrl}`);
            console.log(`📹 Cámara: ${cameraName}`);
            console.log(`📱 IP del dispositivo: ${this.deviceIp || 'No detectado'}`);
            console.log(`⏱️  FPS: ${fps} (captura cada ${Math.round(1/fps)} segundos)`);

            this.rtspUrl = rtspUrl;
            this.cameraName = cameraName;
            this.fps = fps;
            this.isActive = true;
            this.isProcessing = false;
            this.lastDetectedPlates.clear();
            this.stats = {
                framesProcessed: 0,
                platesDetected: 0,
                errors: 0,
                startTime: new Date()
            };

            this.startCapture();

            return {
                success: true,
                message: '✅ Monitoreo RTSP iniciado correctamente',
                data: {
                    rtspUrl: this.rtspUrl,
                    cameraName: this.cameraName,
                    deviceIp: this.deviceIp,
                    fps: this.fps,
                    captureInterval: Math.round(1/fps),
                    cooldownTime: this.cooldownTime / 1000,
                    startTime: this.stats.startTime
                }
            };

        } catch (error) {
            console.error('❌ Error al iniciar monitoreo RTSP:', error);
            this.isActive = false;
            return {
                success: false,
                message: 'Error al iniciar monitoreo RTSP',
                error: error.message
            };
        }
    }

    extractIpFromUrl(url) {
        try {
            const urlPattern = /(?:https?:\/\/|rtsp:\/\/)?([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/;
            const match = url.match(urlPattern);
            return match ? match[1] : null;
        } catch (error) {
            console.error('❌ Error al extraer IP de URL:', error);
            return null;
        }
    }

    startCapture() {
        const intervalMs = Math.round(1000 / this.fps);
        
        console.log(`\n▶️  Iniciando captura cada ${intervalMs}ms`);

        this.captureInterval = setInterval(async () => {
            if (!this.isActive) {
                clearInterval(this.captureInterval);
                return;
            }

            await this.captureAndProcess();
        }, intervalMs);
    }

    /**
     * Captura múltiples frames y los analiza para aumentar confianza
     */
    async captureAndProcess() {
        if (this.isProcessing) {
            console.log('⏭️  Saltando captura - análisis multi-frame en curso...');
            return;
        }

        try {
            this.isProcessing = true;

            console.log('\n╔═══════════════════════════════════════════════════════╗');
            console.log('║  🚗 INICIANDO ANÁLISIS MULTI-FRAME                   ║');
            console.log(`║  📊 Frames a analizar: ${this.framesPerAnalysis}                           ║`);
            console.log(`║  🎯 Confianza mínima: ${this.minConfidenceToSave}%                         ║`);
            console.log('╚═══════════════════════════════════════════════════════╝\n');

            const now = Date.now();
            for (const [plate, timestamp] of this.lastDetectedPlates.entries()) {
                if (now - timestamp > this.cooldownTime) {
                    this.lastDetectedPlates.delete(plate);
                }
            }

            const frameResults = [];

            for (let i = 0; i < this.framesPerAnalysis; i++) {
                console.log(`\n📸 ═══ Frame ${i + 1}/${this.framesPerAnalysis} ═══`);
                
                const result = await this.captureAndAnalyzeSingleFrame(i + 1);
                
                if (result.success) {
                    frameResults.push(result);
                    console.log(`✅ Frame ${i + 1} analizado: "${result.plateText}" (${result.confidence}%)`);
                    console.log(`   💾 Guardado: ${result.framePath}`);
                } else {
                    console.log(`⚠️ Frame ${i + 1}: Sin detección válida`);
                }

                if (i < this.framesPerAnalysis - 1) {
                    console.log(`⏳ Esperando ${this.frameIntervalMs}ms para siguiente frame...`);
                    await new Promise(resolve => setTimeout(resolve, this.frameIntervalMs));
                }
            }

            console.log('\n╔═══════════════════════════════════════════════════════╗');
            console.log('║  📊 ANÁLISIS COMPLETO - CONSOLIDANDO RESULTADOS      ║');
            console.log('╚═══════════════════════════════════════════════════════╝\n');

            const consolidatedResult = this.consolidateResults(frameResults);

            if (!consolidatedResult) {
                console.log('❌ No se pudo consolidar ningún resultado válido\n');
                return;
            }

            const { plateText, confidence, occurrences, bestResult } = consolidatedResult;

            console.log('🎯 RESULTADO CONSOLIDADO:');
            console.log(`   📋 Placa: "${plateText}"`);
            console.log(`   💯 Confianza Final: ${confidence}%`);
            console.log(`   🔢 Detecciones: ${occurrences}/${this.framesPerAnalysis} frames`);
            console.log(`   🔧 Motor: ${bestResult.engine}`);
            console.log(`   🔢 Patrón: ${bestResult.pattern}\n`);

            if (this.lastDetectedPlates.has(plateText)) {
                const lastTime = this.lastDetectedPlates.get(plateText);
                const timeSince = Math.round((now - lastTime) / 1000);
                console.log(`⏭️ Placa "${plateText}" ya guardada hace ${timeSince}s - en cooldown\n`);
                return;
            }

            if (confidence >= this.minConfidenceToSave) {
                console.log(`✅ CONFIANZA SUFICIENTE (${confidence}% >= ${this.minConfidenceToSave}%)`);
                console.log('💾 Guardando en base de datos...\n');

                await this.savePlateToDatabase({
                    plateText,
                    confidence,
                    occurrences,
                    totalFrames: this.framesPerAnalysis,
                    engine: bestResult.engine,
                    pattern: bestResult.pattern,
                    rawText: bestResult.rawText
                });

                this.stats.platesDetected++;
                this.lastDetectedPlates.set(plateText, now);

                console.log('╔═══════════════════════════════════════════════════════╗');
                console.log('║  ✅ PLACA GUARDADA EXITOSAMENTE EN BASE DE DATOS    ║');
                console.log('╚═══════════════════════════════════════════════════════╝\n');
            } else {
                console.log(`⚠️ CONFIANZA INSUFICIENTE (${confidence}% < ${this.minConfidenceToSave}%)`);
                console.log('❌ NO se guardará en base de datos\n');
            }

        } catch (error) {
            this.stats.errors++;
            console.error('❌ Error en análisis multi-frame:', error.message);
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Captura y analiza un solo frame
     */
    async captureAndAnalyzeSingleFrame() {
        let tempFramePath = null;
        let enhancedPath = null;

        try {
            const timestamp = Date.now();
            const uploadsDir = path.join(process.cwd(), 'uploads', 'frames');
            await fs.mkdir(uploadsDir, { recursive: true });
            
            tempFramePath = path.join(uploadsDir, `frame_${timestamp}.jpg`);

            console.log(`   � Capturando frame...`);
            await this.captureFrame(tempFramePath);

            const exists = await fs.access(tempFramePath).then(() => true).catch(() => false);
            if (!exists) {
                return { success: false };
            }

            this.stats.framesProcessed++;

            const fileStats = await fs.stat(tempFramePath);
            const fileSizeKB = Math.round(fileStats.size / 1024);
            console.log(`   📊 Tamaño: ${fileSizeKB} KB`);

            console.log('   🎨 Mejorando calidad...');
            enhancedPath = await imageEnhancement.enhanceForPlateOCR(tempFramePath);

            console.log('   🔍 Analizando con multi-OCR...');
            const result = await multiOcrService.detectPlateMultiEngine(enhancedPath);

            if (result.success && result.bestResult && result.bestResult.isValid) {
                return {
                    success: true,
                    plateText: result.bestResult.text.toUpperCase(),
                    confidence: result.bestResult.confidence,
                    engine: result.bestResult.engine,
                    pattern: result.bestResult.pattern,
                    rawText: result.bestResult.rawText,
                    score: result.bestResult.score
                };
            }

            return { success: false };

        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
            return { success: false };
        } finally {
            if (tempFramePath) {
                await fs.unlink(tempFramePath).catch(() => {});
            }
            if (enhancedPath && enhancedPath !== tempFramePath) {
                await fs.unlink(enhancedPath).catch(() => {});
            }
        }
    }

    consolidateResults(frameResults) {
        if (frameResults.length === 0) {
            return null;
        }

        // Contar ocurrencias de cada placa detectada
        const plateOccurrences = new Map();
        
        for (const result of frameResults) {
            const plate = result.plateText;
            
            if (!plateOccurrences.has(plate)) {
                plateOccurrences.set(plate, {
                    count: 0,
                    confidences: [],
                    results: []
                });
            }
            
            const data = plateOccurrences.get(plate);
            data.count++;
            data.confidences.push(result.confidence);
            data.results.push(result);
        }

        // Encontrar la placa más detectada
        let bestPlate = null;
        let maxOccurrences = 0;

        for (const [plate, data] of plateOccurrences.entries()) {
            if (data.count > maxOccurrences) {
                maxOccurrences = data.count;
                bestPlate = plate;
            }
        }

        if (!bestPlate) {
            return null;
        }

        const bestData = plateOccurrences.get(bestPlate);
        
        // Calcular confianza consolidada
        // - Promedio de confianzas + bonus por consistencia
        const avgConfidence = bestData.confidences.reduce((a, b) => a + b, 0) / bestData.confidences.length;
        const consistencyBonus = (bestData.count / this.framesPerAnalysis) * 20; // Hasta +20%
        const finalConfidence = Math.min(99, Math.round(avgConfidence + consistencyBonus));

        // Obtener el mejor resultado individual
        const bestResult = bestData.results.reduce((best, current) => 
            current.confidence > best.confidence ? current : best
        );

        return {
            plateText: bestPlate,
            confidence: finalConfidence,
            occurrences: bestData.count,
            bestResult,
            allResults: bestData.results
        };
    }

    async savePlateToDatabase(plateData) {
        try {
            const { PlateDetection } = require('../models');
            
            const detection = await PlateDetection.create({
                plate_text: plateData.plateText,
                confidence: plateData.confidence,
                image_path: null,
                device_ip: this.deviceIp,
                detection_timestamp: new Date(),
                status: 'pending',
                notes: `Multi-frame: ${plateData.occurrences}/${plateData.totalFrames} frames | Motor: ${plateData.engine} | Patrón: ${plateData.pattern} | Dispositivo: ${this.deviceIp || 'N/A'}`
            });

            console.log(`💾 Registro creado en BD con ID: ${detection.id}`);
            console.log(`📱 IP del dispositivo: ${this.deviceIp || 'N/A'}`);

            const trainingService = require('../services/training.service');
            await trainingService.logDetection({
                plateText: plateData.plateText,
                rawText: plateData.rawText,
                confidence: plateData.confidence,
                pattern: plateData.pattern,
                engine: plateData.engine,
                isValid: true,
                processingMethod: 'multi-frame-rtsp'
            });

            return detection;

        } catch (error) {
            console.error('❌ Error al guardar en BD:', error.message);
            throw error;
        }
    }

    captureFrame(outputPath) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Timeout al capturar frame'));
            }, 15000);

            console.log('   📷 Configurando captura de alta calidad...');

            ffmpeg(this.rtspUrl)
                .inputOptions([
                    '-rtsp_transport', 'tcp',      // Usar TCP (más estable)
                    '-rtsp_flags', 'prefer_tcp',   // Preferir TCP
                    '-allowed_media_types', 'video', // Solo video
                    '-buffer_size', '2048k',       // Buffer grande para mejor calidad
                    '-max_delay', '500000'         // Reducir delay
                ])
                .outputOptions([
                    '-vframes', '1',               // Solo 1 frame
                    '-q:v', '1',                   // Calidad MÁS ALTA (1 = mejor que 2)
                    '-vf', 'scale=1920:1080',     // Escalar a Full HD
                    '-pix_fmt', 'rgb24'            // Formato de píxeles RGB
                ])
                .output(outputPath)
                .on('start', (commandLine) => {
                    console.log('   🎬 Comando FFmpeg:', commandLine.substring(0, 100) + '...');
                })
                .on('end', () => {
                    console.log('   ✅ Frame capturado con éxito');
                    clearTimeout(timeout);
                    resolve();
                })
                .on('error', (err) => {
                    console.log('   ❌ Error en captura:', err.message);
                    clearTimeout(timeout);
                    reject(err);
                })
                .run();
        });
    }


    stop() {
        try {
            if (!this.isActive) {
                return {
                    success: false,
                    message: '⚠️ El monitoreo no está activo'
                };
            }

            console.log('\n⏹️  Deteniendo monitoreo RTSP...');

            this.isActive = false;
            
            if (this.captureInterval) {
                clearInterval(this.captureInterval);
                this.captureInterval = null;
            }

            const duration = Date.now() - this.stats.startTime.getTime();
            const durationMinutes = Math.round(duration / 60000);

            console.log('\n📊 Resumen de la sesión:');
            console.log(`   Duración: ${durationMinutes} minutos`);
            console.log(`   Frames procesados: ${this.stats.framesProcessed}`);
            console.log(`   Placas detectadas: ${this.stats.platesDetected}`);
            console.log(`   Errores: ${this.stats.errors}`);

            return {
                success: true,
                message: '✅ Monitoreo RTSP detenido',
                stats: {
                    ...this.stats,
                    durationMinutes
                }
            };

        } catch (error) {
            console.error('❌ Error al detener monitoreo:', error);
            return {
                success: false,
                message: 'Error al detener monitoreo',
                error: error.message
            };
        }
    }

    /**
     * Obtiene el estado actual del monitoreo
     */
    getStatus() {
        const recentPlates = Array.from(this.lastDetectedPlates.entries())
            .map(([plate, timestamp]) => ({
                plate,
                detectedAt: new Date(timestamp).toLocaleString(),
                secondsAgo: Math.round((Date.now() - timestamp) / 1000)
            }));

        return {
            isActive: this.isActive,
            isProcessing: this.isProcessing,
            rtspUrl: this.rtspUrl,
            cameraName: this.cameraName,
            deviceIp: this.deviceIp,
            fps: this.fps,
            captureInterval: Math.round(1 / this.fps),
            cooldownTime: this.cooldownTime / 1000,
            stats: {
                ...this.stats,
                uptime: this.stats.startTime ? 
                    Math.round((Date.now() - this.stats.startTime.getTime()) / 1000) : 0,
                recentPlates: recentPlates.slice(0, 10)
            }
        };
    }
}

module.exports = new RTSPMonitorService();
