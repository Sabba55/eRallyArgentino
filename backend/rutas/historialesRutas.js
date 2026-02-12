import express from 'express';
import { param, query } from 'express-validator';
import {
  listarHistorial,
  obtenerHistorialUsuario,
  obtenerParticipantesRally,
  obtenerHistorialVehiculo,
  obtenerEstadisticasGenerales,
  exportarHistorialCSV,
  buscarHistorial
} from '../controladores/historialesControlador.js';
import { verificarAutenticacion } from '../middlewares/autenticacion.js';
import { esAdmin } from '../middlewares/esAdmin.js';
import { manejarErroresValidacion } from '../middlewares/validaciones.js';

const router = express.Router();

// ========================================
// TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN Y ROL ADMIN
// ========================================

// ========================================
// LISTAR TODO EL HISTORIAL
// GET /api/historiales
// ========================================
router.get(
  '/',
  verificarAutenticacion,
  esAdmin,
  [
    query('usuarioId')
      .optional()
      .isInt({ min: 1 }).withMessage('ID de usuario inválido'),

    query('rallyId')
      .optional()
      .isInt({ min: 1 }).withMessage('ID de rally inválido'),

    query('vehiculoId')
      .optional()
      .isInt({ min: 1 }).withMessage('ID de vehículo inválido'),

    query('tipoTransaccion')
      .optional()
      .isIn(['compra', 'alquiler']).withMessage('Tipo de transacción inválido'),

    query('limite')
      .optional()
      .isInt({ min: 1, max: 500 }).withMessage('Límite debe ser entre 1 y 500'),

    query('pagina')
      .optional()
      .isInt({ min: 1 }).withMessage('Página debe ser mayor a 0'),

    manejarErroresValidacion
  ],
  listarHistorial
);

// ========================================
// BUSCAR EN HISTORIAL
// GET /api/historiales/buscar
// ========================================
router.get(
  '/buscar',
  verificarAutenticacion,
  esAdmin,
  [
    query('termino')
      .trim()
      .notEmpty().withMessage('El término de búsqueda es obligatorio')
      .isLength({ min: 3 }).withMessage('El término debe tener al menos 3 caracteres'),

    manejarErroresValidacion
  ],
  buscarHistorial
);

// ========================================
// ESTADÍSTICAS GENERALES
// GET /api/historiales/estadisticas
// ========================================
router.get(
  '/estadisticas',
  verificarAutenticacion,
  esAdmin,
  obtenerEstadisticasGenerales
);

// ========================================
// EXPORTAR HISTORIAL A CSV
// GET /api/historiales/exportar
// ========================================
router.get(
  '/exportar',
  verificarAutenticacion,
  esAdmin,
  [
    query('rallyId')
      .optional()
      .isInt({ min: 1 }).withMessage('ID de rally inválido'),

    query('desde')
      .optional()
      .isISO8601().withMessage('Fecha "desde" inválida'),

    query('hasta')
      .optional()
      .isISO8601().withMessage('Fecha "hasta" inválida'),

    query()
      .custom((value) => {
        if ((value.desde && !value.hasta) || (!value.desde && value.hasta)) {
          throw new Error('Debes proporcionar tanto "desde" como "hasta" para filtrar por fechas');
        }
        return true;
      }),

    manejarErroresValidacion
  ],
  exportarHistorialCSV
);

// ========================================
// HISTORIAL DE UN USUARIO
// GET /api/historiales/usuarios/:usuarioId
// ========================================
router.get(
  '/usuarios/:usuarioId',
  verificarAutenticacion,
  esAdmin,
  [
    param('usuarioId')
      .isInt({ min: 1 }).withMessage('ID de usuario inválido'),

    manejarErroresValidacion
  ],
  obtenerHistorialUsuario
);

// ========================================
// PARTICIPANTES DE UN RALLY
// GET /api/historiales/rallies/:rallyId
// ========================================
router.get(
  '/rallies/:rallyId',
  verificarAutenticacion,
  esAdmin,
  [
    param('rallyId')
      .isInt({ min: 1 }).withMessage('ID de rally inválido'),

    manejarErroresValidacion
  ],
  obtenerParticipantesRally
);

// ========================================
// HISTORIAL DE UN VEHÍCULO
// GET /api/historiales/vehiculos/:vehiculoId
// ========================================
router.get(
  '/vehiculos/:vehiculoId',
  verificarAutenticacion,
  esAdmin,
  [
    param('vehiculoId')
      .isInt({ min: 1 }).withMessage('ID de vehículo inválido'),

    manejarErroresValidacion
  ],
  obtenerHistorialVehiculo
);

export default router;