// backend/src/services/adaptive-preprocessing.service.js
const sharp = require('sharp');
const fs = require('fs').promises;

class AdaptivePreprocessingService {
    async generateAdaptiveVersions(imagePath) {
        try {
            const imageBuffer = await fs.readFile(imagePath);

            const stats = await this.analyzeImageStats(imageBuffer);
            console.log('📊 Estadísticas de imagen:', stats);

            const versions = [];

            versions.push({
                name: 'threshold_low',
                buffer: await this.applyAdaptiveThreshold(imageBuffer, Math.round(stats.meanBrightness * 0.4)),
                description: 'Threshold bajo para texto claro'
            });

            versions.push({
                name: 'threshold_adaptive',
                buffer: await this.applyAdaptiveThreshold(imageBuffer, Math.round(stats.meanBrightness * 0.6)),
                description: 'Threshold adaptativo'
            });

            versions.push({
                name: 'threshold_high',
                buffer: await this.applyAdaptiveThreshold(imageBuffer, Math.round(stats.meanBrightness * 0.8)),
                description: 'Threshold alto para texto oscuro'
            });

            versions.push({
                name: 'inverted_low',
                buffer: await this.applyInvertedAdaptiveThreshold(imageBuffer, Math.round(stats.meanBrightness * 0.3)),
                description: 'Invertido + threshold bajo'
            });

            versions.push({
                name: 'normalized_extreme',
                buffer: await this.applyExtremeNormalization(imageBuffer),
                description: 'Normalización extrema'
            });

            console.log(`✅ Generadas ${versions.length} versiones adaptativas`);
            return versions;

        } catch (error) {
            console.error('❌ Error en preprocesamiento adaptativo:', error);
            throw error;
        }
    }

    async analyzeImageStats(imageBuffer) {
        const { data, info } = await sharp(imageBuffer)
            .greyscale()
            .raw()
            .toBuffer({ resolveWithObject: true });

        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            sum += data[i];
        }
        const meanBrightness = sum / data.length;

        let min = 255, max = 0;
        for (let i = 0; i < data.length; i++) {
            if (data[i] < min) min = data[i];
            if (data[i] > max) max = data[i];
        }
        const range = max - min;
        const contrast = range / 255;

        return {
            meanBrightness: Math.round(meanBrightness),
            contrast: Math.round(contrast * 100),
            min,
            max,
            range
        };
    }

    async applyAdaptiveThreshold(imageBuffer, thresholdLevel) {
        return await sharp(imageBuffer)
            .resize(3000, null, {
                fit: 'inside',
                withoutEnlargement: true,
                kernel: sharp.kernel.lanczos3
            })
            .greyscale()
            .normalize() // Normalizar primero para maximizar contraste
            .linear(4.0, -(128 * 2.0)) // Aumentar contraste agresivamente
            .sharpen({ sigma: 5, m1: 3.0, m2: 2.5 })
            .threshold(thresholdLevel) // Threshold adaptativo
            .png({ quality: 100, compressionLevel: 0 })
            .toBuffer();
    }

    /**
     * Aplica threshold con inversión (para texto gris claro)
     */
    async applyInvertedAdaptiveThreshold(imageBuffer, thresholdLevel) {
        return await sharp(imageBuffer)
            .resize(3000, null, {
                fit: 'inside',
                withoutEnlargement: true,
                kernel: sharp.kernel.lanczos3
            })
            .greyscale()
            .normalize()
            .negate() // Invertir colores
            .linear(5.0, -(128 * 2.5)) // Contraste extremo después de invertir
            .sharpen({ sigma: 5, m1: 3.0, m2: 2.5 })
            .threshold(thresholdLevel)
            .png({ quality: 100, compressionLevel: 0 })
            .toBuffer();
    }

    /**
     * Normalización extrema para casos muy difíciles
     */
    async applyExtremeNormalization(imageBuffer) {
        return await sharp(imageBuffer)
            .resize(3500, null, {
                fit: 'inside',
                withoutEnlargement: true,
                kernel: sharp.kernel.lanczos3
            })
            .greyscale()
            .normalize() // Primera normalización
            .linear(6.0, -(128 * 3.0)) // Contraste EXTREMO
            .normalize() // Segunda normalización
            .sharpen({ sigma: 6, m1: 4.0, m2: 3.0 })
            .threshold(120)
            .png({ quality: 100, compressionLevel: 0 })
            .toBuffer();
    }
}

module.exports = new AdaptivePreprocessingService();
