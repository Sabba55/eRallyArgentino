import express from 'express';
import { body, param, query } from 'express-validator';
import multer from 'multer';
import {
  listarVehiculos,
  listarDisponibles,
  obtenerVehiculo,
  crearVehiculo,
  actualizarVehiculo,
  cambiarDisponibilidad,
  actualizarPrecios,
  eliminarVehiculo,
  asignarCategoria,
  eliminarCategoria
} from '../controladores/vehiculosControlador.js';
import { verificarAutenticacion } from '../middlewares/autenticacion.js';
import { esAdmin } from '../middlewares/esAdmin.js';
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
// LISTAR VEHÍCULOS DISPONIBLES (PÚBLICO)
// GET /api/vehiculos/disponibles
// ========================================
router.get('/disponibles', listarDisponibles);

// ========================================
// LISTAR TODOS LOS VEHÍCULOS
// GET /api/vehiculos
// ========================================
router.get(
  '/',
  [
    query('disponible').optional().isBoolean().withMessage('disponible debe ser true o false'),
    query('marca').optional().trim().isLength({ min: 1, max: 50 }),
    query('categoriaId').optional().isInt({ min: 1 }),
    query('limite').optional().isInt({ min: 1, max: 200 }),
    query('pagina').optional().isInt({ min: 1 }),
    manejarErroresValidacion
  ],
  listarVehiculos
);

// ========================================
// OBTENER VEHÍCULO POR ID (PÚBLICO)
// GET /api/vehiculos/:id
// ========================================
router.get(
  '/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('ID de vehículo inválido'),
    manejarErroresValidacion
  ],
  obtenerVehiculo
);

// ========================================
// CREAR VEHÍCULO (ADMIN)
// POST /api/vehiculos
// ========================================
router.post(
  '/',
  verificarAutenticacion,
  esAdmin,
  upload.single('foto'),
  [
    body('marca')
      .trim()
      .notEmpty().withMessage('La marca es obligatoria')
      .isLength({ min: 1, max: 50 }).withMessage('La marca debe tener entre 1 y 50 caracteres'),

    body('nombre')
      .trim()
      .notEmpty().withMessage('El nombre es obligatorio')
      .isLength({ min: 1, max: 100 }).withMessage('El nombre debe tener entre 1 y 100 caracteres'),

    body('descripcion')
      .optional()
      .trim()
      .isLength({ max: 500 }),

    body('precioCompra')
      .notEmpty().withMessage('El precio de compra es obligatorio')
      .isFloat({ min: 0.01 }).withMessage('El precio de compra debe ser mayor a 0'),

    body('precioAlquiler')
      .notEmpty().withMessage('El precio de alquiler es obligatorio')
      .isFloat({ min: 0.01 }).withMessage('El precio de alquiler debe ser mayor a 0'),

    // ✅ Aceptar tanto strings como números (FormData siempre envía strings)
    body('categoriasIds')
      .optional(),

    body('categoriasIds.*')
      .optional()
      .custom((value) => {
        const num = parseInt(value);
        if (isNaN(num) || num < 1) {
          throw new Error('ID de categoría inválido');
        }
        return true;
      }),

    manejarErroresValidacion
  ],
  crearVehiculo
);

// ========================================
// ACTUALIZAR VEHÍCULO (ADMIN)
// PUT /api/vehiculos/:id
// ========================================
router.put(
  '/:id',
  verificarAutenticacion,
  esAdmin,
  upload.single('foto'),
  [
    param('id').isInt({ min: 1 }).withMessage('ID de vehículo inválido'),

    body('marca').optional().trim().isLength({ min: 1, max: 50 }),
    body('nombre').optional().trim().isLength({ min: 1, max: 100 }),
    body('descripcion').optional().trim().isLength({ max: 500 }),

    body('precioCompra')
      .optional()
      .isFloat({ min: 0.01 }).withMessage('El precio de compra debe ser mayor a 0'),

    body('precioAlquiler')
      .optional()
      .isFloat({ min: 0.01 }).withMessage('El precio de alquiler debe ser mayor a 0'),

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

    manejarErroresValidacion
  ],
  actualizarVehiculo
);

// ========================================
// CAMBIAR DISPONIBILIDAD (ADMIN)
// PATCH /api/vehiculos/:id/disponibilidad
// ========================================
router.patch(
  '/:id/disponibilidad',
  verificarAutenticacion,
  esAdmin,
  [
    param('id').isInt({ min: 1 }).withMessage('ID de vehículo inválido'),
    body('disponible').notEmpty().isBoolean().withMessage('disponible debe ser true o false'),
    manejarErroresValidacion
  ],
  cambiarDisponibilidad
);

// ========================================
// ACTUALIZAR PRECIOS (ADMIN)
// PATCH /api/vehiculos/:id/precios
// ========================================
router.patch(
  '/:id/precios',
  verificarAutenticacion,
  esAdmin,
  [
    param('id').isInt({ min: 1 }).withMessage('ID de vehículo inválido'),
    body('precioCompra').optional().isFloat({ min: 0.01 }),
    body('precioAlquiler').optional().isFloat({ min: 0.01 }),
    body().custom((value) => {
      if (!value.precioCompra && !value.precioAlquiler) {
        throw new Error('Debes especificar al menos un precio para actualizar');
      }
      return true;
    }),
    manejarErroresValidacion
  ],
  actualizarPrecios
);

// ========================================
// ASIGNAR CATEGORÍA A VEHÍCULO (ADMIN)
// POST /api/vehiculos/:id/categorias
// ========================================
router.post(
  '/:id/categorias',
  verificarAutenticacion,
  esAdmin,
  [
    param('id').isInt({ min: 1 }).withMessage('ID de vehículo inválido'),
    body('categoriaId').notEmpty().isInt({ min: 1 }).withMessage('ID de categoría inválido'),
    manejarErroresValidacion
  ],
  asignarCategoria
);

// ========================================
// ELIMINAR CATEGORÍA DE VEHÍCULO (ADMIN)
// DELETE /api/vehiculos/:id/categorias/:categoriaId
// ========================================
router.delete(
  '/:id/categorias/:categoriaId',
  verificarAutenticacion,
  esAdmin,
  [
    param('id').isInt({ min: 1 }).withMessage('ID de vehículo inválido'),
    param('categoriaId').isInt({ min: 1 }).withMessage('ID de categoría inválido'),
    manejarErroresValidacion
  ],
  eliminarCategoria
);

// ========================================
// ELIMINAR VEHÍCULO (ADMIN)
// DELETE /api/vehiculos/:id
// ========================================
router.delete(
  '/:id',
  verificarAutenticacion,
  esAdmin,
  [
    param('id').isInt({ min: 1 }).withMessage('ID de vehículo inválido'),
    manejarErroresValidacion
  ],
  eliminarVehiculo
);

export default router;