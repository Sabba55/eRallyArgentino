// Middleware para verificar que el usuario sea ADMIN (super usuario)
export const esAdmin = (req, res, next) => {
  try {
    // El usuario ya debe estar autenticado (viene del middleware de autenticación)
    if (!req.usuario) {
      return res.status(401).json({
        error: 'Debes estar autenticado para acceder a este recurso'
      });
    }

    // Verificar que el rol sea 'admin'
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({
        error: 'No tenés permisos para realizar esta acción. Solo administradores.'
      });
    }

    // Si es admin, continuar
    next();
  } catch (error) {
    console.error('Error en middleware esAdmin:', error);
    return res.status(500).json({
      error: 'Error al verificar permisos de administrador'
    });
  }
};

// Middleware para verificar que el usuario sea CREADOR DE FECHAS o ADMIN
export const esCreadorFechas = (req, res, next) => {
  try {
    if (!req.usuario) {
      return res.status(401).json({
        error: 'Debes estar autenticado para acceder a este recurso'
      });
    }

    // Permitir si es creador_fechas o admin
    if (req.usuario.rol !== 'creador_fechas' && req.usuario.rol !== 'admin') {
      return res.status(403).json({
        error: 'No tenés permisos para realizar esta acción. Solo creadores de fechas o administradores.'
      });
    }

    next();
  } catch (error) {
    console.error('Error en middleware esCreadorFechas:', error);
    return res.status(500).json({
      error: 'Error al verificar permisos'
    });
  }
};

// Middleware para verificar que el usuario sea ADMIN o sea el DUEÑO del recurso
export const esAdminODueño = (campoId = 'usuarioId') => {
  return (req, res, next) => {
    try {
      if (!req.usuario) {
        return res.status(401).json({
          error: 'Debes estar autenticado para acceder a este recurso'
        });
      }

      // Si es admin, permitir acceso
      if (req.usuario.rol === 'admin') {
        return next();
      }

      // Si no es admin, verificar que sea el dueño
      // Buscar el ID del usuario en los parámetros o en el body
      const idRecurso = req.params[campoId] || req.body[campoId];

      if (parseInt(idRecurso) !== req.usuario.id) {
        return res.status(403).json({
          error: 'No tenés permisos para acceder a este recurso'
        });
      }

      next();
    } catch (error) {
      console.error('Error en middleware esAdminODueño:', error);
      return res.status(500).json({
        error: 'Error al verificar permisos'
      });
    }
  };
};

export default esAdmin;