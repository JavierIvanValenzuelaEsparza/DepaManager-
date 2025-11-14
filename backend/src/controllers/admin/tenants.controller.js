// backend/src/controllers/admin/tenants.controller.js
const { User, Department, Contract, Payment, Building, sequelize } = require('../../models');//                                                         ✅ AGREGAR Building
const { Op } = require('sequelize');

/**
 * ✅ OBTENER TODOS LOS INQUILINOS
 * Devuelve la lista de inquilinos con información de sus contratos y departamentos
 */
const getTenants = async (req, res) => {
  try {
    console.log('🔍 Obteniendo inquilinos para admin:', req.user.idUsuario);
    
    const adminId = req.user.idUsuario;

    // Obtener inquilinos activos con sus departamentos y contratos
    const tenants = await User.findAll({
      where: { 
        rol: 'Inquilino',
        estado: 'Activo'
      },
      attributes: [
        'idUsuario',
        'nombreCompleto',
        'correo',
        'telefono',
        'dni',
        'fechaNacimiento',
        'fechaInicioContrato',
        'fechaFinContrato',
        'plan',
        'estado'
      ],
      include: [
        {
          model: Department,
          as: 'departamentosInquilino', // ✅ AGREGAR 'as'
          include: [
            {
              model: Building,
              as: 'edificio', // ✅ AGREGAR 'as'
              where: { idAdministrador: adminId },
              attributes: ['idEdificio', 'nombre', 'direccion']
            }
          ]
        },
        {
          model: Contract,
          as: 'contratos', // ✅ AGREGAR 'as'
          where: { estado: 'Activo' },
          required: false,
          include: [
            {
              model: Department,
              as: 'departamento', // ✅ AGREGAR 'as'
              attributes: ['numero', 'piso']
            }
          ]
        }
      ],
      order: [['nombreCompleto', 'ASC']]
    })

    // Procesar datos para respuesta
    const processedTenants = tenants.map(tenant => {
      const departamento = tenant.departamentosInquilino?.[0] || null;
      const contrato = tenant.contratos?.[0] || null;

      return {
        idUsuario: tenant.idUsuario,
        nombreCompleto: tenant.nombreCompleto,
        correo: tenant.correo,
        telefono: tenant.telefono,
        dni: tenant.dni,
        fechaNacimiento: tenant.fechaNacimiento,
        fechaInicioContrato: tenant.fechaInicioContrato,
        fechaFinContrato: tenant.fechaFinContrato,
        plan: tenant.plan,
        estado: tenant.estado,
        departamento: departamento ? {
          numero: departamento.numero,
          piso: departamento.piso,
          edificio: departamento.edificio?.nombre
        } : null,
        contrato: contrato ? {
          idContrato: contrato.idContrato,
          fechaInicio: contrato.fechaInicio,
          fechaFin: contrato.fechaFin,
          montoMensual: contrato.montoMensual
        } : null
      };
    });

    console.log(`✅ Obtenidos ${processedTenants.length} inquilinos`);
    
    res.json({
      success: true,
      data: processedTenants
    });

  } catch (error) {
    console.error('❌ Error obteniendo inquilinos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener inquilinos',
      error: error.message
    });
  }
};

/**
 * ✅ CREAR NUEVO INQUILINO
 * Crea un nuevo usuario con rol de inquilino
 */
const createTenant = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('👤 Creando nuevo inquilino para admin:', req.user.idUsuario);
    
    const adminId = req.user.idUsuario;
    const {
      nombreCompleto,
      correo,
      contrasenia,
      telefono,
      dni,
      fechaNacimiento,
      idDepartamento,
      fechaInicioContrato,
      fechaFinContrato,
      montoMensual
    } = req.body;

    // Validaciones básicas
    if (!nombreCompleto || !correo || !contrasenia) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Nombre, correo y contraseña son requeridos'
      });
    }

    // Verificar si el correo ya existe
    const usuarioExistente = await User.findOne({
      where: { correo },
      transaction
    });

    if (usuarioExistente) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'El correo ya está registrado'
      });
    }

    // Crear el usuario inquilino
    const nuevoInquilino = await User.create({
      nombreCompleto: nombreCompleto.trim(),
      correo: correo.trim(),
      contrasenia: contrasenia,
      rol: 'Inquilino',
      telefono: telefono || null,
      dni: dni || null,
      fechaNacimiento: fechaNacimiento || null,
      fechaInicioContrato: fechaInicioContrato || null,
      fechaFinContrato: fechaFinContrato || null,
      estado: 'Activo',
      plan: 'Gratuito'
    }, { transaction });

    // Si se proporcionó un departamento, asignarlo
    if (idDepartamento) {
      console.log('🔍 Verificando departamento ID:', idDepartamento);
      
      // ✅ CORRECCIÓN: Agregar alias 'as' en el include
      const departamento = await Department.findOne({
        include: [
          {
            model: Building,
            as: 'edificio', // ✅ AGREGAR ESTA LÍNEA
            where: { idAdministrador: adminId }
          }
        ],
        where: { idDepartamento },
        transaction
      });

      if (departamento) {
        console.log('✅ Departamento encontrado:', departamento.numero);
        
        // Actualizar el departamento con el inquilino
        await Department.update(
          { 
            idInquilino: nuevoInquilino.idUsuario,
            estado: 'Ocupado'
          },
          { 
            where: { idDepartamento },
            transaction 
          }
        );

        // Crear contrato si se proporcionaron fechas y monto
        if (fechaInicioContrato && fechaFinContrato && montoMensual) {
          await Contract.create({
            idInquilino: nuevoInquilino.idUsuario,
            idDepartamento: idDepartamento,
            fechaInicio: fechaInicioContrato,
            fechaFin: fechaFinContrato,
            montoMensual: montoMensual,
            estado: 'Activo'
          }, { transaction });
          
          console.log('✅ Contrato creado para el inquilino');
        }
      } else {
        console.log('⚠️ Departamento no encontrado o no pertenece al admin');
      }
    }

    await transaction.commit();

    console.log('✅ Inquilino creado exitosamente:', nuevoInquilino.nombreCompleto);

    // Omitir contraseña en la respuesta
    const { contrasenia: _, ...inquilinoSinPassword } = nuevoInquilino.toJSON();

    res.status(201).json({
      success: true,
      message: 'Inquilino creado exitosamente',
      data: inquilinoSinPassword
    });

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error creando inquilino:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear inquilino',
      error: error.message
    });
  }
};

/**
 * ✅ ACTUALIZAR INQUILINO EXISTENTE
 * Actualiza la información de un inquilino específico
 */
const updateTenant = async (req, res) => {
  try {
    console.log('✏️ Actualizando inquilino ID:', req.params.id);
    
    const adminId = req.user.idUsuario;
    const tenantId = req.params.id;
    const {
      nombreCompleto,
      telefono,
      dni,
      fechaNacimiento,
      estado,
      plan,
      idDepartamento
    } = req.body;

    // Verificar que el inquilino existe
    const inquilino = await User.findOne({
      where: { 
        idUsuario: tenantId,
        rol: 'Inquilino'
      }
    });

    if (!inquilino) {
      return res.status(404).json({
        success: false,
        message: 'Inquilino no encontrado'
      });
    }

    // Actualizar el inquilino
    await User.update(
      {
        nombreCompleto: nombreCompleto || inquilino.nombreCompleto,
        telefono: telefono || inquilino.telefono,
        dni: dni || inquilino.dni,
        fechaNacimiento: fechaNacimiento || inquilino.fechaNacimiento,
        estado: estado || inquilino.estado,
        plan: plan || inquilino.plan
      },
      {
        where: { idUsuario: tenantId }
      }
    );

    // Si se envió un nuevo departamento, actualizar la asignación
    if (idDepartamento !== undefined) {
      // Liberar el departamento anterior (si existe)
      await Department.update(
        { idInquilino: null },
        { where: { idInquilino: tenantId } }
      );

      // Asignar el nuevo departamento (si no está vacío)
      if (idDepartamento && idDepartamento !== '') {
        // Verificar que el departamento pertenece al admin
        const departamento = await Department.findOne({
          where: { idDepartamento },
          include: [{
            model: Building,
            as: 'edificio',
            where: { idAdministrador: adminId }
          }]
        });

        if (!departamento) {
          return res.status(400).json({
            success: false,
            message: 'Departamento no válido'
          });
        }

        // Asignar el nuevo departamento
        await Department.update(
          { idInquilino: tenantId },
          { where: { idDepartamento } }
        );

        // 🆕 AUTO-CREAR CONTRATO cuando se asigna un departamento
        // Verificar si ya existe un contrato activo para este inquilino y departamento
        const contratoExistente = await Contract.findOne({
          where: {
            idInquilino: tenantId,
            idDepartamento: idDepartamento,
            estado: 'Activo'
          }
        });

        // Solo crear contrato si no existe uno activo para este departamento
        if (!contratoExistente) {
          console.log('📝 Creando contrato automático para inquilino:', tenantId);
          
          // Obtener datos completos del inquilino para usar sus fechas y plan
          const inquilinoCompleto = await User.findByPk(tenantId);
          
          // Calcular fechas desde los datos del inquilino o usar fechas por defecto
          let fechaInicio = inquilinoCompleto.fechaInicioContrato || new Date();
          let fechaFin = inquilinoCompleto.fechaFinContrato;
          
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
          
          if (inquilinoCompleto.plan === 'Premium') {
            montoMensual = 1000;
            depositoGarantia = 1000;
          } else if (inquilinoCompleto.plan === 'Estándar') {
            montoMensual = 700;
            depositoGarantia = 700;
          } else {
            // Plan Gratuito o sin plan definido
            montoMensual = 500;
            depositoGarantia = 500;
          }

          await Contract.create({
            idInquilino: tenantId,
            idDepartamento: idDepartamento,
            fechaInicio: fechaInicio,
            fechaFin: fechaFin,
            montoMensual: montoMensual,
            depositoGarantia: depositoGarantia,
            duracionMeses: duracionMeses,
            estado: 'Activo',
            archivoPdf: null
          });

          console.log(`✅ Contrato automático creado: ${duracionMeses} meses, S/ ${montoMensual}/mes`);
        } else {
          console.log('ℹ️ Ya existe un contrato activo para este inquilino y departamento');
        }
      }
    }

    // Obtener el inquilino actualizado con departamento
    const inquilinoActualizado = await User.findByPk(tenantId, {
      attributes: { exclude: ['contrasenia'] }
    });

    // Obtener el departamento actualizado
    const departamento = await Department.findOne({
      where: { idInquilino: tenantId },
      include: [{
        model: Building,
        as: 'edificio',
        attributes: ['idEdificio', 'nombre', 'direccion']
      }]
    });

    inquilinoActualizado.dataValues.departamento = departamento;

    console.log('✅ Inquilino actualizado:', inquilinoActualizado.nombreCompleto);

    res.json({
      success: true,
      message: 'Inquilino actualizado exitosamente',
      data: inquilinoActualizado
    });

  } catch (error) {
    console.error('❌ Error actualizando inquilino:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar inquilino',
      error: error.message
    });
  }
};

/**
 * ✅ OBTENER DETALLES DE UN INQUILINO
 * Devuelve información detallada de un inquilino específico
 */
const getTenantDetails = async (req, res) => {
  try {
    console.log('🔍 Obteniendo detalles del inquilino ID:', req.params.id);
    
    const adminId = req.user.idUsuario;
    const tenantId = req.params.id;

    // Buscar inquilino sin includes complejos primero
    const inquilino = await User.findOne({
      where: { 
        idUsuario: tenantId,
        rol: 'Inquilino'
      },
      attributes: { exclude: ['contrasenia'] }
    });

    if (!inquilino) {
      console.log('❌ Inquilino no encontrado con ID:', tenantId);
      return res.status(404).json({
        success: false,
        message: 'Inquilino no encontrado'
      });
    }

    console.log('✅ Inquilino encontrado:', inquilino.nombreCompleto);

    // Cargar contratos
    let contratos = [];
    try {
      contratos = await Contract.findAll({
        where: { idInquilino: tenantId },
        include: [
          {
            model: Department,
            as: 'departamento',
            attributes: ['idDepartamento', 'numero', 'piso', 'metrosCuadrados']
          }
        ]
      });
      console.log('📄 Contratos encontrados:', contratos.length);
    } catch (contractError) {
      console.log('⚠️ Error cargando contratos:', contractError.message);
    }

    // Cargar pagos
    let pagos = [];
    try {
      pagos = await Payment.findAll({
        where: { idInquilino: tenantId },
        order: [['fechaVencimiento', 'DESC']],
        limit: 10
      });
      console.log('💰 Pagos encontrados:', pagos.length);
    } catch (paymentError) {
      console.log('⚠️ Error cargando pagos:', paymentError.message);
    }

    // Cargar departamento
    let department = null;
    try {
      department = await Department.findOne({
        where: { idInquilino: tenantId },
        include: [{
          model: Building,
          as: 'edificio',
          required: false,
          attributes: ['idEdificio', 'nombre', 'direccion']
        }],
        attributes: ['idDepartamento', 'numero', 'piso', 'metrosCuadrados']
      });
      console.log('🏠 Departamento encontrado:', department ? 'Sí' : 'No');
    } catch (deptError) {
      console.log('⚠️ Error cargando departamento:', deptError.message);
    }
    
    // Construir respuesta
    const responseData = {
      ...inquilino.toJSON(),
      contratos: contratos,
      pagos: pagos,
      departamento: department
    };

    console.log('✅ Detalles del inquilino preparados');

    res.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('❌ Error obteniendo detalles del inquilino:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener detalles del inquilino',
      error: error.message
    });
  }
};

/**
 * ✅ CAMBIAR ESTADO DE INQUILINO
 * Activa o desactiva un inquilino
 */
const updateTenantStatus = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('🔄 Cambiando estado del inquilino ID:', req.params.id);
    
    const adminId = req.user.idUsuario;
    const tenantId = req.params.id;
    const { estado } = req.body;

    if (!estado || !['Activo', 'Pendiente', 'Retirado'].includes(estado)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Estado inválido. Use: Activo, Pendiente o Retirado'
      });
    }

    // Verificar que el inquilino existe
    const inquilino = await User.findOne({
      where: { 
        idUsuario: tenantId,
        rol: 'Inquilino'
      },
      transaction
    });

    if (!inquilino) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Inquilino no encontrado'
      });
    }

    // Si se retira al inquilino, liberar sus departamentos
    if (estado === 'Retirado') {
      await Department.update(
        { 
          idInquilino: null,
          estado: 'Disponible'
        },
        { 
          where: { idInquilino: tenantId },
          transaction 
        }
      );

      // Finalizar contratos activos
      await Contract.update(
        { estado: 'Finalizado' },
        { 
          where: { 
            idInquilino: tenantId,
            estado: 'Activo'
          },
          transaction 
        }
      );
    }

    // Actualizar estado del inquilino
    await User.update(
      { estado },
      { 
        where: { idUsuario: tenantId },
        transaction 
      }
    );

    await transaction.commit();

    console.log(`✅ Estado del inquilino actualizado a: ${estado}`);

    res.json({
      success: true,
      message: `Estado del inquilino actualizado a ${estado}`
    });

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error actualizando estado del inquilino:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado del inquilino',
      error: error.message
    });
  }
};

// ✅ ELIMINAR INQUILINO
const deleteTenant = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('🗑️ Eliminando inquilino ID:', req.params.id);
    
    const adminId = req.user.idUsuario;
    const tenantId = req.params.id;

    // Verificar que el inquilino existe
    const inquilino = await User.findOne({
      where: { 
        idUsuario: tenantId,
        rol: 'Inquilino'
      },
      transaction
    });

    if (!inquilino) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Inquilino no encontrado'
      });
    }

    // Verificar que no tenga departamentos asignados
    const departamentosAsignados = await Department.count({
      where: { idInquilino: tenantId },
      transaction
    });

    if (departamentosAsignados > 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar un inquilino con departamentos asignados'
      });
    }

    // Verificar que no tenga contratos activos
    const contratosActivos = await Contract.count({
      where: { 
        idInquilino: tenantId,
        estado: 'Activo'
      },
      transaction
    });

    if (contratosActivos > 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar un inquilino con contratos activos'
      });
    }

    // Eliminar el inquilino
    await User.destroy({
      where: { idUsuario: tenantId },
      transaction
    });

    await transaction.commit();

    console.log('✅ Inquilino eliminado:', inquilino.nombreCompleto);

    res.json({
      success: true,
      message: 'Inquilino eliminado exitosamente'
    });

  } catch (error) {
    await transaction.rollback(); // ✅ AGREGAR rollback AQUÍ TAMBIÉN
    console.error('❌ Error eliminando inquilino:', error); // ✅ CORREGIR mensaje de error
    res.status(500).json({
      success: false,
      message: 'Error al eliminar inquilino',
      error: error.message
    });
  }
};

// ✅ EXPORTAR TODAS LAS FUNCIONES DEL CONTROLADOR
module.exports = {
  getTenants,
  createTenant,
  updateTenant,
  getTenantDetails,
  updateTenantStatus,
  deleteTenant
};