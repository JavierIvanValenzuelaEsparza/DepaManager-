// Middleware simplificado para desarrollo
const uploadContract = {
  single: (fieldName) => {
    return (req, res, next) => {
      console.log(`📤 Upload middleware llamado para campo: ${fieldName}`);
      // Simulamos que tenemos un archivo
      req.file = {
        filename: `contrato-${Date.now()}.pdf`,
        originalname: 'documento.pdf',
        mimetype: 'application/pdf',
        size: 1024
      };
      next();
    };
  }
};

module.exports = {
  uploadContract
};