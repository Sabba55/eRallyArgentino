import express from 'express';
import { body, query, param } from 'express-validator'
import {
  crearCompraMercadoPago,
  crearCompraPayPal,
  crearAlquilerMercadoPago,
  crearAlquilerPayPal,
  webhookMercadoPago,
  webhookPayPal,
  listarMisCompras,
  listarMisAlquileres
} from '../controladores/pagosControlador.js';
import { verificarAutenticacion } from '../middlewares/autenticacion.js';
import { verificarEmail } from '../middlewares/emailVerificado.js';
import { manejarErroresValidacion } from '../middlewares/validaciones.js';
import { obtenerPreciosVehiculo } from '../controladores/pagosControlador.js';

const router = express.Router();

// ========================================
// WEBHOOKS (PÚBLICOS - NO REQUIEREN AUTH)
// ========================================

// Webhook de Mercado Pago
// POST /api/pagos/webhook/mercadopago
router.post('/webhook/mercadopago', webhookMercadoPago);

// Webhook de PayPal
// POST /api/pagos/webhook/paypal
router.post('/webhook/paypal', webhookPayPal);

// ========================================
// COMPRAS
// ========================================

// Crear compra con Mercado Pago (ARS)
// POST /api/pagos/compras/mercadopago
router.post(
  '/compras/mercadopago',
  verificarAutenticacion,
  verificarEmail,
  [
    body('vehiculoId')
      .notEmpty().withMessage('El ID del vehículo es obligatorio')
      .isInt({ min: 1 }).withMessage('ID de vehículo inválido'),

    manejarErroresValidacion
  ],
  crearCompraMercadoPago
);

// Crear compra con PayPal (USD)
// POST /api/pagos/compras/paypal
router.post(
  '/compras/paypal',
  verificarAutenticacion,
  verificarEmail,
  [
    body('vehiculoId')
      .notEmpty().withMessage('El ID del vehículo es obligatorio')
      .isInt({ min: 1 }).withMessage('ID de vehículo inválido'),

    manejarErroresValidacion
  ],
  crearCompraPayPal
);

// Listar mis compras
// GET /api/pagos/compras
router.get(
  '/compras',
  verificarAutenticacion,
  [
    query('estado')
      .optional()
      .isIn(['pendiente', 'aprobado', 'rechazado', 'vencido']).withMessage('Estado inválido'),

    manejarErroresValidacion
  ],
  listarMisCompras
);

// ========================================
// ALQUILERES
// ========================================

// Crear alquiler con Mercado Pago (ARS)
// POST /api/pagos/alquileres/mercadopago
router.post(
  '/alquileres/mercadopago',
  verificarAutenticacion,
  verificarEmail,
  [
    body('vehiculoId')
      .notEmpty().withMessage('El ID del vehículo es obligatorio')
      .isInt({ min: 1 }).withMessage('ID de vehículo inválido'),

    body('rallyId')
      .notEmpty().withMessage('El ID del rally es obligatorio')
      .isInt({ min: 1 }).withMessage('ID de rally inválido'),

    manejarErroresValidacion
  ],
  crearAlquilerMercadoPago
);

// Crear alquiler con PayPal (USD)
// POST /api/pagos/alquileres/paypal
router.post(
  '/alquileres/paypal',
  verificarAutenticacion,
  verificarEmail,
  [
    body('vehiculoId')
      .notEmpty().withMessage('El ID del vehículo es obligatorio')
      .isInt({ min: 1 }).withMessage('ID de vehículo inválido'),

    body('rallyId')
      .notEmpty().withMessage('El ID del rally es obligatorio')
      .isInt({ min: 1 }).withMessage('ID de rally inválido'),

    manejarErroresValidacion
  ],
  crearAlquilerPayPal
);

// Listar mis alquileres
// GET /api/pagos/alquileres
router.get(
  '/alquileres',
  verificarAutenticacion,
  [
    query('estado')
      .optional()
      .isIn(['pendiente', 'aprobado', 'rechazado', 'vencido', 'rally_cancelado']).withMessage('Estado inválido'),

    manejarErroresValidacion
  ],
  listarMisAlquileres
);

// Precio público, no requiere auth (el usuario lo ve antes de loguearse en la tienda)
router.get(
  '/precios/:vehiculoId',
  [
    param('vehiculoId')
      .isInt({ min: 1 }).withMessage('ID de vehículo inválido'),
    manejarErroresValidacion
  ],
  obtenerPreciosVehiculo
);

export default router;