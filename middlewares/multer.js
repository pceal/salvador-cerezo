import multer from 'multer';
import path from 'path';

// 1. Configuración de almacenamiento temporal en memoria
// Multer lo guardará en el disco local antes de que Cloudinary lo recoja.
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // La carpeta 'uploads/' DEBE existir en la raíz de tu proyecto
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        // Aseguramos un nombre de archivo único
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// 2. Filtro de archivos (Solo permitir imágenes)
const fileFilter = (req, file, cb) => {
    // Aceptar solo archivos jpeg o png
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

// 3. Inicialización de Multer
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } // Límite de 5MB
});

export default upload;