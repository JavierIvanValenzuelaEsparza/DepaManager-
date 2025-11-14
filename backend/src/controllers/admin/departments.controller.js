// backend/src/controllers/admin/departments.controller.js
const { Department, Building, User, sequelize } = require('../../models');

const createDepartmentsBatch = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { idEdificio, numeroPisos, desdeNumero, hastaNumero, departamentosPorPiso, departamentos } = req.body;
    const adminId = req.user.idUsuario;

    console.log('🔍 Datos recibidos para creación:', req.body);

    // Verificar que el edificio existe y pertenece al administrador
    const edificio = await Building.findOne({
      where: { 
        idEdificio: parseInt(idEdificio),
        idAdministrador: adminId 
      },
      transaction
    });

    if (!edificio) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Edificio no encontrado o no tienes permisos'
      });
    }

    let departamentosCreados = [];

    // Modo 1: Crear departamento individual (array de departamentos)
    if (departamentos && Array.isArray(departamentos)) {
      console.log('📝 Modo: Creación individual');
      
      for (const deptData of departamentos) {
        const departamentoData = {
          idEdificio: parseInt(idEdificio),
          numero: deptData.numero.toString(),
          piso: parseInt(deptData.piso),
          metrosCuadrados: parseFloat(deptData.metrosCuadrados) || null,
          habitaciones: parseInt(deptData.habitaciones) || 2,
          banios: parseInt(deptData.banios) || 1,
          estado: deptData.estado || 'Disponible',
          idInquilino: null
        };

        console.log(`🏠 Creando departamento: ${departamentoData.numero}`);

        const nuevoDepartamento = await Department.create(departamentoData, { transaction });
        departamentosCreados.push(nuevoDepartamento);
      }
    }
    // Modo 2: Crear en lote (parámetros numéricos)
    else if (numeroPisos && desdeNumero && hastaNumero && departamentosPorPiso) {
      console.log('📦 Modo: Creación en lote');

      const totalDepartamentos = parseInt(numeroPisos) * parseInt(departamentosPorPiso);
      const rangoNumeros = parseInt(hastaNumero) - parseInt(desdeNumero) + 1;

      if (totalDepartamentos !== rangoNumeros) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `El rango de números (${rangoNumeros}) no coincide con el total de departamentos (${totalDepartamentos})`
        });
      }

      let numeroActual = parseInt(desdeNumero);

      for (let piso = 1; piso <= numeroPisos; piso++) {
        for (let deptPorPiso = 1; deptPorPiso <= departamentosPorPiso; deptPorPiso++) {
          if (numeroActual > hastaNumero) break;

          const departamentoData = {
            idEdificio: parseInt(idEdificio),
            numero: numeroActual.toString(),
            piso: piso,
            metrosCuadrados: 60.00,
            habitaciones: 2,
            banios: 1,
            estado: 'Disponible',
            idInquilino: null
          };

          console.log(`🏠 Creando departamento: ${departamentoData.numero} - Piso ${piso}`);

          const nuevoDepartamento = await Department.create(departamentoData, { transaction });
          departamentosCreados.push(nuevoDepartamento);

          numeroActual++;
        }
      }
    } else {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Datos insuficientes. Proporciona "departamentos" o los parámetros de lote.'
      });
    }

    // Actualizar contador en el edificio
    const nuevoTotal = (edificio.totalDepartamentos || 0) + departamentosCreados.length;
    await Building.update(
      { totalDepartamentos: nuevoTotal },
      { 
        where: { idEdificio: parseInt(idEdificio) },
        transaction 
      }
    );

    await transaction.commit();

    console.log(`✅ Creados ${departamentosCreados.length} departamentos para el edificio ${edificio.nombre}`);

    res.json({
      success: true,
      message: `Se crearon ${departamentosCreados.length} departamentos exitosamente`,
      data: departamentosCreados
    });

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error creando departamentos en lote:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al crear departamentos',
      error: error.message
    });
  }
};

// Obtener todos los departamentos
const getDepartments = async (req, res) => {
  try {
    console.log('=== 🔍 GET DEPARTMENTS REQUEST ==='); // ✅ LOG AGREGADO
    console.log('🔍 Admin ID:', req.user?.idUsuario); // ✅ LOG AGREGADO
    
    const adminId = req.user.idUsuario;

    // Primero obtener los edificios del administrador
    const edificiosAdmin = await Building.findAll({
      where: { idAdministrador: adminId },
      attributes: ['idEdificio']
    });

    console.log('🏢 Edificios del admin:', edificiosAdmin.length); // ✅ LOG AGREGADO

    const idsEdificios = edificiosAdmin.map(ed => ed.idEdificio);

    if (idsEdificios.length === 0) {
      console.log('⚠️  No hay edificios para este admin'); // ✅ LOG AGREGADO
      return res.json({
        success: true,
        data: []
      });
    }

    console.log('🔍 Buscando departamentos en edificios:', idsEdificios); // ✅ LOG AGREGADO

    // ✅ CORRECCIÓN: Usar alias 'edificio' en el include
    const departments = await Department.findAll({
      where: {
        idEdificio: idsEdificios
      },
      include: [
        {
          model: Building,
          as: 'edificio', // ✅ AGREGAR ALIAS
          attributes: ['idEdificio', 'nombre', 'direccion']
        },
        {
          model: User,
          as: 'inquilino',
          attributes: ['idUsuario', 'nombreCompleto', 'correo'],
          required: false // ✅ LEFT JOIN para incluir deptos sin inquilino
        }
      ],
      order: [['idEdificio', 'ASC'], ['piso', 'ASC'], ['numero', 'ASC']]
    });

    console.log('📦 Departamentos encontrados:', departments.length); // ✅ LOG AGREGADO

    res.json({
      success: true,
      data: departments
    });

  } catch (error) {
    console.error('❌ Error obteniendo departamentos:', error);
    console.error('❌ Stack:', error.stack); // ✅ LOG MEJORADO
    res.status(500).json({
      success: false,
      message: 'Error al obtener departamentos: ' + error.message
    });
  }
};

// Obtener edificios
const getBuildings = async (req, res) => {
  try {
    console.log('=== 🔍 GET BUILDINGS REQUEST (departments controller) ==='); // ✅ LOG AGREGADO
    console.log('🔍 Admin ID:', req.user?.idUsuario); // ✅ LOG AGREGADO
    
    const adminId = req.user.idUsuario;

    const buildings = await Building.findAll({
      where: { idAdministrador: adminId },
      attributes: ['idEdificio', 'nombre', 'direccion', 'totalDepartamentos'],
      order: [['nombre', 'ASC']]
    });

    console.log('🏢 Edificios encontrados:', buildings.length); // ✅ LOG AGREGADO
    console.log('📤 Datos edificios:', JSON.stringify(buildings, null, 2)); // ✅ LOG AGREGADO

    res.json({
      success: true,
      data: buildings
    });

  } catch (error) {
    console.error('❌ Error obteniendo edificios:', error);
    console.error('❌ Stack:', error.stack); // ✅ LOG MEJORADO
    res.status(500).json({
      success: false,
      message: 'Error al obtener edificios: ' + error.message
    });
  }
};

// ✅ AGREGAR FUNCIÓN PARA CREAR EDIFICIO SI NO EXISTE
const createDefaultBuilding = async (req, res) => {
  try {
    const adminId = req.user.idUsuario;
    console.log('🏗️ Solicitando creación de edificio por defecto para admin:', adminId);

    // Verificar si ya tiene edificios
    const existingBuildings = await Building.count({
      where: { idAdministrador: adminId }
    });

    if (existingBuildings > 0) {
      console.log('ℹ️  El administrador ya tiene edificios:', existingBuildings);
      return res.json({
        success: true,
        message: 'Ya tienes edificios registrados',
        data: null
      });
    }

    // Crear edificio por defecto
    const defaultBuilding = await Building.create({
      idAdministrador: adminId,
      nombre: 'Mi Edificio Principal',
      direccion: 'Actualiza la dirección en configuración',
      totalDepartamentos: 0
    });

    console.log('✅ Edificio por defecto creado:', defaultBuilding.nombre);

    res.json({
      success: true,
      message: 'Edificio por defecto creado exitosamente',
      data: defaultBuilding
    });

  } catch (error) {
    console.error('❌ Error creando edificio por defecto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear edificio por defecto',
      error: error.message
    });
  }
};


// ✅ ACTUALIZAR DEPARTAMENTO INDIVIDUAL
const updateDepartment = async (req, res) => {
  try {
    console.log('✏️ Actualizando departamento ID:', req.params.id);
    
    const adminId = req.user.idUsuario;
    const departmentId = req.params.id;
    const { numero, piso, metrosCuadrados, habitaciones, banios, estado, idInquilino } = req.body;

    // Verificar que el departamento existe y pertenece al admin
    const department = await Department.findOne({
      include: [{
        model: Building,
        where: { idAdministrador: adminId }
      }],
      where: { idDepartamento: departmentId }
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Departamento no encontrado'
      });
    }

    // Actualizar el departamento
    await Department.update(
      {
        numero: numero || department.numero,
        piso: piso || department.piso,
        metrosCuadrados: metrosCuadrados || department.metrosCuadrados,
        habitaciones: habitaciones || department.habitaciones,
        banios: banios || department.banios,
        estado: estado || department.estado,
        idInquilino: idInquilino !== undefined ? idInquilino : department.idInquilino
      },
      {
        where: { idDepartamento: departmentId }
      }
    );

    // Obtener el departamento actualizado
    const updatedDepartment = await Department.findByPk(departmentId, {
      include: [
        {
          model: Building,
          as: 'edificio',
          attributes: ['idEdificio', 'nombre', 'direccion']
        },
        {
          model: User,
          as: 'inquilino',
          attributes: ['idUsuario', 'nombreCompleto', 'correo']
        }
      ]
    });

    console.log('✅ Departamento actualizado:', updatedDepartment.numero);

    res.json({
      success: true,
      message: 'Departamento actualizado exitosamente',
      data: updatedDepartment
    });

  } catch (error) {
    console.error('❌ Error actualizando departamento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar departamento',
      error: error.message
    });
  }
};

// ✅ ELIMINAR DEPARTAMENTO
const deleteDepartment = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('🗑️ Eliminando departamento ID:', req.params.id);
    
    const adminId = req.user.idUsuario;
    const departmentId = req.params.id;

    // Verificar que el departamento existe y pertenece al admin
    const department = await Department.findOne({
      include: [{
        model: Building,
        where: { idAdministrador: adminId }
      }],
      where: { idDepartamento: departmentId },
      transaction
    });

    if (!department) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Departamento no encontrado'
      });
    }

    // Verificar que no esté ocupado
    if (department.estado === 'Ocupado') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar un departamento ocupado'
      });
    }

    // Eliminar el departamento
    await Department.destroy({
      where: { idDepartamento: departmentId },
      transaction
    });

    // Actualizar contador en el edificio
    await Building.decrement('totalDepartamentos', {
      by: 1,
      where: { idEdificio: department.idEdificio },
      transaction
    });

    await transaction.commit();

    console.log('✅ Departamento eliminado:', department.numero);

    res.json({
      success: true,
      message: 'Departamento eliminado exitosamente'
    });

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error eliminando departamento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar departamento',
      error: error.message
    });
  }
};

// ✅ OBTENER DETALLES DE DEPARTAMENTO
const getDepartmentDetails = async (req, res) => {
  try {
    console.log('🔍 Obteniendo detalles del departamento ID:', req.params.id);
    
    const adminId = req.user.idUsuario;
    const departmentId = req.params.id;

    const department = await Department.findOne({
      include: [
        {
          model: Building,
          as: 'edificio',
          where: { idAdministrador: adminId },
          attributes: ['idEdificio', 'nombre', 'direccion']
        },
        {
          model: User,
          as: 'inquilino',
          attributes: ['idUsuario', 'nombreCompleto', 'correo', 'telefono', 'dni']
        }
      ],
      where: { idDepartamento: departmentId }
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Departamento no encontrado'
      });
    }

    console.log('✅ Detalles del departamento obtenidos:', department.numero);

    res.json({
      success: true,
      data: department
    });

  } catch (error) {
    console.error('❌ Error obteniendo detalles del departamento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener detalles del departamento',
      error: error.message
    });
  }
};

// ✅ OBTENER DEPARTAMENTOS DISPONIBLES
const getAvailableDepartments = async (req, res) => {
  try {
    console.log('🔍 [DEPARTMENTS] Obteniendo departamentos disponibles para admin:', req.user.idUsuario);
    
    const adminId = req.user.idUsuario;

    // 1. Primero obtener los edificios del administrador
    console.log('🔍 [DEPARTMENTS] Buscando edificios del admin...');
    const edificiosAdmin = await Building.findAll({
      where: { idAdministrador: adminId },
      attributes: ['idEdificio', 'nombre', 'direccion']
    });

    console.log(`🏢 [DEPARTMENTS] Edificios del admin encontrados: ${edificiosAdmin.length}`);
    
    if (edificiosAdmin.length === 0) {
      console.log('⚠️ [DEPARTMENTS] No hay edificios para este admin');
      return res.json({
        success: true,
        data: []
      });
    }

    const idsEdificios = edificiosAdmin.map(ed => ed.idEdificio);
    console.log('🔍 [DEPARTMENTS] IDs de edificios:', idsEdificios);

    // 2. Buscar departamentos disponibles
    console.log('🔍 [DEPARTMENTS] Buscando departamentos disponibles...');
    
    // Primero probar con include
    let departments;
    try {
      console.log('🔍 [DEPARTMENTS] Probando consulta con INCLUDE...');
      departments = await Department.findAll({
        where: {
          estado: 'Disponible',
          idInquilino: null,
          idEdificio: idsEdificios
        },
        include: [
          {
            model: Building,
            as: 'edificio',
            attributes: ['idEdificio', 'nombre', 'direccion']
          }
        ],
        attributes: [
          'idDepartamento',
          'numero',
          'piso',
          'metrosCuadrados',
          'habitaciones',
          'banios',
          'estado'
        ],
        order: [
          ['piso', 'ASC'],
          ['numero', 'ASC']
        ]
      });
      console.log(`✅ [DEPARTMENTS] Consulta con INCLUDE exitosa: ${departments.length} departamentos`);
    } catch (includeError) {
      console.error('❌ [DEPARTMENTS] Error con INCLUDE, usando consulta alternativa:', includeError.message);
      
      // Consulta alternativa sin include
      departments = await Department.findAll({
        where: {
          estado: 'Disponible',
          idInquilino: null,
          idEdificio: idsEdificios
        },
        attributes: [
          'idDepartamento',
          'numero',
          'piso',
          'metrosCuadrados',
          'habitaciones',
          'banios',
          'estado',
          'idEdificio'
        ],
        order: [
          ['piso', 'ASC'],
          ['numero', 'ASC']
        ]
      });

      // Agregar información del edificio manualmente
      departments = departments.map(dept => {
        const edificio = edificiosAdmin.find(ed => ed.idEdificio === dept.idEdificio);
        return {
          ...dept.toJSON(),
          edificio: edificio ? {
            idEdificio: edificio.idEdificio,
            nombre: edificio.nombre,
            direccion: edificio.direccion
          } : null
        };
      });
      console.log(`✅ [DEPARTMENTS] Consulta alternativa exitosa: ${departments.length} departamentos`);
    }

    // 3. Log detallado de resultados
    console.log(`📦 [DEPARTMENTS] Total departamentos disponibles: ${departments.length}`);
    if (departments.length > 0) {
      console.log('📦 [DEPARTMENTS] Primeros 3 departamentos:');
      departments.slice(0, 3).forEach((dept, index) => {
        console.log(`   ${index + 1}. ${dept.numero} - Piso ${dept.piso} - Edificio: ${dept.edificio?.nombre || 'N/A'}`);
      });
    }

    // 4. Responder
    res.json({
      success: true,
      data: departments
    });

  } catch (error) {
    console.error('❌ [DEPARTMENTS] Error general obteniendo departamentos disponibles:', error);
    console.error('❌ [DEPARTMENTS] Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error al obtener departamentos disponibles',
      error: error.message
    });
  }
};

// ✅ ACTUALIZAR EXPORTS
module.exports = {
  createDepartmentsBatch,
  getDepartments,
  getBuildings,
  createDefaultBuilding,
  updateDepartment,        // ✅ AGREGAR
  deleteDepartment,        // ✅ AGREGAR
  getDepartmentDetails,    // ✅ AGREGAR
  getAvailableDepartments  // ✅ AGREGAR
};