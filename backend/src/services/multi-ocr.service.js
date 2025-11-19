const tesseractJSService = require('./tesseractjs.service');
const tesseractService = require('./ocr.service');
const adaptiveService = require('./adaptive-preprocessing.service');
const patternExtractor = require('./plate-pattern-extractor.service');
const tesseract = require('node-tesseract-ocr');
const fs = require('fs').promises;

class MultiOCRService {
    async detectPlateMultiEngine(imagePath) {
        try {
            console.log('\n═══════════════════════════════════════════════');
            console.log('🚀 MULTI-OCR ENGINE INICIADO');
            console.log('═══════════════════════════════════════════════');
            console.log(`📁 Imagen: ${imagePath}`);

            console.log('\n🎨 Generando versiones adaptativas...');
            const adaptiveVersions = await adaptiveService.generateAdaptiveVersions(imagePath);
            console.log(`✅ ${adaptiveVersions.length} versiones adaptativas generadas`);

            const allTextSources = [];

            console.log('\n🔧 Procesando cada versión adaptativa con Tesseract...');
            for (const version of adaptiveVersions) {
                const tempPath = imagePath.replace(/(\.[^.]+)$/, `_${version.name}.png`);

                try {
                    await fs.writeFile(tempPath, version.buffer);

                    const config = {
                        lang: 'eng',
                        oem: 1,
                        psm: 6,
                        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-'
                    };

                    console.log(`  🔍 Analizando: ${version.name}...`);
                    const rawText = await tesseract.recognize(tempPath, config);

                    if (rawText && rawText.trim()) {
                        allTextSources.push({
                            text: rawText,
                            source: `adaptive-${version.name}`,
                            confidence: 80
                        });

                        console.log(`  ✅ ${version.name}: "${rawText.trim()}"`);
                    } else {
                        console.log(`  ⚠️ ${version.name}: sin resultado`);
                    }

                    await fs.unlink(tempPath).catch(() => { });
                } catch (e) {
                    console.log(`  ❌ ${version.name}: Error -> ${e.message}`);
                }
            }

            console.log('\n🚀 Ejecutando motores OCR originales...');
            const results = await Promise.allSettled([
                this.runWithTimeout(
                    tesseractJSService.detectPlate(imagePath),
                    10000,
                    'tesseract.js'
                ),
                this.runWithTimeout(
                    tesseractService.detectPlate(imagePath),
                    10000,
                    'node-tesseract'
                )
            ]);

            const validResults = results
                .filter(r => r.status === 'fulfilled' && r.value.success)
                .map(r => r.value);

            console.log(`✅ ${validResults.length} motores originales respondieron`);

            for (const result of validResults) {
                if (result.rawText) {
                    allTextSources.push({
                        text: result.rawText,
                        source: result.engine,
                        confidence: result.confidence
                    });
                    console.log(`  ✅ ${result.engine}: "${result.rawText}" (${result.confidence}%)`);
                }
            }

            console.log(`\n📊 Total de fuentes de texto recolectadas: ${allTextSources.length}`);
            console.log(`🔍 Extrayendo patrones de placas...`);

            const patternResult = patternExtractor.findBestPlate(allTextSources);

            if (patternResult?.bestPlate) {
                const best = patternResult.bestPlate;

                console.log(`\n🎯 ═══════════════════════════════════════`);
                console.log(`   ✅ PLACA ENCONTRADA POR PATRÓN`);
                console.log(`   ═══════════════════════════════════════`);
                console.log(`   📋 Texto: "${best.text}"`);
                console.log(`   🔢 Patrón: ${best.pattern}`);
                console.log(`   💯 Score: ${best.finalScore.toFixed(2)}`);
                console.log(`   📍 Fuente: ${best.source}`);
                console.log(`   ═══════════════════════════════════════\n`);

                return {
                    success: true,
                    bestResult: {
                        engine: `pattern-extractor`,
                        text: best.text,
                        rawText: best.text,
                        confidence: Math.round(best.finalScore),
                        isValid: true,
                        pattern: best.pattern,
                        score: best.finalScore,
                        extractionMethod: 'regex'
                    },
                    allResults: patternResult.allMatches.map(p => ({
                        engine: `pattern (${p.source})`,
                        text: p.text,
                        confidence: Math.round(p.finalScore),
                        score: p.finalScore,
                        pattern: p.pattern
                    })),
                    timestamp: new Date()
                };
            }

            console.log('\n⚠️ ═══════════════════════════════════════');
            console.log('   NO SE ENCONTRÓ PATRÓN DE PLACA');
            console.log('   Usando detección tradicional...');
            console.log('   ═══════════════════════════════════════\n');

            if (validResults.length === 0) {
                console.log('❌ Ningún motor pudo detectar texto\n');
                return {
                    success: false,
                    bestResult: null,
                    allResults: [],
                    message: 'Ningún motor pudo detectar texto'
                };
            }

            const scoredResults = validResults.map(result => ({
                ...result,
                score: this.calculateScore(result),
                isValid: this.isValidPlate(result.text)
            }));

            scoredResults.sort((a, b) => b.score - a.score);
            const best = scoredResults[0];

            console.log(`🏆 Mejor resultado (sin patrón): ${best.engine}`);
            console.log(`   Texto: "${best.text}"`);
            console.log(`   Score: ${best.score.toFixed(2)}`);
            console.log(`   Confianza: ${best.confidence}%\n`);

            return {
                success: true,
                bestResult: {
                    engine: best.engine,
                    text: best.text,
                    rawText: best.rawText,
                    confidence: best.confidence,
                    isValid: best.isValid,
                    pattern: best.pattern || 'unknown',
                    score: best.score
                },
                allResults: scoredResults.slice(0, 10).map(r => ({
                    engine: r.engine,
                    text: r.text,
                    confidence: r.confidence,
                    score: r.score,
                    pattern: r.pattern || 'unknown'
                })),
                timestamp: new Date()
            };

        } catch (error) {
            console.error('❌ Error en multi-OCR:', error);
            return {
                success: false,
                bestResult: null,
                allResults: [],
                error: error.message
            };
        }
    }

    calculateScore(result) {
        let score = 0;

        score += (result.confidence / 100) * 50;

        const patternScores = {
            'peruvian_standard': 30,
            'mexican_standard': 30,
            'mexican_old': 25,
            'standard_variant': 20,
            'mixed_pattern': 15,
            'generic': 10,
            'unknown': 5,
            'missing_alphanumeric': 0,
            'none': 0
        };
        score += patternScores[result.pattern] || 0;

        const textLength = result.text ? result.text.length : 0;
        if (textLength >= 6 && textLength <= 10) {
            score += 15;
        } else if (textLength >= 5) {
            score += 10;
        } else if (textLength >= 3) {
            score += 5;
        }

        const engineReliability = {
            'tesseract.js': 4.5,
            'node-tesseract': 4.0,
            'google-vision': 5.0
        };
        score += engineReliability[result.engine] || 3;

        return score;
    }

    async runWithTimeout(promise, timeout, engineName) {
        return Promise.race([
            promise,
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error(`Timeout en ${engineName}`)), timeout)
            )
        ]);
    }

    cleanPlateText(text) {
        if (!text) return '';
        return text
            .trim()
            .toUpperCase()
            .replace(/\s+/g, '')
            .replace(/[^A-Z0-9-]/g, '');
    }

    estimateConfidence(text) {
        if (!text || text.length < 3) return 0;

        let confidence = 60;

        if (/[A-Z]/.test(text) && /\d/.test(text)) confidence += 20;

        if (text.length >= 6 && text.length <= 8) confidence += 20;

        return Math.min(confidence, 99);
    }

    isValidPlate(text) {
        if (!text || text.length < 5 || text.length > 10) return false;

        const hasNumber = /\d/.test(text);
        const hasLetter = /[A-Z]/.test(text);

        return hasNumber && hasLetter;
    }
}

module.exports = new MultiOCRService();
