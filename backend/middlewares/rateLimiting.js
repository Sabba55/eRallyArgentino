import rateLimit from 'express-rate-limit'

// Límite para login - máximo 10 intentos cada 15 minutos
export const limitarLogin = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  message: {
    error: 'Demasiados intentos de login. Intentá de nuevo en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
})

// Límite para registro - máximo 5 registros cada hora
export const limitarRegistro = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5,
  message: {
    error: 'Demasiados intentos de registro. Intentá de nuevo en 1 hora.'
  },
  standardHeaders: true,
  legacyHeaders: false
})

// Límite para recuperación de contraseña - máximo 5 intentos cada hora
export const limitarRecuperacion = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    error: 'Demasiados intentos. Intentá de nuevo en 1 hora.'
  },
  standardHeaders: true,
  legacyHeaders: false
})