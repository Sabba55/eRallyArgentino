import express from 'express';
import { verificarAutenticacion } from '../middlewares/autenticacion.js';
import { esAdmin } from '../middlewares/esAdmin.js';
import { ejecutarLimpiezaManual, obtenerEstadisticasLimpieza } from '../tareas/limpiarVencimientos.js';

const router = express.Router();

// ========================================
// TODAS LAS RUTAS REQUIEREN ADMIN
// ========================================

// ========================================
// EJECUTAR LIMPIEZA MANUAL
// POST /api/admin/limpiar
// Ejecuta la limpieza de vencimientos inmediatamente
// ========================================
router.post(
  '/limpiar',
  verificarAutenticacion,
  esAdmin,
  async (req, res) => {
    try {
      const resultado = await ejecutarLimpiezaManual();
      res.json({
        ...resultado,
        mensaje: 'Limpieza ejecutada manualmente exitosamente'
      });
    } catch (error) {
      console.error('Error al ejecutar limpieza manual:', error);
      res.status(500).json({
        error: 'Error al ejecutar limpieza',
        detalle: error.message
      });
    }
  }
);

// ========================================
// OBTENER ESTADÍSTICAS DE LIMPIEZA
// GET /api/admin/estadisticas-limpieza
// Muestra cuántos elementos necesitan ser limpiados
// ========================================
router.get(
  '/estadisticas-limpieza',
  verificarAutenticacion,
  esAdmin,
  async (req, res) => {
    try {
      const estadisticas = await obtenerEstadisticasLimpieza();
      res.json({
        estadisticas,
        mensaje: estadisticas.total > 0 
          ? `Hay ${estadisticas.total} elemento(s) que necesitan limpieza`
          : 'No hay elementos que necesiten limpieza'
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({
        error: 'Error al obtener estadísticas',
        detalle: error.message
      });
    }
  }
);

// ========================================
// ESTADÍSTICAS GENERALES DEL SISTEMA
// GET /api/admin/estadisticas
// ========================================
router.get(
  '/estadisticas',
  verificarAutenticacion,
  esAdmin,
  async (req, res) => {
    try {
      const { Usuario, Vehiculo, Rally, Compra, Alquiler, Categoria } = await import('../modelos/index.js');

      const [
        totalUsuarios,
        totalVehiculos,
        totalRallies,
        totalCategorias,
        totalCompras,
        totalAlquileres,
        comprasActivas,
        alquileresActivos
      ] = await Promise.all([
        Usuario.count(),
        Vehiculo.count(),
        Rally.count(),
        Categoria.count(),
        Compra.count(),
        Alquiler.count(),
        Compra.count({ where: { estado: 'aprobado' } }),
        Alquiler.count({ where: { estado: 'aprobado' } })
      ]);

      res.json({
        usuarios: {
          total: totalUsuarios
        },
        vehiculos: {
          total: totalVehiculos
        },
        rallies: {
          total: totalRallies
        },
        categorias: {
          total: totalCategorias
        },
        transacciones: {
          compras: {
            total: totalCompras,
            activas: comprasActivas
          },
          alquileres: {
            total: totalAlquileres,
            activos: alquileresActivos
          }
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error al obtener estadísticas del sistema:', error);
      res.status(500).json({
        error: 'Error al obtener estadísticas',
        detalle: error.message
      });
    }
  }
);

export default router;