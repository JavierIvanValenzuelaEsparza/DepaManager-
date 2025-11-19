// backend/src/services/plate-pattern-extractor.service.js
const fs = require('fs').promises;

class PlatePatternExtractorService {
    constructor() {
        // Patrones de placas de Perú (ordenados por especificidad)
        this.platePatterns = [
            // Perú moderno: XXX-XXX (3 alfanuméricos - 3 dígitos) ej: X7I-962, ABC-123
            { regex: /([A-Z0-9]{3}-\d{3})/gi, country: 'Peru (moderno)', confidence: 98 },

            // Perú clásico: A1A-123 (letra-dígito-letra-guion-3 dígitos)
            { regex: /([A-Z]\d[A-Z]-\d{3})/gi, country: 'Peru (clásico)', confidence: 97 },

            // Perú sin guión: XXX123 o A1A123 (por si OCR omitió el guion)
            { regex: /([A-Z0-9]{3}\d{3})/gi, country: 'Peru (sin guion)', confidence: 92 },

            // Genérico con guión: ABC-123, AB-1234 (variantes con guión)
            { regex: /([A-Z]{2,3}-\d{3,4})/gi, country: 'Peru (genérico)', confidence: 85 },

            // Patrón alfanumérico: 6-8 caracteres mezclados (último recurso)
            { regex: /([A-Z0-9]{6,8})/gi, country: 'Peru (alfanumérico)', confidence: 65 }
        ];
    }

    /**
     * Extrae placas del texto usando regex patterns
     * @param {string} rawText - Texto crudo del OCR
     * @returns {Array} - Array de placas encontradas con metadata
     */
    extractPlatesFromText(rawText) {
        if (!rawText) return [];

        const found = [];

        // Limpiar texto: eliminar caracteres no válidos pero PRESERVAR guiones y espacios
        let cleanedText = rawText.toUpperCase().replace(/[^A-Z0-9-\s\n]/g, '');

        // Eliminar saltos de línea y espacios múltiples, reemplazar con espacio simple
        cleanedText = cleanedText.replace(/[\n\r]+/g, ' ').replace(/\s+/g, ' ').trim();

        console.log(`🔍 Texto original: "${rawText}"`);
        console.log(`🔍 Texto limpiado: "${cleanedText}"`);

        // También crear versión sin espacios para buscar placas que el OCR separó
        const noSpaces = cleanedText.replace(/\s+/g, '');
        console.log(`🔍 Sin espacios: "${noSpaces}"`);

        // Buscar en ambas versiones del texto
        const textVersions = [
            { text: cleanedText, label: 'con espacios' },
            { text: noSpaces, label: 'sin espacios' }
        ];

        for (const version of textVersions) {
            // Probar cada patrón
            for (const pattern of this.platePatterns) {
                const matches = version.text.matchAll(pattern.regex);

                for (const match of matches) {
                    const plateText = match[1];

                    // Validar que tenga al menos letras Y números
                    const hasLetters = /[A-Z]/.test(plateText);
                    const hasNumbers = /\d/.test(plateText);

                    if (hasLetters && hasNumbers && plateText.length >= 5) {
                        found.push({
                            text: plateText,
                            pattern: pattern.country,
                            confidence: pattern.confidence,
                            position: match.index,
                            source: version.label
                        });

                        console.log(`  ✅ Encontrado (${version.label}): "${plateText}" (${pattern.country}, ${pattern.confidence}%)`);
                    }
                }
            }
        }

        // Eliminar duplicados y ordenar por confianza
        const unique = this.removeDuplicates(found);
        unique.sort((a, b) => b.confidence - a.confidence);

        return unique;
    }

    /**
     * Elimina duplicados (la misma placa puede coincidir con múltiples patrones)
     */
    removeDuplicates(plates) {
        const seen = new Set();
        return plates.filter(plate => {
            if (seen.has(plate.text)) return false;
            seen.add(plate.text);
            return true;
        });
    }

    /**
     * Extrae placas de múltiples fuentes de texto
     * @param {Array} textSources - Array de {text, source}
     * @returns {Object} - Mejor placa encontrada
     */
    findBestPlate(textSources) {
        const allPlates = [];

        for (const source of textSources) {
            const plates = this.extractPlatesFromText(source.text);

            plates.forEach(plate => {
                allPlates.push({
                    ...plate,
                    source: source.source,
                    sourceConfidence: source.confidence || 100
                });
            });
        }

        if (allPlates.length === 0) {
            return null;
        }

        // Calcular score combinado
        allPlates.forEach(plate => {
            plate.finalScore = (plate.confidence * 0.7) + (plate.sourceConfidence * 0.3);
        });

        // Ordenar por score final
        allPlates.sort((a, b) => b.finalScore - a.finalScore);

        return {
            bestPlate: allPlates[0],
            allMatches: allPlates.slice(0, 5) // Top 5
        };
    }
}

module.exports = new PlatePatternExtractorService();
