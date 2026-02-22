import express from 'express';
import { body, param, query } from 'express-validator';
import multer from 'multer';
import {
  obtenerPerfil,
  actualizarPerfil,
  actualizarFotoPerfil,
  cambiarContraseña,
  verificarPassword,       
  obtenerMiGarage,
  listarUsuarios,
  cambiarRol,
  eliminarUsuario,
  obtenerComprasUsuario,
  obtenerAlquileresUsuario,
  eliminarCompra,
  eliminarAlquiler,
  cambiarRallyAlquiler
} from '../controladores/usuariosControlador.js';
import { verificarAutenticacion } from '../middlewares/autenticacion.js';
import { esAdmin, esAdminODueño } from '../middlewares/esAdmin.js';
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
// OBTENER PERFIL DE USUARIO (PÚBLICO)
// GET /api/usuarios/:id
// ========================================
router.get(
  '/:id',
  [
    param('id')
      .isInt({ min: 1 }).withMessage('ID de usuario inválido'),
    
    manejarErroresValidacion
  ],
  obtenerPerfil
);

// ========================================
// ACTUALIZAR MI PERFIL
// PUT /api/usuarios/perfil
// Requiere: autenticación
// ========================================
router.put(
  '/perfil',
  verificarAutenticacion,
  [
    body('nombre')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),

    body('equipo')
      .optional()
      .trim()
      .isLength({ max: 100 }).withMessage('El equipo no puede tener más de 100 caracteres'),

    manejarErroresValidacion
  ],
  actualizarPerfil
);

// ========================================
// ACTUALIZAR FOTO DE PERFIL
// PUT /api/usuarios/foto-perfil
// Requiere: autenticación
// ========================================
router.put(
  '/foto-perfil',
  verificarAutenticacion,
  upload.single('foto'),
  actualizarFotoPerfil
);

// ========================================
// Verificar CONTRASEÑA
// POST /api/usuarios/verificar-password
// ========================================
router.post(
  '/verificar-password',
  verificarAutenticacion,
  [
    body('contraseña')
      .notEmpty().withMessage('La contraseña es requerida'),
    manejarErroresValidacion
  ],
  verificarPassword
)

// ========================================
// CAMBIAR CONTRASEÑA
// PUT /api/usuarios/cambiar-password
// Requiere: autenticación
// ========================================
router.put(
  '/cambiar-password',
  verificarAutenticacion,
  [
    body('contraseñaActual')
      .notEmpty().withMessage('Debes ingresar tu contraseña actual'),

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
  cambiarContraseña
);

// ========================================
// OBTENER MI GARAGE
// GET /api/usuarios/garage
// Requiere: autenticación
// ========================================
router.get(
  '/garage/mis-vehiculos',
  verificarAutenticacion,
  obtenerMiGarage
);

// ========================================
// LISTAR TODOS LOS USUARIOS (ADMIN)
// GET /api/usuarios
// Requiere: admin
// ========================================
router.get(
  '/',
  verificarAutenticacion,
  esAdmin,
  [
    query('rol')
      .optional()
      .isIn(['usuario', 'creador_fechas', 'admin']).withMessage('Rol inválido'),

    query('emailVerificado')
      .optional()
      .isBoolean().withMessage('emailVerificado debe ser true o false'),

    query('limite')
      .optional()
      .isInt({ min: 1, max: 200 }).withMessage('Límite debe ser entre 1 y 200'),

    query('pagina')
      .optional()
      .isInt({ min: 1 }).withMessage('Página debe ser mayor a 0'),

    manejarErroresValidacion
  ],
  listarUsuarios
);

// ========================================
// CAMBIAR ROL DE USUARIO (ADMIN)
// PUT /api/usuarios/:id/rol
// Requiere: admin
// ========================================
router.put(
  '/:id/rol',
  verificarAutenticacion,
  esAdmin,
  [
    param('id')
      .isInt({ min: 1 }).withMessage('ID de usuario inválido'),

    body('rol')
      .notEmpty().withMessage('El rol es obligatorio')
      .isIn(['usuario', 'creador_fechas', 'admin']).withMessage('Rol inválido'),

    manejarErroresValidacion
  ],
  cambiarRol
);

// ========================================
// ELIMINAR USUARIO (ADMIN)
// DELETE /api/usuarios/:id
// Requiere: admin
// ========================================
router.delete(
  '/:id',
  verificarAutenticacion,
  esAdmin,
  [
    param('id')
      .isInt({ min: 1 }).withMessage('ID de usuario inválido'),

    manejarErroresValidacion
  ],
  eliminarUsuario
);

// ========================================
// OBTENER COMPRAS DE UN USUARIO (ADMIN)
// GET /api/usuarios/:id/compras
// ========================================
router.get(
  '/:id/compras',
  verificarAutenticacion,
  esAdmin,
  [
    param('id')
      .isInt({ min: 1 }).withMessage('ID de usuario inválido'),
    
    query('estado')
      .optional()
      .isIn(['pendiente', 'aprobado', 'rechazado', 'vencido']).withMessage('Estado inválido'),

    manejarErroresValidacion
  ],
  obtenerComprasUsuario
);

// ========================================
// OBTENER ALQUILERES DE UN USUARIO (ADMIN)
// GET /api/usuarios/:id/alquileres
// ========================================
router.get(
  '/:id/alquileres',
  verificarAutenticacion,
  esAdmin,
  [
    param('id')
      .isInt({ min: 1 }).withMessage('ID de usuario inválido'),
    
    query('estado')
      .optional()
      .isIn(['pendiente', 'aprobado', 'rechazado', 'vencido', 'rally_cancelado']).withMessage('Estado inválido'),

    manejarErroresValidacion
  ],
  obtenerAlquileresUsuario
);

// ========================================
// ELIMINAR COMPRA (ADMIN)
// DELETE /api/usuarios/compras/:id
// ========================================
router.delete(
  '/compras/:id',
  verificarAutenticacion,
  esAdmin,
  [
    param('id')
      .isInt({ min: 1 }).withMessage('ID de compra inválido'),

    manejarErroresValidacion
  ],
  eliminarCompra
);

// ========================================
// ELIMINAR ALQUILER (ADMIN)
// DELETE /api/usuarios/alquileres/:id
// ========================================
router.delete(
  '/alquileres/:id',
  verificarAutenticacion,
  esAdmin,
  [
    param('id')
      .isInt({ min: 1 }).withMessage('ID de alquiler inválido'),

    manejarErroresValidacion
  ],
  eliminarAlquiler
);

// ========================================
// CAMBIAR RALLY DE ALQUILER (ADMIN)
// PUT /api/usuarios/alquileres/:id/cambiar-rally
// ========================================
router.put(
  '/alquileres/:id/cambiar-rally',
  verificarAutenticacion,
  esAdmin,
  [
    param('id')
      .isInt({ min: 1 }).withMessage('ID de alquiler inválido'),

    body('rallyId')
      .notEmpty().withMessage('El ID del rally es obligatorio')
      .isInt({ min: 1 }).withMessage('ID de rally inválido'),

    manejarErroresValidacion
  ],
  cambiarRallyAlquiler
);

export default router;