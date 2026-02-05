import jwt from 'jsonwebtoken';
import { Usuario } from '../modelos/index.js';

// Middleware para verificar que el usuario esté autenticado (tiene JWT válido)
export const verificarAutenticacion = async (req, res, next) => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'No se proporcionó token de autenticación'
      });
    }

    // El formato es: "Bearer TOKEN"
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Formato de token inválido'
      });
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar el usuario en la base de datos
    const usuario = await Usuario.findByPk(decoded.id, {
      attributes: { exclude: ['contraseña'] } // No devolver la contraseña
    });

    if (!usuario) {
      return res.status(401).json({
        error: 'Usuario no encontrado'
      });
    }

    // Agregar el usuario al objeto request para usarlo en las rutas
    req.usuario = usuario;

    // Continuar con la siguiente función
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado'
      });
    }

    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({
      error: 'Error al verificar autenticación'
    });
  }
};

// Middleware opcional - permite tanto usuarios autenticados como no autenticados
export const autenticacionOpcional = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(' ')[1];

      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const usuario = await Usuario.findByPk(decoded.id, {
            attributes: { exclude: ['contraseña'] }
          });

          if (usuario) {
            req.usuario = usuario;
          }
        } catch (error) {
          // Si hay error con el token, simplemente no autenticamos
          // pero permitimos continuar
        }
      }
    }

    next();
  } catch (error) {
    console.error('Error en autenticación opcional:', error);
    next();
  }
};

export default verificarAutenticacion;