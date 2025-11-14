import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminAPI } from '../../../services/api/admin';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';

const ContractsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [filterTenantId, setFilterTenantId] = useState(null);
  const [formData, setFormData] = useState({
    id_inquilino: '',
    id_departamento: '',
    fecha_inicio: '',
    fecha_fin: '',
    monto_mensual: '',
    deposito_garantia: '',
    duracion_meses: '',
    estado: 'Activo'
  });

  useEffect(() => {
    // Leer parámetro de inquilino de la URL
    const inquilinoParam = searchParams.get('inquilino');
    if (inquilinoParam) {
      setFilterTenantId(inquilinoParam);
    }
    loadContracts(inquilinoParam);
  }, [searchParams]);

  const loadContracts = async (tenantId = null) => {
    try {
      setLoading(true);
      const params = tenantId ? { inquilino: tenantId } : {};
      console.log('🔍 Cargando contratos con params:', params);
      const response = await adminAPI.getContracts(params);
      console.log('📦 Respuesta completa:', response);
      console.log('📦 response.data:', response.data);
      
      if (response.data && response.data.success) {
        console.log('✅ Contratos recibidos:', response.data.data);
        setContracts(response.data.data);
      } else {
        console.error('❌ Respuesta sin éxito:', response);
        setContracts([]);
      }
    } catch (error) {
      console.error('Error loading contracts:', error);
      alert('Error al cargar contratos');
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingContract) {
        const response = await adminAPI.updateContract(editingContract.id_contrato, formData);
        console.log('✅ Contrato actualizado:', response.data);
        alert('Contrato actualizado exitosamente. El PDF debe regenerarse.');
      } else {
        await adminAPI.createContract(formData);
        alert('Contrato creado exitosamente');
      }
      setShowModal(false);
      setEditingContract(null);
      setFormData({
        id_inquilino: '',
        id_departamento: '',
        fecha_inicio: '',
        fecha_fin: '',
        monto_mensual: '',
        deposito_garantia: '',
        duracion_meses: '',
        estado: 'Activo'
      });
      // Recargar contratos para ver los cambios
      await loadContracts(filterTenantId);
    } catch (error) {
      console.error('Error saving contract:', error);
      alert(error.response?.data?.message || 'Error al guardar contrato');
    }
  };

  const handleEdit = (contract) => {
    const idContrato = contract.idContrato || contract.id_contrato;
    const idInquilino = contract.idInquilino || contract.id_inquilino;
    const idDepartamento = contract.idDepartamento || contract.id_departamento;
    const fechaInicio = contract.fechaInicio || contract.fecha_inicio;
    const fechaFin = contract.fechaFin || contract.fecha_fin;
    const montoMensual = contract.montoMensual || contract.monto_mensual;
    const depositoGarantia = contract.depositoGarantia || contract.deposito_garantia;
    const duracionMeses = contract.duracionMeses || contract.duracion_meses;
    
    // Convertir fechas ISO a formato YYYY-MM-DD para los inputs
    const formatDateForInput = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };
    
    setEditingContract({ ...contract, id_contrato: idContrato });
    setFormData({
      id_inquilino: idInquilino,
      id_departamento: idDepartamento,
      fecha_inicio: formatDateForInput(fechaInicio),
      fecha_fin: formatDateForInput(fechaFin),
      monto_mensual: montoMensual,
      deposito_garantia: depositoGarantia,
      duracion_meses: duracionMeses,
      estado: contract.estado
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este contrato?')) {
      try {
        await adminAPI.deleteContract(id);
        alert('Contrato eliminado exitosamente');
        loadContracts();
      } catch (error) {
        console.error('Error deleting contract:', error);
        alert('Error al eliminar contrato');
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      alert('Por favor selecciona un archivo PDF');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('archivo_pdf', uploadFile);
      
      const idContrato = selectedContract.idContrato || selectedContract.id_contrato;
      await adminAPI.uploadContractFile(idContrato, formData);
      alert('Archivo subido exitosamente');
      setShowUploadModal(false);
      setUploadFile(null);
      loadContracts();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error al subir archivo');
    }
  };

  const handleDownload = async (contract) => {
    const archivoPdf = contract.archivoPdf || contract.archivo_pdf;
    const idContrato = contract.idContrato || contract.id_contrato;
    
    if (!archivoPdf) {
      alert('No hay archivo disponible para descargar');
      return;
    }

    try {
      const response = await adminAPI.downloadContractFile(idContrato);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contrato-${idContrato}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error al descargar archivo');
    }
  };

  const handleGeneratePDF = async (contract) => {
    const idContrato = contract.idContrato || contract.id_contrato;
    
    if (window.confirm('¿Deseas generar el PDF de este contrato?')) {
      try {
        const response = await adminAPI.generateContractPDF(idContrato);
        if (response.data.success) {
          alert('PDF generado exitosamente');
          loadContracts();
        }
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert(error.response?.data?.message || 'Error al generar PDF');
      }
    }
  };

  const handleCreateMissingContracts = async () => {
    if (window.confirm('¿Deseas crear contratos para todos los inquilinos que tienen departamento asignado pero no tienen contrato?')) {
      try {
        const response = await adminAPI.createMissingContracts();
        if (response.data.success) {
          const { created, skipped } = response.data.data.total;
          alert(`Contratos creados: ${created}\nOmitidos (ya tenían contrato): ${skipped}`);
          loadContracts();
        }
      } catch (error) {
        console.error('Error creating missing contracts:', error);
        alert(error.response?.data?.message || 'Error al crear contratos');
      }
    }
  };

  const getStatusBadge = (estado) => {
    const statusClasses = {
      'Activo': 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs',
      'Finalizado': 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs'
    };
    return (
      <span className={statusClasses[estado] || 'bg-gray-100 px-2 py-1 rounded-full text-xs'}>
        {estado}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  };

  // Agrupar contratos por inquilino
  const groupedContracts = contracts.reduce((acc, contract) => {
    // Manejar ambos formatos de nombres (camelCase y snake_case)
    const tenantId = contract.inquilino?.idUsuario || contract.inquilino?.id_usuario;
    if (!tenantId) {
      console.log('Contrato sin inquilino:', contract);
      return acc;
    }
    
    if (!acc[tenantId]) {
      acc[tenantId] = {
        tenant: contract.inquilino,
        contracts: []
      };
    }
    acc[tenantId].contracts.push(contract);
    return acc;
  }, {});

  console.log('Contratos cargados:', contracts);
  console.log('Contratos agrupados:', groupedContracts);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Cargando contratos...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Contratos</h1>
          {filterTenantId && (
            <p className="text-sm text-gray-600 mt-1">
              Mostrando contratos del inquilino seleccionado
              <button
                onClick={() => {
                  setSearchParams({});
                  setFilterTenantId(null);
                }}
                className="ml-2 text-blue-600 hover:text-blue-800 underline"
              >
                Ver todos
              </button>
            </p>
          )}
        </div>
        <div className="space-x-2">
          <Button 
            onClick={handleCreateMissingContracts}
            className="bg-purple-600 hover:bg-purple-700"
          >
            🔄 Crear Contratos Faltantes
          </Button>
          <Button onClick={() => setShowModal(true)}>
            + Nuevo Contrato
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Contratos por Inquilino</h2>
        
        {contracts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No hay contratos registrados</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.values(groupedContracts).map(({ tenant, contracts: tenantContracts }) => (
              <div key={tenant.idUsuario} className="border rounded-lg p-4 bg-gray-50">
                {/* Encabezado del Inquilino */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{tenant.nombreCompleto}</h3>
                    <p className="text-sm text-gray-600">DNI: {tenant.dni} • {tenant.correo}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {tenantContracts.length} {tenantContracts.length === 1 ? 'contrato' : 'contratos'}
                  </div>
                </div>

                {/* Lista de contratos del inquilino */}
                <div className="space-y-3">
                  {tenantContracts.map((contract) => {
                    // Manejar ambos formatos de nombres
                    const idContrato = contract.idContrato || contract.id_contrato;
                    const fechaInicio = contract.fechaInicio || contract.fecha_inicio;
                    const fechaFin = contract.fechaFin || contract.fecha_fin;
                    const montoMensual = contract.montoMensual || contract.monto_mensual || 0;
                    const depositoGarantia = contract.depositoGarantia || contract.deposito_garantia || 0;
                    const archivoPdf = contract.archivoPdf || contract.archivo_pdf;
                    
                    return (
                    <div key={idContrato} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {/* Departamento */}
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Departamento</p>
                          <p className="font-medium text-gray-900">Depto. {contract.departamento?.numero}</p>
                          <p className="text-sm text-gray-600">Piso {contract.departamento?.piso}</p>
                          <p className="text-xs text-gray-500">{contract.departamento?.edificio?.nombre}</p>
                        </div>

                        {/* Fechas */}
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Vigencia</p>
                          <p className="text-sm text-gray-900">
                            {fechaInicio ? (() => {
                              const date = new Date(fechaInicio);
                              return new Date(date.getTime() + date.getTimezoneOffset() * 60000).toLocaleDateString('es-ES');
                            })() : 'N/A'}
                          </p>
                          <p className="text-sm text-gray-600">hasta</p>
                          <p className="text-sm text-gray-900">
                            {fechaFin ? (() => {
                              const date = new Date(fechaFin);
                              return new Date(date.getTime() + date.getTimezoneOffset() * 60000).toLocaleDateString('es-ES');
                            })() : 'N/A'}
                          </p>
                        </div>

                        {/* Montos */}
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Montos</p>
                          <p className="font-medium text-gray-900">{formatCurrency(montoMensual)}</p>
                          <p className="text-xs text-gray-500">Depósito: {formatCurrency(depositoGarantia)}</p>
                        </div>

                        {/* Estado */}
                        <div>
                          <p className="text-xs text-gray-500 uppercase mb-1">Estado</p>
                          {getStatusBadge(contract.estado)}
                        </div>

                        {/* Acciones */}
                        <div className="flex items-center justify-end space-x-2">
                          {/* Documento */}
                          {archivoPdf ? (
                            <button
                              onClick={() => handleDownload(contract)}
                              className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                              title="Descargar PDF"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              PDF
                            </button>
                          ) : (
                            <button
                              onClick={() => handleGeneratePDF(contract)}
                              className="px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                              title="Generar PDF"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Generar
                            </button>
                          )}

                          {/* Editar */}
                          <button
                            onClick={() => handleEdit(contract)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded"
                            title="Editar contrato"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>

                          {/* Eliminar */}
                          <button
                            onClick={() => handleDelete(idContrato)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Eliminar contrato"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal para crear/editar contrato */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingContract(null);
          setFormData({
            id_inquilino: '',
            id_departamento: '',
            fecha_inicio: '',
            fecha_fin: '',
            monto_mensual: '',
            deposito_garantia: '',
            duracion_meses: '',
            estado: 'Activo'
          });
        }}
        title={editingContract ? 'Editar Contrato' : 'Nuevo Contrato'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Inquilino *
              </label>
              <input
                type="number"
                value={formData.id_inquilino}
                onChange={(e) => setFormData({...formData, id_inquilino: e.target.value})}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="ID del inquilino"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Departamento *
              </label>
              <input
                type="number"
                value={formData.id_departamento}
                onChange={(e) => setFormData({...formData, id_departamento: e.target.value})}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="ID del departamento"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Inicio *
              </label>
              <input
                type="date"
                value={formData.fecha_inicio}
                onChange={(e) => setFormData({...formData, fecha_inicio: e.target.value})}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Fin *
              </label>
              <input
                type="date"
                value={formData.fecha_fin}
                onChange={(e) => setFormData({...formData, fecha_fin: e.target.value})}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto Mensual *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.monto_mensual}
                onChange={(e) => setFormData({...formData, monto_mensual: e.target.value})}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duración (meses) *
              </label>
              <input
                type="number"
                value={formData.duracion_meses}
                onChange={(e) => setFormData({...formData, duracion_meses: e.target.value})}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="12"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Depósito de Garantía
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.deposito_garantia}
              onChange={(e) => setFormData({...formData, deposito_garantia: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="0.00"
            />
          </div>

          {editingContract && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({...formData, estado: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Activo">Activo</option>
                <option value="Finalizado">Finalizado</option>
              </select>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowModal(false);
                setEditingContract(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {editingContract ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal para subir archivo */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setUploadFile(null);
        }}
        title="Subir Contrato PDF"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seleccionar archivo PDF
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setUploadFile(e.target.files[0])}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Solo se permiten archivos PDF (máximo 10MB)
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowUploadModal(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!uploadFile}>
              Subir Archivo
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ContractsList;