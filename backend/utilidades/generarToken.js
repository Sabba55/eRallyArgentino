import crypto from 'crypto';

// ========================================
// GENERAR TOKEN ALEATORIO SEGURO
// ========================================

/**
 * Genera un token aleatorio seguro usando crypto
 * @param {number} longitud - Longitud en bytes (por defecto 32)
 * @returns {string} - Token hexadecimal
 */
export const generarToken = (longitud = 32) => {
  return crypto.randomBytes(longitud).toString('hex');
};

// ========================================
// GENERAR TOKEN NUMÉRICO
// ========================================

/**
 * Genera un código numérico aleatorio
 * @param {number} digitos - Cantidad de dígitos (por defecto 6)
 * @returns {string} - Código numérico
 */
export const generarCodigoNumerico = (digitos = 6) => {
  const min = Math.pow(10, digitos - 1);
  const max = Math.pow(10, digitos) - 1;
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
};

// ========================================
// GENERAR ID ÚNICO
// ========================================

/**
 * Genera un ID único basado en timestamp + random
 * Útil para IDs de transacciones, archivos, etc.
 * @returns {string} - ID único
 */
export const generarIdUnico = () => {
  const timestamp = Date.now().toString(36); // Base 36 para ser más corto
  const random = crypto.randomBytes(4).toString('hex');
  return `${timestamp}-${random}`;
};

// ========================================
// GENERAR HASH SEGURO
// ========================================

/**
 * Genera un hash SHA256 de un texto
 * @param {string} texto - Texto a hashear
 * @returns {string} - Hash en hexadecimal
 */
export const generarHash = (texto) => {
  return crypto
    .createHash('sha256')
    .update(texto)
    .digest('hex');
};

/**
 * Genera un hash con salt
 * @param {string} texto - Texto a hashear
 * @param {string} salt - Salt opcional (se genera uno si no se provee)
 * @returns {object} - { hash, salt }
 */
export const generarHashConSalt = (texto, salt = null) => {
  if (!salt) {
    salt = crypto.randomBytes(16).toString('hex');
  }

  const hash = crypto
    .createHash('sha256')
    .update(texto + salt)
    .digest('hex');

  return { hash, salt };
};

// ========================================
// VERIFICAR HASH
// ========================================

/**
 * Verifica si un texto coincide con un hash
 * @param {string} texto - Texto a verificar
 * @param {string} hash - Hash a comparar
 * @param {string} salt - Salt usado (opcional)
 * @returns {boolean} - true si coincide
 */
export const verificarHash = (texto, hash, salt = '') => {
  const hashCalculado = crypto
    .createHash('sha256')
    .update(texto + salt)
    .digest('hex');

  return hashCalculado === hash;
};

// ========================================
// GENERAR TOKEN DE SESIÓN
// ========================================

/**
 * Genera un token de sesión único
 * Combina timestamp + user ID + random
 * @param {number} userId - ID del usuario
 * @returns {string} - Token de sesión
 */
export const generarTokenSesion = (userId) => {
  const timestamp = Date.now().toString(36);
  const userPart = userId.toString(36);
  const random = crypto.randomBytes(8).toString('hex');
  return `${timestamp}.${userPart}.${random}`;
};

// ========================================
// GENERAR SLUG ÚNICO
// ========================================

/**
 * Genera un slug único a partir de un texto
 * Útil para URLs amigables
 * @param {string} texto - Texto base
 * @param {boolean} incluirRandom - Agregar parte aleatoria
 * @returns {string} - Slug
 */
export const generarSlug = (texto, incluirRandom = true) => {
  // Convertir a minúsculas y reemplazar espacios
  let slug = texto
    .toLowerCase()
    .normalize('NFD') // Normalizar caracteres especiales
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9]+/g, '-') // Reemplazar caracteres especiales por guiones
    .replace(/^-+|-+$/g, ''); // Eliminar guiones al inicio/fin

  // Agregar parte aleatoria si se solicita
  if (incluirRandom) {
    const random = crypto.randomBytes(3).toString('hex');
    slug = `${slug}-${random}`;
  }

  return slug;
};

// ========================================
// GENERAR CÓDIGO ALFANUMÉRICO
// ========================================

/**
 * Genera un código alfanumérico aleatorio
 * @param {number} longitud - Longitud del código
 * @returns {string} - Código alfanumérico (mayúsculas)
 */
export const generarCodigoAlfanumerico = (longitud = 8) => {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = '';

  const bytes = crypto.randomBytes(longitud);

  for (let i = 0; i < longitud; i++) {
    codigo += caracteres[bytes[i] % caracteres.length];
  }

  return codigo;
};

// ========================================
// GENERAR UUID v4
// ========================================

/**
 * Genera un UUID v4 (universally unique identifier)
 * @returns {string} - UUID en formato estándar
 */
export const generarUUID = () => {
  return crypto.randomUUID();
};

// ========================================
// VERIFICAR TOKEN EXPIRADO
// ========================================

/**
 * Verifica si un token basado en timestamp ha expirado
 * @param {string} token - Token con formato timestamp.data
 * @param {number} duracionMs - Duración válida en milisegundos
 * @returns {boolean} - true si está expirado
 */
export const estaTokenExpirado = (token, duracionMs) => {
  try {
    const timestamp = parseInt(token.split('.')[0], 36);
    const ahora = Date.now();
    return (ahora - timestamp) > duracionMs;
  } catch (error) {
    return true; // Si hay error, considerar expirado
  }
};

// ========================================
// GENERAR CÓDIGO DE VERIFICACIÓN TEMPORAL
// ========================================

/**
 * Genera un código de verificación temporal (6 dígitos)
 * Usado para verificación de email, 2FA, etc.
 * @returns {string} - Código de 6 dígitos
 */
export const generarCodigoVerificacion = () => {
  return generarCodigoNumerico(6);
};

export default {
  generarToken,
  generarCodigoNumerico,
  generarIdUnico,
  generarHash,
  generarHashConSalt,
  verificarHash,
  generarTokenSesion,
  generarSlug,
  generarCodigoAlfanumerico,
  generarUUID,
  estaTokenExpirado,
  generarCodigoVerificacion
};