import { validationResult } from 'express-validator';

// Middleware para manejar los errores de validación
export const manejarErroresValidacion = (req, res, next) => {
  const errores = validationResult(req);

  if (!errores.isEmpty()) {
    return res.status(400).json({
      error: 'Errores de validación',
      errores: errores.array().map(error => ({
        campo: error.path || error.param,
        mensaje: error.msg
      }))
    });
  }

  next();
};

// Validación personalizada: verificar que las contraseñas coincidan
export const contraseñasCoinciden = (value, { req }) => {
  if (value !== req.body.contraseña) {
    throw new Error('Las contraseñas no coinciden');
  }
  return true;
};

// Validación personalizada: verificar que la fecha sea futura
export const esFechaFutura = (value) => {
  const fecha = new Date(value);
  const ahora = new Date();

  if (fecha <= ahora) {
    throw new Error('La fecha debe ser futura');
  }
  return true;
};

// Validación personalizada: verificar que sea una fecha válida
export const esFechaValida = (value) => {
  const fecha = new Date(value);

  if (isNaN(fecha.getTime())) {
    throw new Error('La fecha no es válida');
  }
  return true;
};

// Validación personalizada: verificar que el precio sea positivo
export const esPrecioValido = (value) => {
  const precio = parseFloat(value);

  if (isNaN(precio) || precio <= 0) {
    throw new Error('El precio debe ser un número mayor a 0');
  }
  return true;
};

// Validación personalizada: verificar formato de teléfono argentino
export const esTelefonoArgentino = (value) => {
  // Formato: 549 + código área (sin 0) + número (sin 15)
  // Ejemplo: 5493512345678
  const regex = /^549\d{10}$/;

  if (!regex.test(value)) {
    throw new Error('El número debe tener formato argentino: 549 + código de área + número (ejemplo: 5493512345678)');
  }
  return true;
};

// Validación personalizada: verificar que sea un color hexadecimal
export const esColorHex = (value) => {
  const regex = /^#[0-9A-Fa-f]{6}$/;

  if (!regex.test(value)) {
    throw new Error('El color debe ser un código hexadecimal válido (ejemplo: #00d4ff)');
  }
  return true;
};

// Validación personalizada: sanitizar HTML (prevenir XSS)
export const sanitizarHTML = (value) => {
  // Eliminar tags HTML peligrosos
  const sanitizado = value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');

  return sanitizado;
};

export default manejarErroresValidacion;