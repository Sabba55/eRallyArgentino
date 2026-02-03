import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Función para subir imagen desde buffer
export const subirImagen = async (archivoBuffer, carpeta = 'erally') => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: carpeta,
          resource_type: 'auto',
          transformation: [
            { width: 1200, height: 900, crop: 'limit' }, // Limitar tamaño máximo
            { quality: 'auto:good' } // Optimización automática
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(archivoBuffer);
    });
  } catch (error) {
    console.error('Error al subir imagen a Cloudinary:', error);
    throw error;
  }
};

// Función para eliminar imagen
export const eliminarImagen = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error al eliminar imagen de Cloudinary:', error);
    throw error;
  }
};

// Función para extraer public_id de una URL de Cloudinary
export const extraerPublicId = (url) => {
  try {
    const partes = url.split('/');
    const nombreConExtension = partes[partes.length - 1];
    const publicId = nombreConExtension.split('.')[0];
    const carpeta = partes[partes.length - 2];
    return `${carpeta}/${publicId}`;
  } catch (error) {
    console.error('Error al extraer public_id:', error);
    return null;
  }
};

export default cloudinary;