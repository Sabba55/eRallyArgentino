import cron from 'node-cron';
import { Compra, Alquiler, TokenVerificacion } from '../modelos/index.js';
import { Op } from 'sequelize';

// ========================================
// LIMPIAR COMPRAS VENCIDAS
// ========================================
const limpiarComprasVencidas = async () => {
  try {
    console.log('[CRON] Iniciando limpieza de compras vencidas...');

    const comprasVencidas = await Compra.obtenerVencidas();

    if (comprasVencidas.length === 0) {
      console.log('[CRON] No hay compras vencidas para procesar');
      return;
    }

    let contador = 0;
    for (const compra of comprasVencidas) {
      await compra.marcarVencida();
      contador++;
    }

    console.log(`[CRON] ✅ ${contador} compra(s) marcada(s) como vencida(s)`);
  } catch (error) {
    console.error('[CRON] ❌ Error al limpiar compras vencidas:', error);
  }
};

// ========================================
// LIMPIAR ALQUILERES VENCIDOS
// ========================================
const limpiarAlquileresVencidos = async () => {
  try {
    console.log('[CRON] Iniciando limpieza de alquileres vencidos...');

    const alquileresVencidos = await Alquiler.obtenerVencidos();

    if (alquileresVencidos.length === 0) {
      console.log('[CRON] No hay alquileres vencidos para procesar');
      return;
    }

    let contador = 0;
    for (const alquiler of alquileresVencidos) {
      await alquiler.marcarVencido();
      contador++;
    }

    console.log(`[CRON] ✅ ${contador} alquiler(es) marcado(s) como vencido(s)`);
  } catch (error) {
    console.error('[CRON] ❌ Error al limpiar alquileres vencidos:', error);
  }
};

// ========================================
// LIMPIAR TOKENS EXPIRADOS
// ========================================
const limpiarTokensExpirados = async () => {
  try {
    console.log('[CRON] Iniciando limpieza de tokens expirados...');

    const tokensEliminados = await TokenVerificacion.limpiarTokensExpirados();

    if (tokensEliminados === 0) {
      console.log('[CRON] No hay tokens expirados para eliminar');
      return;
    }

    console.log(`[CRON] ✅ ${tokensEliminados} token(s) expirado(s) eliminado(s)`);
  } catch (error) {
    console.error('[CRON] ❌ Error al limpiar tokens expirados:', error);
  }
};

// ========================================
// TAREA PRINCIPAL: LIMPIAR TODO
// ========================================
const limpiarVencimientos = async () => {
  console.log('\n========================================');
  console.log(`[CRON] 🕒 Tarea programada iniciada - ${new Date().toLocaleString('es-AR')}`);
  console.log('========================================\n');

  try {
    // Ejecutar todas las limpiezas en paralelo
    await Promise.all([
      limpiarComprasVencidas(),
      limpiarAlquileresVencidos(),
      limpiarTokensExpirados()
    ]);

    console.log('\n========================================');
    console.log('[CRON] ✅ Tarea programada completada exitosamente');
    console.log('========================================\n');
  } catch (error) {
    console.error('\n========================================');
    console.error('[CRON] ❌ Error en tarea programada:', error);
    console.error('========================================\n');
  }
};

// ========================================
// PROGRAMAR TAREA CON CRON
// ========================================

/**
 * Inicia el cron job
 * Por defecto corre todos los días a las 3:00 AM
 */
export const iniciarTareasProgramadas = () => {
  // Formato cron: segundo minuto hora dia mes día-semana
  // '0 3 * * *' = Todos los días a las 3:00 AM
  
  const HORARIO_CRON = '0 3 * * *'; // 3:00 AM todos los días

  console.log('\n========================================');
  console.log('[CRON] 🚀 Iniciando sistema de tareas programadas...');
  console.log(`[CRON] ⏰ Horario configurado: Todos los días a las 3:00 AM`);
  console.log('========================================\n');

  // Programar tarea
  cron.schedule(HORARIO_CRON, limpiarVencimientos, {
    timezone: 'America/Argentina/Buenos_Aires'
  });

  console.log('[CRON] ✅ Tareas programadas activadas correctamente\n');

  // Opcional: ejecutar inmediatamente al iniciar (útil para testing)
  if (process.env.EJECUTAR_CRON_AL_INICIAR === 'true') {
    console.log('[CRON] 🔄 Ejecutando limpieza inicial...\n');
    limpiarVencimientos();
  }
};

// ========================================
// EJECUTAR MANUALMENTE (útil para testing)
// ========================================

/**
 * Ejecuta la limpieza de forma manual
 * Útil para llamar desde una ruta admin
 */
export const ejecutarLimpiezaManual = async () => {
  console.log('[CRON] 🔧 Ejecución manual solicitada');
  await limpiarVencimientos();
  return {
    mensaje: 'Limpieza ejecutada manualmente',
    timestamp: new Date(ejecutarLimpiezaManual)
  };
};

// ========================================
// ESTADÍSTICAS DE LIMPIEZA
// ========================================

/**
 * Obtiene estadísticas de elementos que necesitan limpieza
 * Útil para dashboard admin
 */
export const obtenerEstadisticasLimpieza = async () => {
  try {
    const [comprasVencidas, alquileresVencidos, tokensExpirados] = await Promise.all([
      Compra.count({
        where: {
          estado: 'aprobado',
          fechaVencimiento: { [Op.lt]: new Date() }
        }
      }),
      Alquiler.count({
        where: {
          estado: 'aprobado',
          [Op.or]: [
            { fechaFinalizacion: { [Op.lt]: new Date() } },
            {
              fechaReprogramada: {
                [Op.ne]: null,
                [Op.lt]: new Date()
              }
            }
          ]
        }
      }),
      TokenVerificacion.count({
        where: {
          expiraEn: { [Op.lt]: new Date() },
          usado: false
        }
      })
    ]);

    return {
      comprasVencidas,
      alquileresVencidos,
      tokensExpirados,
      total: comprasVencidas + alquileresVencidos + tokensExpirados,
      ultimaEjecucion: null // Se puede guardar en un modelo si se necesita
    };
  } catch (error) {
    console.error('Error al obtener estadísticas de limpieza:', error);
    throw error;
  }
};

// ========================================
// TAREAS ADICIONALES (OPCIONALES)
// ========================================

/**
 * Envía un reporte diario por email al admin
 * (Opcional - descomentar si se necesita)
 */
/*
import { enviarEmailReporteDiario } from '../utilidades/enviarEmail.js';

const enviarReporteDiario = async () => {
  try {
    const stats = await obtenerEstadisticasLimpieza();
    
    await enviarEmailReporteDiario(
      process.env.EMAIL_ADMIN,
      'Admin',
      stats
    );

    console.log('[CRON] ✅ Reporte diario enviado');
  } catch (error) {
    console.error('[CRON] ❌ Error al enviar reporte diario:', error);
  }
};
*/

/**
 * Limpia compras y alquileres rechazados antiguos (más de 30 días)
 * (Opcional - descomentar si se necesita)
 */
/*
const limpiarTransaccionesRechazadasAntiguas = async () => {
  try {
    console.log('[CRON] Limpiando transacciones rechazadas antiguas...');

    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    const comprasEliminadas = await Compra.destroy({
      where: {
        estado: 'rechazado',
        createdAt: { [Op.lt]: hace30Dias }
      }
    });

    const alquileresEliminados = await Alquiler.destroy({
      where: {
        estado: 'rechazado',
        createdAt: { [Op.lt]: hace30Dias }
      }
    });

    console.log(`[CRON] ✅ ${comprasEliminadas + alquileresEliminados} transacción(es) rechazada(s) eliminada(s)`);
  } catch (error) {
    console.error('[CRON] ❌ Error al limpiar transacciones rechazadas:', error);
  }
};
*/

export default {
  iniciarTareasProgramadas,
  ejecutarLimpiezaManual,
  obtenerEstadisticasLimpieza,
  limpiarVencimientos
};