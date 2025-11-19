const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

class ImageEnhancementService {
    async enhanceForOCR(inputPath) {
        try {
            console.log('   🎨 Mejorando calidad de imagen para OCR...');

            const outputPath = inputPath.replace(/(\.[^.]+)$/, '_enhanced$1');

            await sharp(inputPath)
                .resize(1920, 1080, {
                    fit: 'inside',
                    withoutEnlargement: false
                })
                .sharpen({
                    sigma: 1.5,
                    m1: 1.0,
                    m2: 2.0,
                    x1: 3,
                    y2: 20,
                    y3: 30
                })
                .normalise({
                    lower: 1,
                    upper: 99
                })
                .modulate({
                    brightness: 1.1,
                    saturation: 1.2,
                    hue: 0
                })
                .median(3)
                .jpeg({
                    quality: 100,
                    chromaSubsampling: '4:4:4'
                })
                .toFile(outputPath);

            const originalStats = await fs.stat(inputPath);
            const enhancedStats = await fs.stat(outputPath);
            
            console.log(`   📊 Original: ${Math.round(originalStats.size / 1024)} KB`);
            console.log(`   📊 Mejorada: ${Math.round(enhancedStats.size / 1024)} KB`);
            console.log(`   ✅ Imagen mejorada guardada`);

            return outputPath;

        } catch (error) {
            console.error('   ❌ Error al mejorar imagen:', error.message);
            return inputPath;
        }
    }

    async enhanceForPlateOCR(inputPath) {
        try {
            console.log('   🚗 Aplicando mejoras específicas para placas...');

            const outputPath = inputPath.replace(/(\.[^.]+)$/, '_plate_enhanced$1');

            const metadata = await sharp(inputPath).metadata();
            console.log(`   📐 Dimensiones originales: ${metadata.width}x${metadata.height}`);

            const isSmallImage = metadata.width < 800 || metadata.height < 600;
            
            let pipeline = sharp(inputPath);

            if (isSmallImage) {
                console.log('   ⚠️ Imagen pequeña detectada - aplicando upscaling');
                pipeline = pipeline.resize(1920, 1080, {
                    kernel: 'lanczos3',
                    fit: 'inside'
                });
            } else {
                pipeline = pipeline.resize(1920, 1080, {
                    fit: 'inside',
                    withoutEnlargement: true
                });
            }

            await pipeline
                .greyscale()
                .normalise({
                    lower: 5,
                    upper: 95
                })
                .linear(1.5, -50)
                .sharpen({
                    sigma: 2,
                    m1: 1.5,
                    m2: 3,
                    x1: 5,
                    y2: 25,
                    y3: 35
                })
                .median(2)
                .png({
                    quality: 100,
                    compressionLevel: 0,
                    palette: false
                })
                .toFile(outputPath);

            const enhancedStats = await fs.stat(outputPath);
            console.log(`   📊 Tamaño mejorado: ${Math.round(enhancedStats.size / 1024)} KB`);
            console.log(`   ✅ Imagen optimizada para placas guardada`);

            return outputPath;

        } catch (error) {
            console.error('   ❌ Error al mejorar imagen para placas:', error.message);
            return inputPath;
        }
    }

    async cleanupEnhanced(originalPath) {
        const enhancedPath = originalPath.replace(/(\.[^.]+)$/, '_enhanced$1');
        const plateEnhancedPath = originalPath.replace(/(\.[^.]+)$/, '_plate_enhanced$1');
        
        await fs.unlink(enhancedPath).catch(() => {});
        await fs.unlink(plateEnhancedPath).catch(() => {});
    }
}

module.exports = new ImageEnhancementService();
