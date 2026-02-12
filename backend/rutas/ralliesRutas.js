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
import { manejarErroresValidacion } from '../middlewares/validaciones.js';

const router = express.Router();

// Configurar multer para subir imágenes
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  },
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
// LISTAR PRÓXIMOS RALLIES (PÚBLICO)
// GET /api/rallies/proximos
// ========================================
router.get('/proximos', listarProximos);

// ========================================
// LISTAR RALLIES PASADOS (PÚBLICO)
// GET /api/rallies/pasados
// ========================================
router.get('/pasados', listarPasados);

// ========================================
// LISTAR TODOS LOS RALLIES
// GET /api/rallies
// Público con filtros opcionales
// ========================================
router.get(
  '/',
  [
    query('campeonato')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 }).withMessage('El campeonato debe tener entre 1 y 100 caracteres'),

    query('estado')
      .optional()
      .isIn(['todos', 'proximos', 'pasados']).withMessage('Estado debe ser: todos, proximos o pasados'),

    query('limite')
      .optional()
      .isInt({ min: 1, max: 200 }).withMessage('Límite debe ser entre 1 y 200'),

    query('pagina')
      .optional()
      .isInt({ min: 1 }).withMessage('Página debe ser mayor a 0'),

    manejarErroresValidacion
  ],
  listarRallies
);

// ========================================
// OBTENER RALLY POR ID (PÚBLICO)
// GET /api/rallies/:id
// ========================================
router.get(
  '/:id',
  [
    param('id')
      .isInt({ min: 1 }).withMessage('ID de rally inválido'),

    manejarErroresValidacion
  ],
  obtenerRally
);

// ========================================
// CREAR RALLY (CREADOR FECHAS / ADMIN)
// POST /api/rallies
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
      .isLength({ min: 1, max: 100 }).withMessage('El campeonato debe tener entre 1 y 100 caracteres'),

    body('nombre')
      .trim()
      .notEmpty().withMessage('El nombre es obligatorio')
      .isLength({ min: 1, max: 150 }).withMessage('El nombre debe tener entre 1 y 150 caracteres'),

    body('subtitulo')
      .optional()
      .trim()
      .isLength({ max: 200 }).withMessage('El subtítulo no puede tener más de 200 caracteres'),

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
            const contactos = JSON.parse(value);
            // Validar estructura básica
            if (typeof contactos !== 'object') {
              throw new Error('contactos debe ser un objeto JSON válido');
            }
          } catch (error) {
            throw new Error('contactos debe ser un JSON válido');
          }
        }
        return true;
      }),

    body('categoriasIds')
      .optional()
      .isArray().withMessage('categoriasIds debe ser un array'),

    body('categoriasIds.*')
      .optional()
      .isInt({ min: 1 }).withMessage('ID de categoría inválido'),

    manejarErroresValidacion
  ],
  crearRally
);

// ========================================
// ACTUALIZAR RALLY (CREADOR FECHAS / ADMIN)
// PUT /api/rallies/:id
// ========================================
router.put(
  '/:id',
  verificarAutenticacion,
  esCreadorFechas,
  upload.single('logo'),
  [
    param('id')
      .isInt({ min: 1 }).withMessage('ID de rally inválido'),

    body('campeonato')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 }).withMessage('El campeonato debe tener entre 1 y 100 caracteres'),

    body('nombre')
      .optional()
      .trim()
      .isLength({ min: 1, max: 150 }).withMessage('El nombre debe tener entre 1 y 150 caracteres'),

    body('subtitulo')
      .optional()
      .trim()
      .isLength({ max: 200 }).withMessage('El subtítulo no puede tener más de 200 caracteres'),

    body('contactos')
      .optional()
      .custom((value) => {
        if (value) {
          try {
            const contactos = JSON.parse(value);
            if (typeof contactos !== 'object') {
              throw new Error('contactos debe ser un objeto JSON válido');
            }
          } catch (error) {
            throw new Error('contactos debe ser un JSON válido');
          }
        }
        return true;
      }),

    body('categoriasIds')
      .optional()
      .isArray().withMessage('categoriasIds debe ser un array'),

    body('categoriasIds.*')
      .optional()
      .isInt({ min: 1 }).withMessage('ID de categoría inválido'),

    manejarErroresValidacion
  ],
  actualizarRally
);

// ========================================
// REPROGRAMAR RALLY (CREADOR FECHAS / ADMIN)
// PATCH /api/rallies/:id/reprogramar
// ========================================
router.patch(
  '/:id/reprogramar',
  verificarAutenticacion,
  esCreadorFechas,
  [
    param('id')
      .isInt({ min: 1 }).withMessage('ID de rally inválido'),

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

// ========================================
// CARGAR RESULTADOS (CREADOR FECHAS / ADMIN)
// PATCH /api/rallies/:id/resultados
// ========================================
router.patch(
  '/:id/resultados',
  verificarAutenticacion,
  esCreadorFechas,
  [
    param('id')
      .isInt({ min: 1 }).withMessage('ID de rally inválido'),

    body('resultados')
      .notEmpty().withMessage('Los resultados son obligatorios')
      .trim()
      .isLength({ max: 5000 }).withMessage('Los resultados no pueden tener más de 5000 caracteres'),

    manejarErroresValidacion
  ],
  cargarResultados
);

// ========================================
// HABILITAR CATEGORÍA EN RALLY (CREADOR FECHAS / ADMIN)
// POST /api/rallies/:id/categorias
// ========================================
router.post(
  '/:id/categorias',
  verificarAutenticacion,
  esCreadorFechas,
  [
    param('id')
      .isInt({ min: 1 }).withMessage('ID de rally inválido'),

    body('categoriaId')
      .notEmpty().withMessage('El ID de categoría es obligatorio')
      .isInt({ min: 1 }).withMessage('ID de categoría inválido'),

    manejarErroresValidacion
  ],
  habilitarCategoria
);

// ========================================
// DESHABILITAR CATEGORÍA DE RALLY (CREADOR FECHAS / ADMIN)
// DELETE /api/rallies/:id/categorias/:categoriaId
// ========================================
router.delete(
  '/:id/categorias/:categoriaId',
  verificarAutenticacion,
  esCreadorFechas,
  [
    param('id')
      .isInt({ min: 1 }).withMessage('ID de rally inválido'),

    param('categoriaId')
      .isInt({ min: 1 }).withMessage('ID de categoría inválido'),

    manejarErroresValidacion
  ],
  deshabilitarCategoria
);

// ========================================
// ELIMINAR RALLY (ADMIN)
// DELETE /api/rallies/:id
// ========================================
router.delete(
  '/:id',
  verificarAutenticacion,
  esAdmin,
  [
    param('id')
      .isInt({ min: 1 }).withMessage('ID de rally inválido'),

    manejarErroresValidacion
  ],
  eliminarRally
);

export default router;