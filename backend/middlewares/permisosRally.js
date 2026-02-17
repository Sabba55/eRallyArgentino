import { Rally } from '../modelos/index.js';

// ========================================
// VERIFICAR SI PUEDE EDITAR RALLY
// ========================================
export const puedeEditarRally = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usuario = req.usuario;

    // Admin puede editar cualquier rally
    if (usuario.rol === 'admin') {
      return next();
    }

    // Creador solo puede editar sus propios rallies
    if (usuario.rol === 'creador_fechas') {
      const rally = await Rally.findByPk(id);

      if (!rally) {
        return res.status(404).json({
          error: 'Rally no encontrado'
        });
      }

      if (rally.creadoPorId !== usuario.id) {
        return res.status(403).json({
          error: 'No tenés permisos para editar este rally'
        });
      }

      return next();
    }

    // Usuario normal no puede editar rallies
    return res.status(403).json({
      error: 'No tenés permisos para realizar esta acción'
    });
  } catch (error) {
    console.error('Error al verificar permisos:', error);
    res.status(500).json({
      error: 'Error al verificar permisos',
      detalle: error.message
    });
  }
};

// ========================================
// VERIFICAR SI PUEDE ELIMINAR RALLY
// ========================================
export const puedeEliminarRally = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usuario = req.usuario;

    // Admin puede eliminar cualquier rally
    if (usuario.rol === 'admin') {
      return next();
    }

    // Creador solo puede eliminar sus propios rallies
    if (usuario.rol === 'creador_fechas') {
      const rally = await Rally.findByPk(id);

      if (!rally) {
        return res.status(404).json({
          error: 'Rally no encontrado'
        });
      }

      if (rally.creadoPorId !== usuario.id) {
        return res.status(403).json({
          error: 'No tenés permisos para eliminar este rally'
        });
      }

      return next();
    }

    // Usuario normal no puede eliminar rallies
    return res.status(403).json({
      error: 'No tenés permisos para realizar esta acción'
    });
  } catch (error) {
    console.error('Error al verificar permisos:', error);
    res.status(500).json({
      error: 'Error al verificar permisos',
      detalle: error.message
    });
  }
};