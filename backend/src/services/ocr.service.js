const tesseract = require('node-tesseract-ocr');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

class OCRService {
    constructor() {
        this.config = {
            lang: 'eng',
            oem: 1,
            psm: 7,
            tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-'
        };

        this.configAlternative = {
            lang: 'eng',
            oem: 1,
            psm: 8,
            tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-'
        };
    }

    async preprocessImage(imageBuffer) {
        try {
            return await sharp(imageBuffer)
                .resize(3000, null, {
                    fit: 'inside',
                    withoutEnlargement: true,
                    kernel: sharp.kernel.lanczos3
                })
                .greyscale()
                .normalize()
                .linear(4.0, -(128 * 2.0))
                .sharpen({ sigma: 5, m1: 3.0, m2: 2.5 })
                .threshold(110)
                .png({ quality: 100, compressionLevel: 0 })
                .toBuffer();
        } catch (error) {
            console.error('❌ Error en preprocesamiento:', error);
            throw new Error('Error al procesar la imagen');
        }
    }

    async preprocessInverted(imageBuffer) {
        try {
            return await sharp(imageBuffer)
                .resize(3000, null, {
                    fit: 'inside',
                    withoutEnlargement: true,
                    kernel: sharp.kernel.lanczos3
                })
                .greyscale()
                .normalize()
                .negate()
                .linear(5.0, -(128 * 2.5))
                .sharpen({ sigma: 5, m1: 3.0, m2: 2.5 })
                .threshold(85)
                .png({ quality: 100, compressionLevel: 0 })
                .toBuffer();
        } catch (error) {
            console.error('❌ Error en preprocesamiento invertido:', error);
            throw error;
        }
    }

    isValidPlate(text) {
        if (!text || text.length < 3) {
            return { isValid: false, confidence: 0, pattern: 'none' };
        }

        const cleaned = text.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

        if (cleaned.length < 5 || cleaned.length > 10) {
            return { isValid: false, confidence: 0, pattern: 'invalid_length' };
        }

        const hasNumber = /\d/.test(cleaned);
        const hasLetter = /[A-Z]/.test(cleaned);

        if (!hasNumber || !hasLetter) {
            return { isValid: false, confidence: 0, pattern: 'missing_alphanumeric' };
        }

        const patterns = [
            { regex: /^[A-Z0-9]{3}-\d{3}$/, confidence: 98, name: 'peruvian_modern' },
            { regex: /^[A-Z]\d[A-Z]-\d{3}$/, confidence: 97, name: 'peruvian_classic' },
            { regex: /^[A-Z0-9]{3}\d{3}$/, confidence: 92, name: 'peruvian_no_dash' },
            { regex: /^[A-Z]{3}\d{4}$/, confidence: 95, name: 'mexican_standard' },
            { regex: /^[A-Z]{3}\d{3}$/, confidence: 88, name: 'mexican_old' },
            { regex: /^[A-Z]{3}\d{3,4}$/, confidence: 85, name: 'standard_variant' },
            { regex: /^[A-Z]{2,4}\d{2,4}$/, confidence: 80, name: 'mixed_pattern' },
            { regex: /^[A-Z\d]{5,10}$/, confidence: 65, name: 'generic' }
        ];

        for (const pattern of patterns) {
            if (pattern.regex.test(cleaned)) {
                return {
                    isValid: true,
                    confidence: pattern.confidence,
                    pattern: pattern.name,
                    plateText: cleaned
                };
            }
        }

        return {
            isValid: false,
            confidence: 50,
            pattern: 'unknown_format',
            plateText: cleaned
        };
    }

    cleanPlateText(text) {
        if (!text) return '';

        return text
            .trim()
            .toUpperCase()
            .replace(/\s+/g, '')
            .replace(/[^A-Z0-9-]/g, '');
    }

    async detectPlate(imagePath) {
        const tempFiles = [];

        try {
            const imageBuffer = await fs.readFile(imagePath);
            const attempts = [];

            try {
                const buffer1 = await this.preprocessImage(imageBuffer);
                const tempPath1 = imagePath.replace(/(\.[^.]+)$/, '_normal.png');
                await fs.writeFile(tempPath1, buffer1);
                tempFiles.push(tempPath1);

                const rawText1 = await tesseract.recognize(tempPath1, this.config);
                attempts.push({
                    rawText: rawText1.trim(),
                    cleanedText: this.cleanPlateText(rawText1),
                    method: 'PSM7_Normal'
                });
            } catch (e) {
                console.error('Intento 1 falló:', e.message);
            }

            try {
                const buffer2 = await this.preprocessInverted(imageBuffer);
                const tempPath2 = imagePath.replace(/(\.[^.]+)$/, '_inverted.png');
                await fs.writeFile(tempPath2, buffer2);
                tempFiles.push(tempPath2);

                const rawText2 = await tesseract.recognize(tempPath2, this.config);
                attempts.push({
                    rawText: rawText2.trim(),
                    cleanedText: this.cleanPlateText(rawText2),
                    method: 'PSM7_Inverted'
                });
            } catch (e) {
                console.error('Intento 2 falló:', e.message);
            }

            try {
                const buffer3 = await this.preprocessImage(imageBuffer);
                const tempPath3 = imagePath.replace(/(\.[^.]+)$/, '_psm6.png');
                await fs.writeFile(tempPath3, buffer3);
                tempFiles.push(tempPath3);

                const config3 = { ...this.config, psm: 6 };
                const rawText3 = await tesseract.recognize(tempPath3, config3);
                attempts.push({
                    rawText: rawText3.trim(),
                    cleanedText: this.cleanPlateText(rawText3),
                    method: 'PSM6_Normal'
                });
            } catch (e) {
                console.error('Intento 3 falló:', e.message);
            }

            try {
                const buffer4 = await this.preprocessInverted(imageBuffer);
                const tempPath4 = imagePath.replace(/(\.[^.]+)$/, '_psm11.png');
                await fs.writeFile(tempPath4, buffer4);
                tempFiles.push(tempPath4);

                const config4 = { ...this.config, psm: 11 };
                const rawText4 = await tesseract.recognize(tempPath4, config4);
                attempts.push({
                    rawText: rawText4.trim(),
                    cleanedText: this.cleanPlateText(rawText4),
                    method: 'PSM11_Inverted'
                });
            } catch (e) {
                console.error('Intento 4 falló:', e.message);
            }

            let bestResult = null;
            let bestScore = -1;

            for (const attempt of attempts) {
                const validation = this.isValidPlate(attempt.cleanedText);
                const score = validation.confidence + (attempt.cleanedText.length * 2);

                if (score > bestScore) {
                    bestScore = score;
                    bestResult = {
                        ...attempt,
                        validation
                    };
                }
            }

            if (!bestResult || !bestResult.cleanedText) {
                return {
                    success: false,
                    text: 'NO_DETECTADO',
                    rawText: '',
                    confidence: 0,
                    isValid: false,
                    pattern: 'none',
                    processingMethod: 'none',
                    timestamp: new Date()
                };
            }

            return {
                success: true,
                text: bestResult.validation.plateText || bestResult.cleanedText,
                rawText: bestResult.rawText,
                confidence: bestResult.validation.confidence,
                isValid: bestResult.validation.isValid && bestResult.validation.confidence >= 80,
                pattern: bestResult.validation.pattern,
                processingMethod: bestResult.method,
                timestamp: new Date()
            };

        } catch (error) {
            console.error('❌ Error en detección OCR:', error);
            return {
                success: false,
                text: 'ERROR',
                rawText: '',
                confidence: 0,
                isValid: false,
                error: error.message,
                timestamp: new Date()
            };
        } finally {
            for (const tempPath of tempFiles) {
                await fs.unlink(tempPath).catch(() => { });
            }
        }
    }

    async detectPlatesInBatch(imagePaths) {
        const results = [];

        for (const imagePath of imagePaths) {
            const result = await this.detectPlate(imagePath);
            results.push({
                imagePath,
                ...result
            });
        }

        return results;
    }
}

module.exports = new OCRService();
