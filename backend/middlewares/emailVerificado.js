// Middleware para verificar que el usuario haya verificado su email
export const verificarEmail = (req, res, next) => {
  try {
    // El usuario ya debe estar autenticado (viene del middleware de autenticación)
    if (!req.usuario) {
      return res.status(401).json({
        error: 'Debes estar autenticado para acceder a este recurso'
      });
    }

    // Verificar que el email esté verificado
    if (!req.usuario.emailVerificado) {
      return res.status(403).json({
        error: 'Debes verificar tu email antes de realizar esta acción',
        mensaje: 'Revisá tu casilla de correo y hacé click en el link de verificación'
      });
    }

    // Si el email está verificado, continuar
    next();
  } catch (error) {
    console.error('Error en middleware verificarEmail:', error);
    return res.status(500).json({
      error: 'Error al verificar el estado del email'
    });
  }
};

// Middleware para verificar que el email NO esté verificado
// (útil para evitar re-verificaciones)
export const emailNoVerificado = (req, res, next) => {
  try {
    if (!req.usuario) {
      return res.status(401).json({
        error: 'Debes estar autenticado para acceder a este recurso'
      });
    }

    if (req.usuario.emailVerificado) {
      return res.status(400).json({
        error: 'Tu email ya está verificado'
      });
    }

    next();
  } catch (error) {
    console.error('Error en middleware emailNoVerificado:', error);
    return res.status(500).json({
      error: 'Error al verificar el estado del email'
    });
  }
};

export default verificarEmail;