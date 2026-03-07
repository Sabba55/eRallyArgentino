import cron from 'node-cron';
import { Op } from 'sequelize';
import Compra from '../modelos/Compra.js';
import Alquiler from '../modelos/Alquiler.js';

// ========================================
// LIMPIAR PAGOS PENDIENTES ABANDONADOS
// ========================================
const limpiarPendientesAbandonados = async () => {
  try {
    console.log('🧹 Iniciando limpieza de pendientes abandonados...');

    const ahora = new Date();

    // PayPal: órdenes expiran en 3 horas
    const limitePayPal = new Date(ahora - 3 * 60 * 60 * 1000);

    // MercadoPago: preferencias expiran en 24 horas
    const limiteMP = new Date(ahora - 24 * 60 * 60 * 1000);

    // --- COMPRAS ---
    const comprasPendientes = await Compra.findAll({
      where: {
        estado: 'pendiente',
        [Op.or]: [
          {
            metodoPago: 'PayPal',
            createdAt: { [Op.lt]: limitePayPal }
          },
          {
            metodoPago: 'MercadoPago',
            createdAt: { [Op.lt]: limiteMP }
          }
        ]
      }
    });

    for (const compra of comprasPendientes) {
      await compra.rechazar();
      console.log(`🗑️ Compra #${compra.id} (${compra.metodoPago}) expirada y rechazada`);
    }

    // --- ALQUILERES ---
    const alquileresPendientes = await Alquiler.findAll({
      where: {
        estado: 'pendiente',
        [Op.or]: [
          {
            metodoPago: 'PayPal',
            createdAt: { [Op.lt]: limitePayPal }
          },
          {
            metodoPago: 'MercadoPago',
            createdAt: { [Op.lt]: limiteMP }
          }
        ]
      }
    });

    for (const alquiler of alquileresPendientes) {
      await alquiler.rechazar();
      console.log(`🗑️ Alquiler #${alquiler.id} (${alquiler.metodoPago}) expirado y rechazado`);
    }

    // --- COMPRAS APROBADAS VENCIDAS ---
    const comprasVencidas = await Compra.obtenerVencidas();
    for (const compra of comprasVencidas) {
      await compra.marcarVencida();
    }

    // --- ALQUILERES APROBADOS VENCIDOS ---
    const alquilresVencidos = await Alquiler.obtenerVencidos();
    for (const alquiler of alquilresVencidos) {
      await alquiler.marcarVencido();
    }

    console.log(`✅ Limpieza completada. Compras pendientes: ${comprasPendientes.length}, Alquileres pendientes: ${alquileresPendientes.length}, Compras vencidas: ${comprasVencidas.length}, Alquileres vencidos: ${alquilresVencidos.length}`);

  } catch (error) {
    console.error('❌ Error en limpieza de pendientes:', error);
  }
};

// ========================================
// PROGRAMAR TAREAS
// ========================================

// Corre todos los días a las 3:00 AM
export const iniciarLimpiezaPendientes  = () => {
  cron.schedule('0 3 * * *', limpiarPendientesAbandonados, {
    timezone: 'America/Argentina/Buenos_Aires'
  });

  console.log('⏰ Tareas programadas iniciadas (limpieza diaria a las 3:00 AM)');
};

// Para ejecutar manualmente desde consola o tests
export const ejecutarLimpiezaManual = async () => {
  console.log('🔧 Ejecutando limpieza manual...');
  await limpiarPendientesAbandonados();
};

export default iniciarLimpiezaPendientes ;