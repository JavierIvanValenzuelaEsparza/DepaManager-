// backend/src/services/tesseractjs.service.js
const { createWorker } = require('tesseract.js');
const fs = require('fs').promises;

class TesseractJSService {
    constructor() {
        this.worker = null;
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            console.log('🔧 Inicializando Tesseract.js worker...');

            this.worker = await createWorker('eng', 1, {
                corePath: require('tesseract.js-core').wasmPath,
            });

            await this.worker.setParameters({
                tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-',
                tessedit_pageseg_mode: '7' // Single text line
            });

            this.isInitialized = true;
            console.log('✅ Tesseract.js inicializado');
        } catch (error) {
            console.error('❌ Error inicializando Tesseract.js:', error);
            this.isInitialized = false;
            throw error;
        }
    }

    async detectPlate(imagePath) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            console.log('📸 Tesseract.js: Procesando imagen...');

            const sharp = require('sharp');
            const imageBuffer = await fs.readFile(imagePath);

            const pngBuffer = await sharp(imageBuffer)
                .png()
                .toBuffer();

            const { data } = await this.worker.recognize(pngBuffer);

            console.log('📝 Tesseract.js raw:', data.text);

            const cleanedText = this.cleanPlateText(data.text);

            const avgConfidence = data.words && data.words.length > 0
                ? data.words.reduce((sum, word) => sum + word.confidence, 0) / data.words.length
                : data.confidence || 0;

            const validation = this.isValidPlate(cleanedText);

            console.log(`✅ Tesseract.js: "${cleanedText}" (${Math.round(avgConfidence)}%)`);

            return {
                success: true,
                engine: 'tesseract.js',
                text: validation.plateText || cleanedText,
                rawText: data.text.trim(),
                confidence: Math.round(avgConfidence),
                isValid: validation.isValid,
                pattern: validation.pattern,
                timestamp: new Date()
            };

        } catch (error) {
            console.error('❌ Error en Tesseract.js:', error);
            return {
                success: false,
                engine: 'tesseract.js',
                text: 'ERROR',
                rawText: '',
                confidence: 0,
                isValid: false,
                error: error.message,
                timestamp: new Date()
            };
        }
    }

    /**
     * Limpia el texto detectado
     */
    cleanPlateText(text) {
        if (!text) return '';
        return text
            .trim()
            .toUpperCase()
            .replace(/\s+/g, '')
            .replace(/[^A-Z0-9-]/g, '');
    }

    /**
     * Valida si el texto parece una placa
     */
    isValidPlate(text) {
        if (!text || text.length < 5) {
            return { isValid: false, confidence: 0, pattern: 'none' };
        }

        const hasNumber = /\d/.test(text);
        const hasLetter = /[A-Z]/.test(text);

        if (!hasNumber || !hasLetter) {
            return { isValid: false, confidence: 0, pattern: 'missing_alphanumeric' };
        }

        // Patrón peruano: A1A-123
        if (/^[A-Z]\d[A-Z]-?\d{3}$/.test(text)) {
            return {
                isValid: true,
                confidence: 95,
                pattern: 'peruvian_standard',
                plateText: text
            };
        }

        // Patrón genérico
        if (/^[A-Z\d]{5,10}$/.test(text)) {
            return {
                isValid: true,
                confidence: 70,
                pattern: 'generic',
                plateText: text
            };
        }

        return {
            isValid: false,
            confidence: 50,
            pattern: 'unknown',
            plateText: text
        };
    }

    async terminate() {
        if (this.worker) {
            await this.worker.terminate();
            this.isInitialized = false;
            console.log('🛑 Tesseract.js worker terminado');
        }
    }
}

module.exports = new TesseractJSService();
