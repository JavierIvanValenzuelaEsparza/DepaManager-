import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tenantAPI } from '../../../services/api/tenant';

/**
 * Componente para subir comprobantes de pago
 * Permite al inquilino subir imágenes o PDFs de sus comprobantes
 */
export default function PaymentUpload() {
  const { idPago } = useParams();
  const navigate = useNavigate();
  
  // Estados del componente
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' o 'camera'

  /**
   * Cargar información del pago al montar el componente
   */
  useEffect(() => {
    if (idPago) {
      loadPaymentInfo();
    }
  }, [idPago]);

  /**
   * Cargar información del pago específico
   */
  const loadPaymentInfo = async () => {
    try {
      setLoading(true);
      console.log(`🔄 Cargando información del pago ${idPago}...`);

      // Obtener todos los pagos y filtrar el específico
      const response = await tenantAPI.getPayments();
      
      if (response.success) {
        const paymentInfo = response.data.pagos.find(p => p.idPago == idPago);
        
        if (paymentInfo) {
          setPayment(paymentInfo);
          console.log('✅ Información del pago cargada');
        } else {
          throw new Error('Pago no encontrado');
        }
      }
    } catch (error) {
      console.error('❌ Error cargando información del pago:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Manejar selección de archivo
   */
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('❌ Formato no válido. Solo se permiten JPG, PNG y PDF.');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('❌ Archivo muy grande. El tamaño máximo es 5MB.');
        return;
      }

      setSelectedFile(file);
      
      // Crear preview para imágenes
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreviewUrl(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  /**
   * Manejar subida del comprobante
   */
  const handleUpload = async () => {
    if (!selectedFile) {
      alert('❌ Por favor, selecciona un archivo primero');
      return;
    }

    try {
      setUploading(true);
      console.log('📤 Subiendo comprobante...');

      // En una implementación real, aquí subirías el archivo a tu servidor
      // y obtendrías la URL del comprobante
      const fakeUpload = new Promise((resolve) => {
        setTimeout(() => {
          resolve(`https://depamanager.com/comprobantes/${idPago}_${Date.now()}.${selectedFile.type === 'application/pdf' ? 'pdf' : 'jpg'}`);
        }, 2000);
      });

      const comprobanteUrl = await fakeUpload;

      // Enviar la URL del comprobante al backend
      await tenantAPI.uploadPaymentReceipt(idPago, comprobanteUrl);
      
      console.log('✅ Comprobante subido exitosamente');
      alert('✅ Comprobante subido correctamente. El administrador verificará tu pago.');
      
      // Redirigir a la lista de pagos
      navigate('/tenant/pagos');
      
    } catch (error) {
      console.error('❌ Error subiendo comprobante:', error);
      alert('Error al subir comprobante: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  /**
   * Simular captura desde cámara (en un entorno real usarías la API de cámara)
   */
  const simulateCameraCapture = () => {
    alert('📸 En una aplicación real, aquí se abriría la cámara del dispositivo');
    // Para demo, simulamos seleccionar un archivo
    document.getElementById('file-input').click();
  };

  /**
   * Formatear monto como dinero
   */
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  };

  /**
   * Formatear fecha
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Cargando información del pago...</p>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <div className="text-red-600 text-lg mb-2">❌ Pago no encontrado</div>
            <p className="text-red-700 mb-4">No se pudo encontrar la información del pago solicitado.</p>
            <button
              onClick={() => navigate('/tenant/pagos')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Volver a Pagos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Encabezado */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Subir Comprobante de Pago</h1>
                <p className="text-slate-600">Adjunta tu comprobante para verificación</p>
              </div>
              <button
                onClick={() => navigate('/tenant/pagos')}
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información del Pago */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Información del Pago</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500">Concepto</p>
                  <p className="font-medium text-slate-900">{payment.concepto}</p>
                </div>
                
                {payment.descripcionServicio && (
                  <div>
                    <p className="text-sm text-slate-500">Descripción</p>
                    <p className="font-medium text-slate-900">{payment.descripcionServicio}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-slate-500">Monto a Pagar</p>
                  <p className="text-2xl font-bold text-emerald-600">{formatMoney(payment.monto)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-slate-500">Fecha de Vencimiento</p>
                  <p className="font-medium text-slate-900">{formatDate(payment.fechaVencimiento)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-slate-500">Estado Actual</p>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Pendiente
                  </span>
                </div>
              </div>

              {/* Información importante */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">📋 Requisitos del comprobante</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Formato: JPG, PNG o PDF</li>
                  <li>• Tamaño máximo: 5MB</li>
                  <li>• Debe ser legible</li>
                  <li>• Incluir fecha y monto</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Área de Subida */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Subir Comprobante</h2>

              {/* Selección de método */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Selecciona método de subida:
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setUploadMethod('file')}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      uploadMethod === 'file'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">📁</div>
                    <p className="font-medium">Subir Archivo</p>
                    <p className="text-xs text-slate-500 mt-1">JPG, PNG, PDF</p>
                  </button>
                  
                  <button
                    onClick={() => {
                      setUploadMethod('camera');
                      simulateCameraCapture();
                    }}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      uploadMethod === 'camera'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">📸</div>
                    <p className="font-medium">Usar Cámara</p>
                    <p className="text-xs text-slate-500 mt-1">Tomar foto</p>
                  </button>
                </div>
              </div>

              {/* Área de dropzone */}
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center mb-6">
                <input
                  id="file-input"
                  type="file"
                  onChange={handleFileSelect}
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden"
                />
                
                {!selectedFile ? (
                  <div>
                    <div className="text-4xl text-slate-400 mb-4">📁</div>
                    <p className="text-slate-600 mb-2">
                      Arrastra tu comprobante aquí o{' '}
                      <button
                        type="button"
                        onClick={() => document.getElementById('file-input').click()}
                        className="text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        busca en tu dispositivo
                      </button>
                    </p>
                    <p className="text-sm text-slate-500">
                      Formatos aceptados: JPG, PNG, PDF (máx. 5MB)
                    </p>
                  </div>
                ) : (
                  <div>
                    {previewUrl ? (
                      <div className="mb-4">
                        <img
                          src={previewUrl}
                          alt="Vista previa del comprobante"
                          className="max-h-48 mx-auto rounded-lg shadow-sm"
                        />
                      </div>
                    ) : (
                      <div className="text-4xl text-slate-400 mb-4">📄</div>
                    )}
                    
                    <p className="font-medium text-slate-900 mb-1">{selectedFile.name}</p>
                    <p className="text-sm text-slate-500 mb-4">
                      Tamaño: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      ✕ Eliminar archivo
                    </button>
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex gap-4">
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="flex-1 bg-emerald-600 text-white py-3 px-6 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                >
                  {uploading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Subiendo...
                    </div>
                  ) : (
                    '✅ Subir Comprobante'
                  )}
                </button>
                
                <button
                  onClick={() => navigate('/tenant/pagos')}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>

              {/* Información después de subir */}
              {payment.comprobanteSubido && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-green-600 text-lg mr-2">✅</span>
                    <div>
                      <p className="font-medium text-green-800">Comprobante ya subido</p>
                      <p className="text-sm text-green-700">
                        Fecha de subida: {payment.fechaComprobante ? 
                          new Date(payment.fechaComprobante).toLocaleDateString('es-ES') : 
                          'No disponible'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}