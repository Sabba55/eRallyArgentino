import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ========================================
// SUBIR IMAGEN DESDE BUFFER
// Retorna la URL segura (https) de la imagen subida
// ========================================
export const subirImagen = async (archivoBuffer, carpeta = 'erally', nombreArchivo = null) => {
  try {
    return new Promise((resolve, reject) => {
      const opciones = {
        folder: carpeta,
        resource_type: 'auto',
        transformation: [
          { width: 1200, height: 900, crop: 'limit' },
          { quality: 'auto:good' }
        ]
      };

      // Si se especifica nombre, usarlo como public_id (sin extensión)
      // Cloudinary lo guarda como: carpeta/nombreArchivo
      if (nombreArchivo) {
        opciones.public_id = nombreArchivo;
        opciones.overwrite = true; // Si ya existe, lo reemplaza
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        opciones,
        (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        }
      );
      uploadStream.end(archivoBuffer);
    });
  } catch (error) {
    console.error('Error al subir imagen a Cloudinary:', error);
    throw error;
  }
};

// ========================================
// ELIMINAR IMAGEN POR URL
// Acepta la URL de Cloudinary y extrae el public_id automáticamente
// ========================================
export const eliminarImagen = async (url) => {
  if (!url) return null; // Si no hay URL, no hacer nada

  try {
    const publicId = extraerPublicId(url);
    if (!publicId) return null;

    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    // No lanzar error si falla la eliminación — no es crítico
    console.error('Error al eliminar imagen de Cloudinary:', error);
    return null;
  }
};

// ========================================
// EXTRAER PUBLIC ID DESDE URL DE CLOUDINARY
// Ejemplo: https://res.cloudinary.com/demo/image/upload/v123/vehiculos/abc.jpg
//          → "vehiculos/abc"
// ========================================
export const extraerPublicId = (url) => {
  try {
    // Buscar "/upload/" en la URL y tomar todo lo que sigue
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) return null;

    const sinUpload = url.substring(uploadIndex + 8); // Saltar "/upload/"

    // Eliminar la versión si existe (v1234567890/)
    const sinVersion = sinUpload.replace(/^v\d+\//, '');

    // Eliminar la extensión del archivo
    const sinExtension = sinVersion.replace(/\.[^/.]+$/, '');

    return sinExtension;
  } catch (error) {
    console.error('Error al extraer public_id:', error);
    return null;
  }
};

export default cloudinary;