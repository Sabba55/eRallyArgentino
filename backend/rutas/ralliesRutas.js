import express from 'express';
import { body, param, query } from 'express-validator';
import multer from 'multer';
import {
  listarRallies,
  listarProximos,
  listarPasados,
  obtenerRally,
  crearRally,
  actualizarRally,
  reprogramarRally,
  cargarResultados,
  eliminarRally,
  habilitarCategoria,
  deshabilitarCategoria
} from '../controladores/ralliesControlador.js';
import { verificarAutenticacion } from '../middlewares/autenticacion.js';
import { esAdmin, esCreadorFechas } from '../middlewares/esAdmin.js';
import { puedeEditarRally } from '../middlewares/permisosRally.js';
import { manejarErroresValidacion } from '../middlewares/validaciones.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (tiposPermitidos.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (JPEG, PNG, WEBP)'));
    }
  }
});

// ========================================
// RUTAS PÚBLICAS
// ========================================
router.get('/proximos', listarProximos);
router.get('/pasados', listarPasados);

router.get(
  '/',
  [
    query('campeonato').optional().trim().isLength({ min: 1, max: 100 }),
    query('estado').optional().isIn(['todos', 'proximos', 'pasados']),
    query('limite').optional().isInt({ min: 1, max: 200 }),
    query('pagina').optional().isInt({ min: 1 }),
    manejarErroresValidacion
  ],
  listarRallies
);

router.get(
  '/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('ID de rally inválido'),
    manejarErroresValidacion
  ],
  obtenerRally
);

// ========================================
// CREAR RALLY - ACTUALIZADO
// ========================================
router.post(
  '/',
  verificarAutenticacion,
  esCreadorFechas,
  upload.single('logo'),
  [
    body('campeonato')
      .trim()
      .notEmpty().withMessage('El campeonato es obligatorio')
      .isLength({ min: 1, max: 100 }),

    body('nombre')
      .trim()
      .notEmpty().withMessage('El nombre es obligatorio')
      .isLength({ min: 1, max: 150 }),

    body('subtitulo')
      .optional()
      .trim()
      .isLength({ max: 200 }),

    body('fecha')
      .notEmpty().withMessage('La fecha es obligatoria')
      .isISO8601().withMessage('La fecha debe tener un formato válido')
      .custom((value) => {
        const fecha = new Date(value);
        const ahora = new Date();
        if (fecha <= ahora) {
          throw new Error('La fecha del rally debe ser futura');
        }
        return true;
      }),

    body('contactos')
      .optional()
      .custom((value) => {
        if (value) {
          try {
            const contactos = typeof value === 'string' ? JSON.parse(value) : value;
            if (typeof contactos !== 'object') {
              throw new Error('contactos debe ser un objeto JSON válido');
            }
          } catch (error) {
            throw new Error('contactos debe ser un JSON válido');
          }
        }
        return true;
      }),

    // ✅ Aceptar strings (FormData)
    body('categoriasIds').optional(),

    body('categoriasIds.*')
      .optional()
      .custom((value) => {
        const num = parseInt(value);
        if (isNaN(num) || num < 1) {
          throw new Error('ID de categoría inválido');
        }
        return true;
      }),

    body('logoExistente').optional().isString(),

    manejarErroresValidacion
  ],
  crearRally
);

// ========================================
// ACTUALIZAR RALLY - ACTUALIZADO
// ========================================
router.put(
  '/:id',
  verificarAutenticacion,
  esCreadorFechas,
  puedeEditarRally,
  upload.single('logo'),
  [
    param('id').isInt({ min: 1 }).withMessage('ID de rally inválido'),

    body('campeonato').optional().trim().isLength({ min: 1, max: 100 }),
    body('nombre').optional().trim().isLength({ min: 1, max: 150 }),
    body('subtitulo').optional().trim().isLength({ max: 200 }),

    body('contactos')
      .optional()
      .custom((value) => {
        if (value) {
          try {
            const contactos = typeof value === 'string' ? JSON.parse(value) : value;
            if (typeof contactos !== 'object') {
              throw new Error('contactos debe ser un objeto JSON válido');
            }
          } catch (error) {
            throw new Error('contactos debe ser un JSON válido');
          }
        }
        return true;
      }),

    // ✅ Aceptar strings (FormData)
    body('categoriasIds').optional(),

    body('categoriasIds.*')
      .optional()
      .custom((value) => {
        const num = parseInt(value);
        if (isNaN(num) || num < 1) {
          throw new Error('ID de categoría inválido');
        }
        return true;
      }),

    body('logoExistente').optional().isString(),

    manejarErroresValidacion
  ],
  actualizarRally
);

// ========================================
// RESTO DE RUTAS (sin cambios)
// ========================================
router.patch(
  '/:id/reprogramar',
  verificarAutenticacion,
  esCreadorFechas,
  puedeEditarRally,
  [
    param('id').isInt({ min: 1 }).withMessage('ID de rally inválido'),
    body('nuevaFecha')
      .notEmpty().withMessage('La nueva fecha es obligatoria')
      .isISO8601().withMessage('La fecha debe tener un formato válido')
      .custom((value) => {
        const fecha = new Date(value);
        const ahora = new Date();
        if (fecha <= ahora) {
          throw new Error('La nueva fecha debe ser futura');
        }
        return true;
      }),
    manejarErroresValidacion
  ],
  reprogramarRally
);

router.patch(
  '/:id/resultados',
  verificarAutenticacion,
  esCreadorFechas,
  puedeEditarRally,
  [
    param('id').isInt({ min: 1 }).withMessage('ID de rally inválido'),
    body('resultados')
      .notEmpty().withMessage('Los resultados son obligatorios')
      .trim()
      .isLength({ max: 5000 }),
    manejarErroresValidacion
  ],
  cargarResultados
);

router.post(
  '/:id/categorias',
  verificarAutenticacion,
  esCreadorFechas,
  puedeEditarRally,
  [
    param('id').isInt({ min: 1 }).withMessage('ID de rally inválido'),
    body('categoriaId')
      .notEmpty().withMessage('El ID de categoría es obligatorio')
      .isInt({ min: 1 }).withMessage('ID de categoría inválido'),
    manejarErroresValidacion
  ],
  habilitarCategoria
);

router.delete(
  '/:id/categorias/:categoriaId',
  verificarAutenticacion,
  esCreadorFechas,
  puedeEditarRally,
  [
    param('id').isInt({ min: 1 }).withMessage('ID de rally inválido'),
    param('categoriaId').isInt({ min: 1 }).withMessage('ID de categoría inválido'),
    manejarErroresValidacion
  ],
  deshabilitarCategoria
);

router.delete(
  '/:id',
  verificarAutenticacion,
  esCreadorFechas,
  puedeEditarRally,
  [
    param('id').isInt({ min: 1 }).withMessage('ID de rally inválido'),
    manejarErroresValidacion
  ],
  eliminarRally
);

export default router;