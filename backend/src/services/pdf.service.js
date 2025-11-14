// backend/src/services/pdf.service.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Genera un contrato de arrendamiento profesional en formato PDF
 * @param {Object} contractData - Datos del contrato con inquilino y departamento
 * @param {String} outputPath - Ruta donde se guardará el PDF
 * @returns {Promise} Promesa que se resuelve cuando el PDF está completo
 */
exports.generateContractPDF = (contractData, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      // Crear documento PDF
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      // Crear stream de escritura
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // === ENCABEZADO ===
      doc.fontSize(20)
        .font('Helvetica-Bold')
        .text('CONTRATO DE ARRENDAMIENTO', { align: 'center' })
        .moveDown(0.5);

      doc.fontSize(10)
        .font('Helvetica')
        .text(`Contrato N° ${contractData.idContrato}`, { align: 'center' })
        .moveDown(2);

      // === SECCIÓN 1: PARTES DEL CONTRATO ===
      doc.fontSize(12)
        .font('Helvetica-Bold')
        .text('I. IDENTIFICACIÓN DE LAS PARTES', { underline: true })
        .moveDown(0.5);

      doc.fontSize(10)
        .font('Helvetica-Bold')
        .text('EL ARRENDADOR:', { continued: false })
        .font('Helvetica')
        .text(`Edificio: ${contractData.edificio.nombre}`)
        .text(`Dirección: ${contractData.edificio.direccion}`)
        .moveDown(0.5);

      doc.font('Helvetica-Bold')
        .text('EL ARRENDATARIO (INQUILINO):', { continued: false })
        .font('Helvetica')
        .text(`Nombre Completo: ${contractData.inquilino.nombreCompleto}`)
        .text(`DNI: ${contractData.inquilino.dni}`)
        .text(`Teléfono: ${contractData.inquilino.telefono}`)
        .text(`Correo Electrónico: ${contractData.inquilino.correo}`)
        .moveDown(2);

      // === SECCIÓN 2: OBJETO DEL CONTRATO ===
      doc.fontSize(12)
        .font('Helvetica-Bold')
        .text('II. OBJETO DEL CONTRATO', { underline: true })
        .moveDown(0.5);

      doc.fontSize(10)
        .font('Helvetica')
        .text('El ARRENDADOR entrega en arrendamiento al ARRENDATARIO el siguiente inmueble:')
        .moveDown(0.3);

      doc.font('Helvetica-Bold')
        .text(`Departamento: ${contractData.departamento.numero}`)
        .font('Helvetica')
        .text(`Piso: ${contractData.departamento.piso}`)
        .text(`Metros Cuadrados: ${contractData.departamento.metrosCuadrados} m²`)
        .text(`Habitaciones: ${contractData.departamento.habitaciones}`)
        .text(`Baños: ${contractData.departamento.banios}`)
        .text(`Ubicación: ${contractData.edificio.direccion}`)
        .moveDown(2);

      // === SECCIÓN 3: DURACIÓN Y VIGENCIA ===
      doc.fontSize(12)
        .font('Helvetica-Bold')
        .text('III. DURACIÓN Y VIGENCIA', { underline: true })
        .moveDown(0.5);

      // Formatear fechas sin problemas de zona horaria
      const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        // Compensar zona horaria para mostrar la fecha correcta
        const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
        return adjustedDate.toLocaleDateString('es-ES');
      };

      const fechaInicio = formatDate(contractData.fechaInicio);
      const fechaFin = formatDate(contractData.fechaFin);

      doc.fontSize(10)
        .font('Helvetica')
        .text(`Fecha de Inicio: ${fechaInicio}`)
        .text(`Fecha de Finalización: ${fechaFin}`)
        .text(`Duración: ${contractData.duracionMeses} meses`)
        .moveDown(2);

      // === SECCIÓN 4: CONDICIONES ECONÓMICAS ===
      doc.fontSize(12)
        .font('Helvetica-Bold')
        .text('IV. CONDICIONES ECONÓMICAS', { underline: true })
        .moveDown(0.5);

      doc.fontSize(10)
        .font('Helvetica')
        .text(`Renta Mensual: S/ ${parseFloat(contractData.montoMensual).toFixed(2)}`)
        .text(`Depósito en Garantía: S/ ${parseFloat(contractData.depositoGarantia).toFixed(2)}`)
        .text('Forma de Pago: Mensual, adelantado, durante los primeros 5 días de cada mes.')
        .moveDown(2);

      // === SECCIÓN 5: OBLIGACIONES DEL ARRENDATARIO ===
      doc.fontSize(12)
        .font('Helvetica-Bold')
        .text('V. OBLIGACIONES DEL ARRENDATARIO', { underline: true })
        .moveDown(0.5);

      doc.fontSize(10)
        .font('Helvetica')
        .list([
          'Pagar puntualmente la renta mensual acordada.',
          'Usar el inmueble exclusivamente para fines habitacionales.',
          'Mantener el departamento en buen estado de conservación.',
          'Realizar reparaciones menores por daños causados por su uso.',
          'No realizar modificaciones estructurales sin autorización escrita.',
          'Cumplir con las normas de convivencia del edificio.',
          'Pagar los servicios públicos (luz, agua, gas, internet).',
          'Notificar inmediatamente cualquier daño o desperfecto en el inmueble.'
        ], { bulletRadius: 2 })
        .moveDown(1.5);

      // === SECCIÓN 6: OBLIGACIONES DEL ARRENDADOR ===
      doc.fontSize(12)
        .font('Helvetica-Bold')
        .text('VI. OBLIGACIONES DEL ARRENDADOR', { underline: true })
        .moveDown(0.5);

      doc.fontSize(10)
        .font('Helvetica')
        .list([
          'Entregar el inmueble en condiciones habitables y seguras.',
          'Realizar reparaciones mayores y de estructura del inmueble.',
          'Garantizar el uso pacífico del inmueble durante la vigencia del contrato.',
          'Respetar la privacidad del arrendatario.',
          'Devolver el depósito en garantía al término del contrato, previa verificación.'
        ], { bulletRadius: 2 })
        .moveDown(1.5);

      // === SECCIÓN 7: TERMINACIÓN DEL CONTRATO ===
      doc.fontSize(12)
        .font('Helvetica-Bold')
        .text('VII. TERMINACIÓN DEL CONTRATO', { underline: true })
        .moveDown(0.5);

      doc.fontSize(10)
        .font('Helvetica')
        .text('El presente contrato podrá darse por terminado en los siguientes casos:')
        .moveDown(0.3)
        .list([
          'Por vencimiento del plazo establecido.',
          'Por acuerdo mutuo entre las partes.',
          'Por incumplimiento de cualquiera de las obligaciones establecidas.',
          'Por falta de pago de dos (2) rentas mensuales consecutivas.',
          'Por uso inadecuado o deterioro grave del inmueble.'
        ], { bulletRadius: 2 })
        .moveDown(1.5);

      // === SECCIÓN 8: DISPOSICIONES FINALES ===
      doc.fontSize(12)
        .font('Helvetica-Bold')
        .text('VIII. DISPOSICIONES FINALES', { underline: true })
        .moveDown(0.5);

      doc.fontSize(10)
        .font('Helvetica')
        .text('Las partes declaran haber leído y comprendido todas las cláusulas del presente contrato, manifestando su conformidad mediante la suscripción del mismo.')
        .moveDown(0.5)
        .text('Cualquier modificación al presente contrato deberá realizarse por escrito y ser firmada por ambas partes.')
        .moveDown(3);

      // === FIRMAS ===
      doc.fontSize(10)
        .font('Helvetica')
        .text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, { align: 'center' })
        .moveDown(3);

      const firmaPosY = doc.y;
      
      // Firma Arrendador (izquierda)
      doc.text('_________________________', 100, firmaPosY)
        .text('ARRENDADOR', 120, firmaPosY + 20, { width: 150 })
        .text(`${contractData.edificio.nombre}`, 100, firmaPosY + 35, { width: 180, align: 'center' });

      // Firma Arrendatario (derecha)
      doc.text('_________________________', 350, firmaPosY)
        .text('ARRENDATARIO', 365, firmaPosY + 20, { width: 150 })
        .text(`${contractData.inquilino.nombreCompleto}`, 340, firmaPosY + 35, { width: 180, align: 'center' });

      // === PIE DE PÁGINA ===
      doc.fontSize(8)
        .font('Helvetica')
        .text(
          'Este documento es un contrato de arrendamiento legalmente vinculante. Se recomienda que ambas partes conserven una copia firmada.',
          50,
          doc.page.height - 80,
          { align: 'center', width: doc.page.width - 100 }
        );

      // Finalizar documento
      doc.end();

      // Resolver promesa cuando el stream termine
      stream.on('finish', () => {
        console.log('✅ PDF generado exitosamente:', outputPath);
        resolve(outputPath);
      });

      stream.on('error', (error) => {
        console.error('❌ Error al escribir PDF:', error);
        reject(error);
      });

    } catch (error) {
      console.error('❌ Error al generar PDF:', error);
      reject(error);
    }
  });
};

/**
 * Obtiene el directorio donde se guardan los contratos
 * @returns {String} Ruta del directorio de contratos
 */
exports.getContractsDirectory = () => {
  const uploadsDir = path.join(__dirname, '../../uploads');
  const contractsDir = path.join(uploadsDir, 'contratos');
  
  // Crear directorios si no existen
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }
  
  return contractsDir;
};

/**
 * Genera el nombre del archivo PDF para un contrato
 * @param {Number} contractId - ID del contrato
 * @param {String} tenantDni - DNI del inquilino
 * @returns {String} Nombre del archivo
 */
exports.generateContractFilename = (contractId, tenantDni) => {
  const timestamp = Date.now();
  return `contrato_${contractId}_${tenantDni}_${timestamp}.pdf`;
};
