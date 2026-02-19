import Categoria from '../modelos/Categoria.js';
import Vehiculo from '../modelos/Vehiculo.js';
import VehiculoCategoria from '../modelos/VehiculoCategoria.js';
import Rally from '../modelos/Rally.js';
import { Op } from 'sequelize';

// ========================================
// LISTAR TODAS LAS CATEGORÍAS (PÚBLICO)
// ========================================
export const listarCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.findAll({
      order: [['nombre', 'ASC']],
      attributes: ['id', 'nombre', 'descripcion', 'color']
    });

    res.json({
      categorias,
      total: categorias.length
    });
  } catch (error) {
    console.error('Error al listar categorías:', error);
    res.status(500).json({
      error: 'Error al listar categorías',
      detalle: error.message
    });
  }
};

// ========================================
// OBTENER CATEGORÍA POR ID (PÚBLICO)
// ========================================
export const obtenerCategoria = async (req, res) => {
  try {
    const { id } = req.params;

    const categoria = await Categoria.findByPk(id, {
      attributes: ['id', 'nombre', 'descripcion', 'color']
    });

    if (!categoria) {
      return res.status(404).json({
        error: 'Categoría no encontrada'
      });
    }

    res.json({
      categoria
    });
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    res.status(500).json({
      error: 'Error al obtener categoría',
      detalle: error.message
    });
  }
};

// ========================================
// OBTENER VEHÍCULOS DE UNA CATEGORÍA
// ========================================
export const obtenerVehiculosCategoria = async (req, res) => {
  try {
    const { id } = req.params;

    const categoria = await Categoria.findByPk(id, {
      include: [{
        model: Vehiculo,
        as: 'vehiculos',
        through: { attributes: [] },
        order: [['marca', 'ASC'], ['nombre', 'ASC']]
      }]
    });

    if (!categoria) {
      return res.status(404).json({
        error: 'Categoría no encontrada'
      });
    }

    res.json({
      categoria: {
        id: categoria.id,
        nombre: categoria.nombre,
        color: categoria.color
      },
      vehiculos: categoria.vehiculos || [],
      total: categoria.vehiculos?.length || 0
    });
  } catch (error) {
    console.error('Error al obtener vehículos de categoría:', error);
    res.status(500).json({
      error: 'Error al obtener vehículos',
      detalle: error.message
    });
  }
};

// ========================================
// OBTENER RALLIES DE UNA CATEGORÍA
// ========================================
export const obtenerRalliesCategoria = async (req, res) => {
  try {
    const { id } = req.params;

    const categoria = await Categoria.findByPk(id, {
      include: [{
        model: Rally,
        as: 'rallies',
        through: { attributes: [] },
        where: {
          fecha: { [Op.gte]: new Date() }
        },
        required: false,
        order: [['fecha', 'ASC']]
      }]
    });

    if (!categoria) {
      return res.status(404).json({
        error: 'Categoría no encontrada'
      });
    }

    res.json({
      categoria: {
        id: categoria.id,
        nombre: categoria.nombre,
        color: categoria.color
      },
      rallies: categoria.rallies || [],
      total: categoria.rallies?.length || 0
    });
  } catch (error) {
    console.error('Error al obtener rallies de categoría:', error);
    res.status(500).json({
      error: 'Error al obtener rallies',
      detalle: error.message
    });
  }
};

// ========================================
// CREAR CATEGORÍA (ADMIN)
// ========================================
export const crearCategoria = async (req, res) => {
  try {
    const { nombre, descripcion, color } = req.body;

    // Verificar si ya existe
    const categoriaExistente = await Categoria.findOne({
      where: { nombre: { [Op.iLike]: nombre } }
    });

    if (categoriaExistente) {
      return res.status(400).json({
        error: 'Ya existe una categoría con ese nombre'
      });
    }

    const nuevaCategoria = await Categoria.create({
      nombre,
      descripcion: descripcion || null,
      color
    });

    res.status(201).json({
      mensaje: 'Categoría creada exitosamente',
      categoria: nuevaCategoria
    });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({
      error: 'Error al crear categoría',
      detalle: error.message
    });
  }
};

// ========================================
// ACTUALIZAR CATEGORÍA (ADMIN)
// ========================================
export const actualizarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, color } = req.body;

    const categoria = await Categoria.findByPk(id);

    if (!categoria) {
      return res.status(404).json({
        error: 'Categoría no encontrada'
      });
    }

    // Si se cambia el nombre, verificar que no exista
    if (nombre && nombre !== categoria.nombre) {
      const categoriaExistente = await Categoria.findOne({
        where: {
          nombre: { [Op.iLike]: nombre },
          id: { [Op.ne]: id }
        }
      });

      if (categoriaExistente) {
        return res.status(400).json({
          error: 'Ya existe una categoría con ese nombre'
        });
      }
    }

    // Actualizar campos
    if (nombre) categoria.nombre = nombre;
    if (descripcion !== undefined) categoria.descripcion = descripcion;
    if (color) categoria.color = color;

    await categoria.save();

    res.json({
      mensaje: 'Categoría actualizada exitosamente',
      categoria
    });
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({
      error: 'Error al actualizar categoría',
      detalle: error.message
    });
  }
};

// ========================================
// ELIMINAR CATEGORÍA (ADMIN)
// ========================================
export const eliminarCategoria = async (req, res) => {
  try {
    const { id } = req.params;

    const categoria = await Categoria.findByPk(id);

    if (!categoria) {
      return res.status(404).json({
        error: 'Categoría no encontrada'
      });
    }

    // ✅ Verificar si tiene vehículos asociados en la tabla intermedia
    const vehiculosAsociados = await VehiculoCategoria.count({
      where: { categoriaId: id }
    });

    if (vehiculosAsociados > 0) {
      return res.status(400).json({
        error: `No se puede eliminar la categoría porque tiene ${vehiculosAsociados} vehículo(s) asociado(s)`
      });
    }

    await categoria.destroy();

    res.json({
      mensaje: 'Categoría eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);

    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        error: 'No se puede eliminar la categoría porque tiene registros asociados'
      });
    }

    res.status(500).json({
      error: 'Error al eliminar categoría',
      detalle: error.message
    });
  }
};

// ========================================
// CREAR CATEGORÍAS INICIALES (SETUP)
// ========================================
export const crearCategoriasIniciales = async (req, res) => {
  try {
    // Verificar si ya hay categorías
    const categorias = await Categoria.count();

    if (categorias > 0) {
      return res.status(400).json({
        error: 'Ya existen categorías en la base de datos'
      });
    }

    // Categorías del sistema eRally
    const categoriasIniciales = [
      { nombre: 'Rally2', color: '#00d4ff', descripcion: 'Máxima categoría - 4x4' },
      { nombre: 'R5', color: '#39ff14', descripcion: 'Alta competición - 4x4' },
      { nombre: 'Rally3', color: '#ff6b00', descripcion: 'Desarrollo - 4x4' },
      { nombre: 'Rally4', color: '#ffd60a', descripcion: 'Iniciación - FWD' },
      { nombre: 'Maxi Rally', color: '#9d4edd', descripcion: 'Históricos - 4x4' },
      { nombre: 'N4', color: '#e63946', descripcion: 'Homologados - 4x4' },
      { nombre: 'RC3', color: '#ff006e', descripcion: 'Regional C3 - FWD' },
      { nombre: 'A1', color: '#ff0037', descripcion: 'Regional A1 - FWD' },
      { nombre: 'N1', color: '#2a9d8f', descripcion: 'Regional N1 - FWD' },
      { nombre: 'RC5', color: '#0077b6', descripcion: 'Regional C5 - FWD' }
    ];

    const categoriasCreadas = await Categoria.bulkCreate(categoriasIniciales);

    res.status(201).json({
      mensaje: 'Categorías iniciales creadas exitosamente',
      categorias: categoriasCreadas,
      total: categoriasCreadas.length
    });
  } catch (error) {
    console.error('Error al crear categorías iniciales:', error);
    res.status(500).json({
      error: 'Error al crear categorías iniciales',
      detalle: error.message
    });
  }
};

// ========================================
// OBTENER ESTADÍSTICAS DE CATEGORÍA (ADMIN)
// ========================================
export const obtenerEstadisticas = async (req, res) => {
  try {
    const { id } = req.params;

    const categoria = await Categoria.findByPk(id);

    if (!categoria) {
      return res.status(404).json({
        error: 'Categoría no encontrada'
      });
    }

    // ✅ Contar vehículos desde la tabla intermedia
    const totalVehiculos = await VehiculoCategoria.count({
      where: { categoriaId: id }
    });

    // Contar rallies próximos
    const ralliesProximos = await Rally.count({
      include: [{
        model: Categoria,
        as: 'categorias',
        where: { id },
        through: { attributes: [] }
      }],
      where: {
        fecha: { [Op.gte]: new Date() }
      }
    });

    res.json({
      categoria: {
        id: categoria.id,
        nombre: categoria.nombre,
        color: categoria.color
      },
      estadisticas: {
        totalVehiculos,
        ralliesProximos
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      error: 'Error al obtener estadísticas',
      detalle: error.message
    });
  }
};