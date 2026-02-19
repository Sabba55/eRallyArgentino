import express from 'express';
import { param, body } from 'express-validator';
import { verificarAutenticacion } from '../middlewares/autenticacion.js';
import { esAdmin } from '../middlewares/esAdmin.js';
import { manejarErroresValidacion } from '../middlewares/validaciones.js';
import { ejecutarLimpiezaManual, obtenerEstadisticasLimpieza } from '../tareas/limpiarVencimientos.js';

const router = express.Router();

// ========================================
// TODAS LAS RUTAS REQUIEREN ADMIN
// ========================================

// ========================================
// EJECUTAR LIMPIEZA MANUAL
// POST /api/admin/limpiar
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
      res.status(500).json({ error: 'Error al ejecutar limpieza', detalle: error.message });
    }
  }
);

// ========================================
// ESTADÍSTICAS DE LIMPIEZA
// GET /api/admin/estadisticas-limpieza
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
      res.status(500).json({ error: 'Error al obtener estadísticas', detalle: error.message });
    }
  }
);

// ========================================
// ESTADÍSTICAS GENERALES
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
        totalUsuarios, totalVehiculos, totalRallies, totalCategorias,
        totalCompras, totalAlquileres, comprasActivas, alquileresActivos
      ] = await Promise.all([
        Usuario.count(), Vehiculo.count(), Rally.count(), Categoria.count(),
        Compra.count(), Alquiler.count(),
        Compra.count({ where: { estado: 'aprobado' } }),
        Alquiler.count({ where: { estado: 'aprobado' } })
      ]);

      res.json({
        usuarios: { total: totalUsuarios },
        vehiculos: { total: totalVehiculos },
        rallies: { total: totalRallies },
        categorias: { total: totalCategorias },
        transacciones: {
          compras: { total: totalCompras, activas: comprasActivas },
          alquileres: { total: totalAlquileres, activos: alquileresActivos }
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error al obtener estadísticas del sistema:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas', detalle: error.message });
    }
  }
);

// ========================================
// COMPRAS DE UN USUARIO
// GET /api/admin/usuarios/:id/compras
// ========================================
router.get(
  '/usuarios/:id/compras',
  verificarAutenticacion,
  esAdmin,
  [
    param('id').isInt({ min: 1 }).withMessage('ID de usuario inválido'),
    manejarErroresValidacion
  ],
  async (req, res) => {
    try {
      const { Compra, Vehiculo, Categoria } = await import('../modelos/index.js');

      const compras = await Compra.findAll({
        where: { usuarioId: req.params.id },
        include: [
          {
            model: Vehiculo,
            as: 'vehiculo',
            attributes: ['id', 'marca', 'nombre', 'foto'],
            include: [
              {
                model: Categoria,
                as: 'categorias',
                attributes: ['id', 'nombre', 'color'],
                through: { attributes: [] }
              }
            ]
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      // Normalizar: categoria es la primera del array
      const comprasNormalizadas = compras.map(c => {
        const obj = c.toJSON();
        if (obj.vehiculo?.categorias?.length > 0) {
          obj.vehiculo.categoria = obj.vehiculo.categorias[0];
        }
        return obj;
      });

      res.json({ compras: comprasNormalizadas });
    } catch (error) {
      console.error('Error al obtener compras del usuario:', error);
      res.status(500).json({ error: 'Error al obtener compras', detalle: error.message });
    }
  }
);

// ========================================
// ALQUILERES DE UN USUARIO
// GET /api/admin/usuarios/:id/alquileres
// ========================================
router.get(
  '/usuarios/:id/alquileres',
  verificarAutenticacion,
  esAdmin,
  [
    param('id').isInt({ min: 1 }).withMessage('ID de usuario inválido'),
    manejarErroresValidacion
  ],
  async (req, res) => {
    try {
      const { Alquiler, Vehiculo, Categoria, Rally } = await import('../modelos/index.js');

      const alquileres = await Alquiler.findAll({
        where: { usuarioId: req.params.id },
        include: [
          {
            model: Vehiculo,
            as: 'vehiculo',
            attributes: ['id', 'marca', 'nombre', 'foto'],
            include: [
              {
                model: Categoria,
                as: 'categorias',
                attributes: ['id', 'nombre', 'color'],
                through: { attributes: [] }
              }
            ]
          },
          {
            model: Rally,
            as: 'rally',
            attributes: ['id', 'nombre', 'campeonato', 'fecha']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      const alquileresNormalizados = alquileres.map(a => {
        const obj = a.toJSON();
        if (obj.vehiculo?.categorias?.length > 0) {
          obj.vehiculo.categoria = obj.vehiculo.categorias[0];
        }
        return obj;
      });

      res.json({ alquileres: alquileresNormalizados });
    } catch (error) {
      console.error('Error al obtener alquileres del usuario:', error);
      res.status(500).json({ error: 'Error al obtener alquileres', detalle: error.message });
    }
  }
);

// ========================================
// ELIMINAR COMPRA (ADMIN)
// DELETE /api/admin/compras/:id
// ========================================
router.delete(
  '/compras/:id',
  verificarAutenticacion,
  esAdmin,
  [
    param('id').isInt({ min: 1 }).withMessage('ID de compra inválido'),
    manejarErroresValidacion
  ],
  async (req, res) => {
    try {
      const { Compra } = await import('../modelos/index.js');

      const compra = await Compra.findByPk(req.params.id);
      if (!compra) {
        return res.status(404).json({ error: 'Compra no encontrada' });
      }

      await compra.destroy();
      res.json({ mensaje: 'Compra eliminada exitosamente' });
    } catch (error) {
      console.error('Error al eliminar compra:', error);
      res.status(500).json({ error: 'Error al eliminar compra', detalle: error.message });
    }
  }
);

// ========================================
// ELIMINAR ALQUILER (ADMIN)
// DELETE /api/admin/alquileres/:id
// ========================================
router.delete(
  '/alquileres/:id',
  verificarAutenticacion,
  esAdmin,
  [
    param('id').isInt({ min: 1 }).withMessage('ID de alquiler inválido'),
    manejarErroresValidacion
  ],
  async (req, res) => {
    try {
      const { Alquiler } = await import('../modelos/index.js');

      const alquiler = await Alquiler.findByPk(req.params.id);
      if (!alquiler) {
        return res.status(404).json({ error: 'Alquiler no encontrado' });
      }

      await alquiler.destroy();
      res.json({ mensaje: 'Alquiler eliminado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar alquiler:', error);
      res.status(500).json({ error: 'Error al eliminar alquiler', detalle: error.message });
    }
  }
);

// ========================================
// CAMBIAR RALLY DE UN ALQUILER (ADMIN)
// PATCH /api/admin/alquileres/:id/rally
// ========================================
router.patch(
  '/alquileres/:id/rally',
  verificarAutenticacion,
  esAdmin,
  [
    param('id').isInt({ min: 1 }).withMessage('ID de alquiler inválido'),
    body('rallyId').notEmpty().withMessage('El rallyId es obligatorio')
      .isInt({ min: 1 }).withMessage('ID de rally inválido'),
    manejarErroresValidacion
  ],
  async (req, res) => {
    try {
      const { Alquiler, Rally } = await import('../modelos/index.js');

      const alquiler = await Alquiler.findByPk(req.params.id);
      if (!alquiler) {
        return res.status(404).json({ error: 'Alquiler no encontrado' });
      }

      const rally = await Rally.findByPk(req.body.rallyId);
      if (!rally) {
        return res.status(404).json({ error: 'Rally no encontrado' });
      }

      // Actualizar rally y fecha de finalización
      alquiler.rallyId = rally.id;
      alquiler.fechaFinalizacion = rally.fecha;
      alquiler.fechaReprogramada = null; // Limpiar reprogramación anterior
      await alquiler.save();

      res.json({ mensaje: 'Rally actualizado exitosamente', alquiler });
    } catch (error) {
      console.error('Error al cambiar rally:', error);
      res.status(500).json({ error: 'Error al cambiar rally', detalle: error.message });
    }
  }
);

export default router;