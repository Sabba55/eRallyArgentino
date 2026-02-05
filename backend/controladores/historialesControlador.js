import { Historial, Usuario, Rally, Vehiculo } from '../modelos/index.js';
import { Op } from 'sequelize';

// ========================================
// LISTAR TODO EL HISTORIAL (ADMIN)
// ========================================
export const listarHistorial = async (req, res) => {
  try {
    const {
      usuarioId,
      rallyId,
      vehiculoId,
      tipoTransaccion,
      limite = 100,
      pagina = 1
    } = req.query;

    const whereClause = {};

    if (usuarioId) whereClause.usuarioId = usuarioId;
    if (rallyId) whereClause.rallyId = rallyId;
    if (vehiculoId) whereClause.vehiculoId = vehiculoId;
    if (tipoTransaccion) whereClause.tipoTransaccion = tipoTransaccion;

    const historiales = await Historial.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Usuario,
          as: 'Usuario',
          attributes: ['id', 'nombre', 'email', 'equipo']
        },
        {
          model: Rally,
          as: 'Rally',
          attributes: ['id', 'nombre', 'fecha', 'campeonato']
        },
        {
          model: Vehiculo,
          as: 'Vehiculo',
          attributes: ['id', 'marca', 'nombre', 'foto']
        }
      ],
      limit: parseInt(limite),
      offset: (parseInt(pagina) - 1) * parseInt(limite),
      order: [['fechaParticipacion', 'DESC']]
    });

    res.json({
      historiales: historiales.rows,
      paginacion: {
        total: historiales.count,
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        totalPaginas: Math.ceil(historiales.count / parseInt(limite))
      }
    });
  } catch (error) {
    console.error('Error al listar historial:', error);
    res.status(500).json({
      error: 'Error al listar historial',
      detalle: error.message
    });
  }
};

// ========================================
// OBTENER HISTORIAL DE UN USUARIO (ADMIN)
// ========================================
export const obtenerHistorialUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const usuario = await Usuario.findByPk(usuarioId, {
      attributes: { exclude: ['contraseña'] }
    });

    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    const historial = await Historial.obtenerPorUsuario(usuarioId);
    const estadisticas = await Historial.obtenerEstadisticasUsuario(usuarioId);

    res.json({
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        equipo: usuario.equipo
      },
      historial,
      estadisticas
    });
  } catch (error) {
    console.error('Error al obtener historial de usuario:', error);
    res.status(500).json({
      error: 'Error al obtener historial de usuario',
      detalle: error.message
    });
  }
};

// ========================================
// OBTENER PARTICIPANTES DE UN RALLY (ADMIN)
// ========================================
export const obtenerParticipantesRally = async (req, res) => {
  try {
    const { rallyId } = req.params;

    const rally = await Rally.findByPk(rallyId);

    if (!rally) {
      return res.status(404).json({
        error: 'Rally no encontrado'
      });
    }

    const participantes = await Historial.obtenerParticipantesRally(rallyId);

    // Agrupar por categoría
    const porCategoria = {};
    participantes.forEach(p => {
      if (!porCategoria[p.categoriaNombre]) {
        porCategoria[p.categoriaNombre] = [];
      }
      porCategoria[p.categoriaNombre].push(p);
    });

    res.json({
      rally: {
        id: rally.id,
        nombre: rally.nombre,
        fecha: rally.fecha,
        campeonato: rally.campeonato
      },
      participantes,
      totalParticipantes: participantes.length,
      porCategoria
    });
  } catch (error) {
    console.error('Error al obtener participantes:', error);
    res.status(500).json({
      error: 'Error al obtener participantes',
      detalle: error.message
    });
  }
};

// ========================================
// OBTENER HISTORIAL DE UN VEHÍCULO (ADMIN)
// ========================================
export const obtenerHistorialVehiculo = async (req, res) => {
  try {
    const { vehiculoId } = req.params;

    const vehiculo = await Vehiculo.findByPk(vehiculoId);

    if (!vehiculo) {
      return res.status(404).json({
        error: 'Vehículo no encontrado'
      });
    }

    const historial = await Historial.obtenerPorVehiculo(vehiculoId);

    // Estadísticas del vehículo
    const totalUsos = historial.length;
    const compras = historial.filter(h => h.tipoTransaccion === 'compra').length;
    const alquileres = historial.filter(h => h.tipoTransaccion === 'alquiler').length;
    const usuariosUnicos = [...new Set(historial.map(h => h.usuarioId))].length;

    res.json({
      vehiculo: {
        id: vehiculo.id,
        marca: vehiculo.marca,
        nombre: vehiculo.nombre,
        foto: vehiculo.foto
      },
      historial,
      estadisticas: {
        totalUsos,
        compras,
        alquileres,
        usuariosUnicos
      }
    });
  } catch (error) {
    console.error('Error al obtener historial de vehículo:', error);
    res.status(500).json({
      error: 'Error al obtener historial de vehículo',
      detalle: error.message
    });
  }
};

// ========================================
// ESTADÍSTICAS GENERALES (ADMIN)
// ========================================
export const obtenerEstadisticasGenerales = async (req, res) => {
  try {
    const totalRegistros = await Historial.count();
    const totalCompras = await Historial.count({
      where: { tipoTransaccion: 'compra' }
    });
    const totalAlquileres = await Historial.count({
      where: { tipoTransaccion: 'alquiler' }
    });

    // Usuarios únicos que participaron
    const usuariosUnicos = await Historial.findAll({
      attributes: [[Historial.sequelize.fn('DISTINCT', Historial.sequelize.col('usuarioId')), 'usuarioId']],
      raw: true
    });

    // Vehículos más usados
    const vehiculosMasUsados = await Historial.findAll({
      attributes: [
        'vehiculoId',
        [Historial.sequelize.fn('COUNT', Historial.sequelize.col('vehiculoId')), 'totalUsos']
      ],
      include: [{
        model: Vehiculo,
        as: 'Vehiculo',
        attributes: ['id', 'marca', 'nombre', 'foto']
      }],
      group: ['vehiculoId', 'Vehiculo.id'],
      order: [[Historial.sequelize.literal('totalUsos'), 'DESC']],
      limit: 10
    });

    // Rallies con más participantes
    const ralliesMasParticipantes = await Historial.findAll({
      where: {
        rallyId: { [Op.ne]: null }
      },
      attributes: [
        'rallyId',
        [Historial.sequelize.fn('COUNT', Historial.sequelize.col('rallyId')), 'totalParticipantes']
      ],
      include: [{
        model: Rally,
        as: 'Rally',
        attributes: ['id', 'nombre', 'fecha', 'campeonato']
      }],
      group: ['rallyId', 'Rally.id'],
      order: [[Historial.sequelize.literal('totalParticipantes'), 'DESC']],
      limit: 10
    });

    // Categorías más populares
    const categoriasMasPopulares = await Historial.findAll({
      attributes: [
        'categoriaNombre',
        [Historial.sequelize.fn('COUNT', Historial.sequelize.col('categoriaNombre')), 'total']
      ],
      group: ['categoriaNombre'],
      order: [[Historial.sequelize.literal('total'), 'DESC']]
    });

    // Actividad por mes (últimos 6 meses)
    const seiseMesesAtras = new Date();
    seiseMesesAtras.setMonth(seiseMesesAtras.getMonth() - 6);

    const actividadMensual = await Historial.findAll({
      where: {
        createdAt: { [Op.gte]: seiseMesesAtras }
      },
      attributes: [
        [Historial.sequelize.fn('DATE_TRUNC', 'month', Historial.sequelize.col('createdAt')), 'mes'],
        [Historial.sequelize.fn('COUNT', Historial.sequelize.col('id')), 'total']
      ],
      group: [Historial.sequelize.fn('DATE_TRUNC', 'month', Historial.sequelize.col('createdAt'))],
      order: [[Historial.sequelize.fn('DATE_TRUNC', 'month', Historial.sequelize.col('createdAt')), 'ASC']]
    });

    res.json({
      resumen: {
        totalRegistros,
        totalCompras,
        totalAlquileres,
        usuariosActivos: usuariosUnicos.length
      },
      vehiculosMasUsados,
      ralliesMasParticipantes,
      categoriasMasPopulares,
      actividadMensual
    });
  } catch (error) {
    console.error('Error al obtener estadísticas generales:', error);
    res.status(500).json({
      error: 'Error al obtener estadísticas generales',
      detalle: error.message
    });
  }
};

// ========================================
// EXPORTAR HISTORIAL A CSV (ADMIN)
// ========================================
export const exportarHistorialCSV = async (req, res) => {
  try {
    const { rallyId, desde, hasta } = req.query;

    const whereClause = {};
    if (rallyId) whereClause.rallyId = rallyId;
    if (desde && hasta) {
      whereClause.fechaParticipacion = {
        [Op.between]: [new Date(desde), new Date(hasta)]
      };
    }

    const historiales = await Historial.findAll({
      where: whereClause,
      include: [
        {
          model: Usuario,
          as: 'Usuario',
          attributes: ['nombre', 'email', 'equipo']
        },
        {
          model: Rally,
          as: 'Rally',
          attributes: ['nombre', 'fecha', 'campeonato']
        },
        {
          model: Vehiculo,
          as: 'Vehiculo',
          attributes: ['marca', 'nombre']
        }
      ],
      order: [['fechaParticipacion', 'DESC']]
    });

    // Generar CSV
    let csv = 'ID,Usuario,Email,Equipo,Vehículo,Categoría,Rally,Fecha Rally,Tipo Transacción,Fecha Registro\n';

    historiales.forEach(h => {
      const usuario = h.Usuario || {};
      const vehiculo = h.Vehiculo || {};
      const rally = h.Rally || {};

      csv += `${h.id},"${usuario.nombre || 'N/A'}","${usuario.email || 'N/A'}","${usuario.equipo || 'N/A'}","${vehiculo.marca || ''} ${vehiculo.nombre || ''}","${h.categoriaNombre}","${rally.nombre || 'N/A'}","${rally.fecha || 'N/A'}","${h.tipoTransaccion}","${h.createdAt}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=historial.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error al exportar historial:', error);
    res.status(500).json({
      error: 'Error al exportar historial',
      detalle: error.message
    });
  }
};

// ========================================
// BUSCAR EN HISTORIAL (ADMIN)
// ========================================
export const buscarHistorial = async (req, res) => {
  try {
    const { termino } = req.query;

    if (!termino || termino.length < 3) {
      return res.status(400).json({
        error: 'El término de búsqueda debe tener al menos 3 caracteres'
      });
    }

    const historiales = await Historial.findAll({
      include: [
        {
          model: Usuario,
          as: 'Usuario',
          attributes: ['id', 'nombre', 'email', 'equipo'],
          where: {
            [Op.or]: [
              { nombre: { [Op.iLike]: `%${termino}%` } },
              { email: { [Op.iLike]: `%${termino}%` } },
              { equipo: { [Op.iLike]: `%${termino}%` } }
            ]
          }
        },
        {
          model: Rally,
          as: 'Rally',
          attributes: ['id', 'nombre', 'fecha', 'campeonato']
        },
        {
          model: Vehiculo,
          as: 'Vehiculo',
          attributes: ['id', 'marca', 'nombre', 'foto']
        }
      ],
      order: [['fechaParticipacion', 'DESC']],
      limit: 50
    });

    res.json({
      resultados: historiales,
      total: historiales.length
    });
  } catch (error) {
    console.error('Error al buscar en historial:', error);
    res.status(500).json({
      error: 'Error al buscar en historial',
      detalle: error.message
    });
  }
};