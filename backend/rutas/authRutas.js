import express from 'express';
import { body } from 'express-validator';
import {
  registro,
  login,
  verificarEmail,
  reenviarVerificacion,
  solicitarRecuperacion,
  resetearContraseña,
  obtenerUsuarioActual
} from '../controladores/authControlador.js';
import { verificarAutenticacion } from '../middlewares/autenticacion.js';
import { emailNoVerificado } from '../middlewares/emailVerificado.js';
import { manejarErroresValidacion } from '../middlewares/validaciones.js';

const router = express.Router();

// ========================================
// REGISTRO DE USUARIO
// POST /api/auth/registro
// ========================================
router.post(
  '/registro',
  [
    body('nombre')
      .trim()
      .notEmpty().withMessage('El nombre es obligatorio')
      .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),

    body('email')
      .trim()
      .notEmpty().withMessage('El email es obligatorio')
      .isEmail().withMessage('Debe ser un email válido')
      .normalizeEmail(),

    body('contraseña')
      .notEmpty().withMessage('La contraseña es obligatoria')
      .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),

    body('confirmarContraseña')
      .notEmpty().withMessage('Debes confirmar la contraseña')
      .custom((value, { req }) => {
        if (value !== req.body.contraseña) {
          throw new Error('Las contraseñas no coinciden');
        }
        return true;
      }),

    body('equipo')
      .optional()
      .trim()
      .isLength({ max: 100 }).withMessage('El equipo no puede tener más de 100 caracteres'),

    body('fotoPerfil')
      .optional()
      .trim()
      .isURL().withMessage('La foto de perfil debe ser una URL válida'),

    manejarErroresValidacion
  ],
  registro
);

// ========================================
// LOGIN
// POST /api/auth/login
// ========================================
router.post(
  '/login',
  [
    body('email')
      .trim()
      .notEmpty().withMessage('El email es obligatorio')
      .isEmail().withMessage('Debe ser un email válido')
      .normalizeEmail(),

    body('contraseña')
      .notEmpty().withMessage('La contraseña es obligatoria'),

    manejarErroresValidacion
  ],
  login
);

// ========================================
// VERIFICAR EMAIL
// GET /api/auth/verificar/:token
// ========================================
router.get('/verificar/:token', verificarEmail);

// ========================================
// REENVIAR EMAIL DE VERIFICACIÓN
// POST /api/auth/reenviar-verificacion
// Requiere: estar autenticado y NO tener email verificado
// ========================================
router.post(
  '/reenviar-verificacion',
  verificarAutenticacion,
  emailNoVerificado,
  reenviarVerificacion
);

// ========================================
// SOLICITAR RECUPERACIÓN DE CONTRASEÑA
// POST /api/auth/recuperar-password
// ========================================
router.post(
  '/recuperar-password',
  [
    body('email')
      .trim()
      .notEmpty().withMessage('El email es obligatorio')
      .isEmail().withMessage('Debe ser un email válido')
      .normalizeEmail(),

    manejarErroresValidacion
  ],
  solicitarRecuperacion
);

// ========================================
// RESETEAR CONTRASEÑA
// POST /api/auth/resetear-password
// ========================================
router.post(
  '/resetear-password',
  [
    body('token')
      .trim()
      .notEmpty().withMessage('El token es obligatorio'),

    body('nuevaContraseña')
      .notEmpty().withMessage('La nueva contraseña es obligatoria')
      .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),

    body('confirmarContraseña')
      .notEmpty().withMessage('Debes confirmar la contraseña')
      .custom((value, { req }) => {
        if (value !== req.body.nuevaContraseña) {
          throw new Error('Las contraseñas no coinciden');
        }
        return true;
      }),

    manejarErroresValidacion
  ],
  resetearContraseña
);

// ========================================
// OBTENER USUARIO ACTUAL (MI PERFIL)
// GET /api/auth/me
// Requiere: estar autenticado
// ========================================
router.get(
  '/me',
  verificarAutenticacion,
  obtenerUsuarioActual
);

export default router;