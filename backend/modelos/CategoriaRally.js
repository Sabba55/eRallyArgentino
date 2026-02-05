import { DataTypes } from 'sequelize';
import sequelize from '../config/baseDatos.js';

const CategoriaRally = sequelize.define(
  'CategoriaRally',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    rallyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'rallies',
        key: 'id'
      },
      onDelete: 'CASCADE', // Si se borra el rally, se borran sus restricciones
      onUpdate: 'CASCADE'
    },
    categoriaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categorias',
        key: 'id'
      },
      onDelete: 'CASCADE', // Si se borra la categoría, se borran sus restricciones
      onUpdate: 'CASCADE'
    }
  },
  {
    tableName: 'categorias_rallies',
    timestamps: true,
    updatedAt: false, // Solo necesitamos createdAt
    indexes: [
      {
        unique: true,
        fields: ['rallyId', 'categoriaId'],
        name: 'unique_rally_categoria'
      }
    ]
  }
);

// ========================================
// MÉTODOS ESTÁTICOS
// ========================================

// Habilitar categoría para un rally
CategoriaRally.habilitarCategoria = async function (rallyId, categoriaId) {
  try {
    const [relacion, creada] = await CategoriaRally.findOrCreate({
      where: { rallyId, categoriaId }
    });

    if (creada) {
      console.log(`✅ Categoría ${categoriaId} habilitada para rally ${rallyId}`);
    } else {
      console.log(`ℹ️  La categoría ${categoriaId} ya estaba habilitada para el rally ${rallyId}`);
    }

    return relacion;
  } catch (error) {
    console.error('Error al habilitar categoría:', error);
    throw error;
  }
};

// Habilitar múltiples categorías para un rally
CategoriaRally.habilitarCategorias = async function (rallyId, categoriasIds) {
  const promesas = categoriasIds.map(categoriaId =>
    CategoriaRally.habilitarCategoria(rallyId, categoriaId)
  );
  return await Promise.all(promesas);
};

// Deshabilitar categoría de un rally
CategoriaRally.deshabilitarCategoria = async function (rallyId, categoriaId) {
  return await CategoriaRally.destroy({
    where: { rallyId, categoriaId }
  });
};

// Deshabilitar todas las categorías de un rally
CategoriaRally.deshabilitarTodasCategoriasRally = async function (rallyId) {
  return await CategoriaRally.destroy({
    where: { rallyId }
  });
};

// Obtener todas las categorías habilitadas para un rally
CategoriaRally.obtenerCategoriasRally = async function (rallyId) {
  return await CategoriaRally.findAll({
    where: { rallyId },
    include: ['Categoria']
  });
};

// Verificar si una categoría está habilitada para un rally
CategoriaRally.estaHabilitada = async function (rallyId, categoriaId) {
  const relacion = await CategoriaRally.findOne({
    where: { rallyId, categoriaId }
  });
  return relacion !== null;
};

// Obtener rallies que aceptan una categoría específica
CategoriaRally.obtenerRalliesPorCategoria = async function (categoriaId) {
  return await CategoriaRally.findAll({
    where: { categoriaId },
    include: ['Rally']
  });
};

export default CategoriaRally;