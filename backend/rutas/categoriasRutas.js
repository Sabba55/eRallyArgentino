import express from 'express';
import { body, param } from 'express-validator';
import {
  listarCategorias,
  obtenerCategoria,
  obtenerVehiculosCategoria,
  obtenerRalliesCategoria,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
  crearCategoriasIniciales,
  obtenerEstadisticas
} from '../controladores/categoriasControlador.js';
import { verificarAutenticacion } from '../middlewares/autenticacion.js';
import { esAdmin } from '../middlewares/esAdmin.js';
import { manejarErroresValidacion } from '../middlewares/validaciones.js';

const router = express.Router();

// ========================================
// LISTAR TODAS LAS CATEGORÍAS (PÚBLICO)
// GET /api/categorias
// ========================================
router.get('/', listarCategorias);

// ========================================
// CREAR CATEGORÍAS INICIALES (ADMIN / SETUP)
// POST /api/categorias/iniciales
// Solo funciona si NO hay categorías en la BD
// ========================================
router.post(
  '/iniciales',
  verificarAutenticacion,
  esAdmin,
  crearCategoriasIniciales
);

// ========================================
// OBTENER CATEGORÍA POR ID (PÚBLICO)
// GET /api/categorias/:id
// ========================================
router.get(
  '/:id',
  [
    param('id')
      .isInt({ min: 1 }).withMessage('ID de categoría inválido'),

    manejarErroresValidacion
  ],
  obtenerCategoria
);

// ========================================
// OBTENER VEHÍCULOS DE UNA CATEGORÍA (PÚBLICO)
// GET /api/categorias/:id/vehiculos
// ========================================
router.get(
  '/:id/vehiculos',
  [
    param('id')
      .isInt({ min: 1 }).withMessage('ID de categoría inválido'),

    manejarErroresValidacion
  ],
  obtenerVehiculosCategoria
);

// ========================================
// OBTENER RALLIES DE UNA CATEGORÍA (PÚBLICO)
// GET /api/categorias/:id/rallies
// ========================================
router.get(
  '/:id/rallies',
  [
    param('id')
      .isInt({ min: 1 }).withMessage('ID de categoría inválido'),

    manejarErroresValidacion
  ],
  obtenerRalliesCategoria
);

// ========================================
// OBTENER ESTADÍSTICAS DE CATEGORÍA (ADMIN)
// GET /api/categorias/:id/estadisticas
// ========================================
router.get(
  '/:id/estadisticas',
  verificarAutenticacion,
  esAdmin,
  [
    param('id')
      .isInt({ min: 1 }).withMessage('ID de categoría inválido'),

    manejarErroresValidacion
  ],
  obtenerEstadisticas
);

// ========================================
// CREAR CATEGORÍA (ADMIN)
// POST /api/categorias
// ========================================
router.post(
  '/',
  verificarAutenticacion,
  esAdmin,
  [
    body('nombre')
      .trim()
      .notEmpty().withMessage('El nombre es obligatorio')
      .isLength({ min: 1, max: 50 }).withMessage('El nombre debe tener entre 1 y 50 caracteres'),

    body('descripcion')
      .optional()
      .trim()
      .isLength({ max: 200 }).withMessage('La descripción no puede tener más de 200 caracteres'),

    body('color')
      .trim()
      .notEmpty().withMessage('El color es obligatorio')
      .matches(/^#[0-9A-Fa-f]{6}$/).withMessage('El color debe ser un código hexadecimal válido (ej: #00d4ff)'),

    manejarErroresValidacion
  ],
  crearCategoria
);

// ========================================
// ACTUALIZAR CATEGORÍA (ADMIN)
// PUT /api/categorias/:id
// ========================================
router.put(
  '/:id',
  verificarAutenticacion,
  esAdmin,
  [
    param('id')
      .isInt({ min: 1 }).withMessage('ID de categoría inválido'),

    body('nombre')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 }).withMessage('El nombre debe tener entre 1 y 50 caracteres'),

    body('descripcion')
      .optional()
      .trim()
      .isLength({ max: 200 }).withMessage('La descripción no puede tener más de 200 caracteres'),

    body('color')
      .optional()
      .trim()
      .matches(/^#[0-9A-Fa-f]{6}$/).withMessage('El color debe ser un código hexadecimal válido (ej: #00d4ff)'),

    manejarErroresValidacion
  ],
  actualizarCategoria
);

// ========================================
// ELIMINAR CATEGORÍA (ADMIN)
// DELETE /api/categorias/:id
// ========================================
router.delete(
  '/:id',
  verificarAutenticacion,
  esAdmin,
  [
    param('id')
      .isInt({ min: 1 }).withMessage('ID de categoría inválido'),

    manejarErroresValidacion
  ],
  eliminarCategoria
);

export default router;