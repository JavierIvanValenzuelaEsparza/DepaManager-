const db = require('../../models');
const Contract = db.Contract;
const User = db.User;
const Department = db.Department;
const Building = db.Building;
const pdfService = require('../../services/pdf.service');
const path = require('path');
const fs = require('fs');

// Obtener todos los contratos
exports.getAllContracts = async (req, res) => {
  try {
    console.log('📑 Obteniendo todos los contratos...');
    
    // Construir filtro por inquilino si viene en query params
    const whereClause = {};
    if (req.query.inquilino) {
      whereClause.idInquilino = req.query.inquilino;
      console.log(`🔍 Filtrando por inquilino: ${req.query.inquilino}`);
    }
    
    const contracts = await Contract.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'inquilino',
          attributes: ['idUsuario', 'nombreCompleto', 'correo', 'telefono', 'dni']
        },
        {
          model: Department,
          as: 'departamento',
          attributes: ['idDepartamento', 'numero', 'piso', 'metrosCuadrados', 'habitaciones', 'banios'],
          include: [{
            model: Building,
            as: 'edificio',
            attributes: ['idEdificio', 'nombre', 'direccion']
          }]
        }
      ],
      order: [['fecha_creacion', 'DESC']]
    });
    
    console.log(`✅ Encontrados ${contracts.length} contratos`);
    console.log('📋 Datos de contratos:', JSON.stringify(contracts, null, 2));
    
    res.json({
      success: true,
      data: contracts
    });
  } catch (error) {
    console.error('❌ Error al obtener contratos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener contratos',
      error: error.message
    });
  }
};

// Obtener contrato por ID
exports.getContractById = async (req, res) => {
  try {
    const contract = await Contract.findOne({
      where: { idContrato: req.params.id },
      include: [
        {
          model: User,
          as: 'inquilino',
          attributes: ['idUsuario', 'nombreCompleto', 'correo', 'telefono', 'dni', 'fechaNacimiento']
        },
        {
          model: Department,
          as: 'departamento',
          attributes: ['idDepartamento', 'numero', 'piso', 'metrosCuadrados', 'habitaciones', 'banios'],
          include: [{
            model: Building,
            as: 'edificio',
            attributes: ['idEdificio', 'nombre', 'direccion']
          }]
        }
      ]
    });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contrato no encontrado'
      });
    }

    res.json({
      success: true,
      data: contract
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener contrato',
      error: error.message
    });
  }
};

// Crear nuevo contrato
exports.createContract = async (req, res) => {
  try {
    const {
      id_inquilino,
      id_departamento,
      fecha_inicio,
      fecha_fin,
      monto_mensual,
      deposito_garantia,
      duracion_meses
    } = req.body;

    console.log('➕ Creando nuevo contrato:', req.body);

    // Verificar que el inquilino y departamento existen
    const inquilino = await User.findOne({
      where: { 
        idUsuario: id_inquilino,
        rol: 'Inquilino'
      }
    });
    
    const departamento = await Department.findByPk(id_departamento);

    if (!inquilino) {
      return res.status(404).json({
        success: false,
        message: 'Inquilino no encontrado o no tiene rol de inquilino'
      });
    }

    if (!departamento) {
      return res.status(404).json({
        success: false,
        message: 'Departamento no encontrado'
      });
    }

    // Verificar si el departamento ya está ocupado
    if (departamento.estado === 'Ocupado') {
      return res.status(400).json({
        success: false,
        message: 'El departamento ya está ocupado'
      });
    }

    const newContract = await Contract.create({
      idInquilino: id_inquilino,
      idDepartamento: id_departamento,
      fechaInicio: fecha_inicio,
      fechaFin: fecha_fin,
      montoMensual: monto_mensual,
      depositoGarantia: deposito_garantia || 0,
      duracionMeses: duracion_meses,
      estado: 'Activo'
    });

    // Actualizar estado del departamento a "Ocupado" y asignar inquilino
    await departamento.update({ 
      estado: 'Ocupado', 
      idInquilino: id_inquilino 
    });

    // Actualizar fechas de contrato en el usuario
    await inquilino.update({
      fechaInicioContrato: fecha_inicio,
      fechaFinContrato: fecha_fin
    });

    res.status(201).json({
      success: true,
      message: 'Contrato creado exitosamente',
      data: newContract
    });
  } catch (error) {
    console.error('❌ Error al crear contrato:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear contrato',
      error: error.message
    });
  }
};

// Actualizar contrato
exports.updateContract = async (req, res) => {
  try {
    const {
      fecha_inicio,
      fecha_fin,
      monto_mensual,
      deposito_garantia,
      duracion_meses,
      estado
    } = req.body;

    console.log('✏️ Actualizando contrato:', req.params.id);
    console.log('📅 Datos recibidos:', { fecha_inicio, fecha_fin, monto_mensual, deposito_garantia, duracion_meses, estado });

    const contract = await Contract.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'inquilino'
        }
      ]
    });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contrato no encontrado'
      });
    }

    await contract.update({
      fechaInicio: fecha_inicio,
      fechaFin: fecha_fin,
      montoMensual: monto_mensual,
      depositoGarantia: deposito_garantia,
      duracionMeses: duracion_meses,
      estado,
      archivoPdf: null // Invalidar el PDF actual para que se regenere
    });

    console.log('✅ Contrato actualizado - PDF invalidado');
    console.log('📅 Nuevas fechas:', { fechaInicio: contract.fechaInicio, fechaFin: contract.fechaFin });

    // Actualizar fechas de contrato en el usuario si el contrato está activo
    if (estado === 'Activo' && contract.inquilino) {
      await contract.inquilino.update({
        fechaInicioContrato: fecha_inicio,
        fechaFinContrato: fecha_fin
      });
    }

    // Recargar el contrato con todas las relaciones para devolverlo completo
    const updatedContract = await Contract.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'inquilino',
          attributes: ['idUsuario', 'nombreCompleto', 'correo', 'telefono', 'dni']
        },
        {
          model: Department,
          as: 'departamento',
          attributes: ['idDepartamento', 'numero', 'piso', 'metrosCuadrados', 'habitaciones', 'banios'],
          include: [{
            model: Building,
            as: 'edificio',
            attributes: ['idEdificio', 'nombre', 'direccion']
          }]
        }
      ]
    });

    res.json({
      success: true,
      message: 'Contrato actualizado exitosamente',
      data: updatedContract
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar contrato',
      error: error.message
    });
  }
};

// Eliminar contrato
exports.deleteContract = async (req, res) => {
  try {
    const contract = await Contract.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'inquilino'
        },
        {
          model: Department,
          as: 'departamento'
        }
      ]
    });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contrato no encontrado'
      });
    }

    // Liberar el departamento
    if (contract.departamento) {
      await contract.departamento.update({ 
        estado: 'Disponible', 
        idInquilino: null 
      });
    }

    // Limpiar fechas de contrato en el usuario
    if (contract.inquilino) {
      await contract.inquilino.update({
        fechaInicioContrato: null,
        fechaFinContrato: null
      });
    }

    await contract.destroy();

    res.json({
      success: true,
      message: 'Contrato eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar contrato',
      error: error.message
    });
  }
};

// Obtener contratos por inquilino
exports.getContractsByTenant = async (req, res) => {
  try {
    const contracts = await Contract.findAll({
      where: { idInquilino: req.params.id_inquilino },
      include: [
        {
          model: Department,
          as: 'departamento',
          attributes: ['idDepartamento', 'numero', 'piso'],
          include: [{
            model: Building,
            as: 'edificio',
            attributes: ['nombre', 'direccion']
          }]
        }
      ],
      order: [['fecha_creacion', 'DESC']]
    });

    res.json({
      success: true,
      data: contracts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener contratos del inquilino',
      error: error.message
    });
  }
};

// ==================== FUNCIONES DE ARCHIVOS (PLACEHOLDER) ====================

// Subir archivo PDF del contrato (placeholder)
exports.uploadContractFile = async (req, res) => {
  try {
    console.log('📤 Intentando subir archivo de contrato...');
    
    // Por ahora, solo simulamos la subida
    return res.status(200).json({
      success: true,
      message: 'Funcionalidad de subida de archivos en desarrollo',
      data: {
        archivo_pdf: 'documento-placeholder.pdf'
      }
    });
  } catch (error) {
    console.error('❌ Error en uploadContractFile:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir archivo',
      error: error.message
    });
  }
};

// Descargar archivo PDF del contrato
exports.downloadContractFile = async (req, res) => {
  try {
    console.log('📥 Descargando archivo de contrato:', req.params.id);
    
    const contract = await Contract.findByPk(req.params.id);
    
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contrato no encontrado'
      });
    }

    if (!contract.archivoPdf) {
      return res.status(404).json({
        success: false,
        message: 'El contrato no tiene archivo PDF generado'
      });
    }

    const contractsDir = pdfService.getContractsDirectory();
    const filePath = path.join(contractsDir, contract.archivoPdf);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Archivo PDF no encontrado en el servidor'
      });
    }

    // Descargar archivo
    res.download(filePath, contract.archivoPdf, (err) => {
      if (err) {
        console.error('Error al descargar archivo:', err);
        res.status(500).json({
          success: false,
          message: 'Error al descargar archivo'
        });
      }
    });
  } catch (error) {
    console.error('❌ Error en downloadContractFile:', error);
    res.status(500).json({
      success: false,
      message: 'Error al descargar archivo',
      error: error.message
    });
  }
};

// Generar PDF del contrato
exports.generateContractPDF = async (req, res) => {
  try {
    console.log('📄 Generando PDF para contrato:', req.params.id);
    
    const contractId = req.params.id;

    // Obtener contrato con todos sus datos relacionados
    const contract = await Contract.findByPk(contractId, {
      include: [
        {
          model: User,
          as: 'inquilino',
          attributes: ['idUsuario', 'nombreCompleto', 'correo', 'telefono', 'dni']
        },
        {
          model: Department,
          as: 'departamento',
          attributes: ['idDepartamento', 'numero', 'piso', 'metrosCuadrados', 'habitaciones', 'banios'],
          include: [{
            model: Building,
            as: 'edificio',
            attributes: ['idEdificio', 'nombre', 'direccion']
          }]
        }
      ]
    });

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: 'Contrato no encontrado'
      });
    }

    // Verificar que el contrato tiene todos los datos necesarios
    if (!contract.inquilino || !contract.departamento) {
      return res.status(400).json({
        success: false,
        message: 'El contrato no tiene inquilino o departamento asignado'
      });
    }

    // Preparar datos para el PDF
    const contractData = {
      idContrato: contract.idContrato,
      fechaInicio: contract.fechaInicio,
      fechaFin: contract.fechaFin,
      montoMensual: contract.montoMensual,
      depositoGarantia: contract.depositoGarantia,
      duracionMeses: contract.duracionMeses,
      inquilino: {
        nombreCompleto: contract.inquilino.nombreCompleto,
        dni: contract.inquilino.dni,
        telefono: contract.inquilino.telefono,
        correo: contract.inquilino.correo
      },
      departamento: {
        numero: contract.departamento.numero,
        piso: contract.departamento.piso,
        metrosCuadrados: contract.departamento.metrosCuadrados,
        habitaciones: contract.departamento.habitaciones,
        banios: contract.departamento.banios
      },
      edificio: {
        nombre: contract.departamento.edificio.nombre,
        direccion: contract.departamento.edificio.direccion
      }
    };

    // Generar nombre de archivo y ruta
    const contractsDir = pdfService.getContractsDirectory();
    const filename = pdfService.generateContractFilename(contractId, contract.inquilino.dni);
    const outputPath = path.join(contractsDir, filename);

    // Generar PDF
    await pdfService.generateContractPDF(contractData, outputPath);

    // Actualizar contrato con nombre del archivo
    await contract.update({ archivoPdf: filename });

    console.log('✅ PDF generado y guardado:', filename);

    res.json({
      success: true,
      message: 'PDF generado exitosamente',
      data: {
        filename: filename,
        contractId: contractId
      }
    });
  } catch (error) {
    console.error('❌ Error al generar PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar PDF del contrato',
      error: error.message
    });
  }
};

// Crear contratos para inquilinos existentes sin contrato
exports.createMissingContracts = async (req, res) => {
  try {
    console.log('🔄 Creando contratos faltantes para inquilinos existentes...');
    
    // Obtener todos los inquilinos con departamento asignado
    const departments = await Department.findAll({
      where: {
        idInquilino: { [require('sequelize').Op.ne]: null }
      },
      include: [{
        model: User,
        as: 'inquilino',
        where: { rol: 'Inquilino' }
      }]
    });

    console.log(`📋 Encontrados ${departments.length} departamentos con inquilinos`);

    const createdContracts = [];
    const skippedContracts = [];

    for (const department of departments) {
      // Verificar si ya existe contrato activo
      const existingContract = await Contract.findOne({
        where: {
          idInquilino: department.idInquilino,
          idDepartamento: department.idDepartamento,
          estado: 'Activo'
        }
      });

      if (existingContract) {
        skippedContracts.push({
          inquilino: department.inquilino.nombreCompleto,
          departamento: department.numero,
          razon: 'Ya tiene contrato activo'
        });
        continue;
      }

      // Obtener datos completos del inquilino
      const inquilino = department.inquilino;
      
      // Calcular fechas desde los datos del inquilino
      let fechaInicio = inquilino.fechaInicioContrato || new Date();
      let fechaFin = inquilino.fechaFinContrato;
      
      // Si no tiene fecha fin, calcular 12 meses desde la fecha de inicio
      if (!fechaFin) {
        fechaFin = new Date(fechaInicio);
        fechaFin.setFullYear(fechaFin.getFullYear() + 1);
      }
      
      // Calcular duración en meses
      const duracionMeses = Math.round((new Date(fechaFin) - new Date(fechaInicio)) / (1000 * 60 * 60 * 24 * 30));
      
      // Determinar monto mensual según el plan del inquilino
      let montoMensual = 0;
      let depositoGarantia = 0;
      
      if (inquilino.plan === 'Premium') {
        montoMensual = 1000;
        depositoGarantia = 1000;
      } else if (inquilino.plan === 'Estándar') {
        montoMensual = 700;
        depositoGarantia = 700;
      } else {
        // Plan Gratuito o sin plan definido
        montoMensual = 500;
        depositoGarantia = 500;
      }

      const newContract = await Contract.create({
        idInquilino: department.idInquilino,
        idDepartamento: department.idDepartamento,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        montoMensual: montoMensual,
        depositoGarantia: depositoGarantia,
        duracionMeses: duracionMeses,
        estado: 'Activo',
        archivoPdf: null
      });

      createdContracts.push({
        idContrato: newContract.idContrato,
        inquilino: department.inquilino.nombreCompleto,
        departamento: department.numero,
        plan: inquilino.plan,
        montoMensual: montoMensual,
        duracionMeses: duracionMeses
      });

      console.log(`✅ Contrato creado para ${department.inquilino.nombreCompleto} - Depto ${department.numero} - Plan ${inquilino.plan} - S/ ${montoMensual}/mes`);
    }

    res.json({
      success: true,
      message: `Proceso completado: ${createdContracts.length} contratos creados, ${skippedContracts.length} omitidos`,
      data: {
        created: createdContracts,
        skipped: skippedContracts,
        total: {
          created: createdContracts.length,
          skipped: skippedContracts.length
        }
      }
    });
  } catch (error) {
    console.error('❌ Error al crear contratos faltantes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear contratos faltantes',
      error: error.message
    });
  }
};