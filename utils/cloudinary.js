import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// 1. Configuración de Cloudinary
// (Debe tener estas variables definidas en tu archivo .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Función para subir un archivo local a Cloudinary
 * @param {string} filePath Ruta del archivo local
 * @returns {object} Objeto con la URL y el ID público del archivo
 */
const uploadImageToCloudinary = async (filePath) => {
    try {
        if (!filePath) {
            throw new Error("No se ha proporcionado una ruta de archivo.");
        }
        
        // El método 'upload' sube el archivo.
        const result = await cloudinary.uploader.upload(filePath, {
            folder: "salvador_cerezo_posts", // Carpeta donde se guardarán las imágenes
            resource_type: "auto", // Detecta automáticamente el tipo (imagen, video, etc.)
        });

        // El resultado contiene la información que necesitamos
        return { 
            url: result.secure_url, 
            publicId: result.public_id 
        };

    } catch (error) {
        console.error("Error al subir imagen a Cloudinary:", error);
        throw new Error("Fallo en la subida a Cloudinary.");
    }
};

/**
 * Función para eliminar una imagen de Cloudinary
 * @param {string} publicId El ID público de la imagen en Cloudinary
 */
const deleteImageFromCloudinary = async (publicId) => {
    try {
        if (publicId) {
            await cloudinary.uploader.destroy(publicId);
            console.log(`Imagen con ID ${publicId} eliminada de Cloudinary.`);
        }
    } catch (error) {
        console.error("Error al eliminar imagen de Cloudinary:", error);
    }
};

export { uploadImageToCloudinary, deleteImageFromCloudinary };