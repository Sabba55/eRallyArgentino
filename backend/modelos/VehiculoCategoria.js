import { DataTypes } from 'sequelize';
import sequelize from '../config/baseDatos.js';

const VehiculoCategoria = sequelize.define(
  'VehiculoCategoria',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    vehiculoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'vehiculos',
        key: 'id'
      },
      onDelete: 'CASCADE', // Si se borra el vehículo, se borran sus categorías
      onUpdate: 'CASCADE'
    },
    categoriaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categorias',
        key: 'id'
      },
      onDelete: 'CASCADE', // Si se borra la categoría, se borran sus relaciones
      onUpdate: 'CASCADE'
    }
  },
  {
    tableName: 'vehiculos_categorias',
    timestamps: true,
    updatedAt: false, // Solo necesitamos createdAt
    indexes: [
      {
        unique: true,
        fields: ['vehiculoId', 'categoriaId'],
        name: 'unique_vehiculo_categoria'
      }
    ]
  }
);

// ========================================
// MÉTODOS ESTÁTICOS
// ========================================

// Asignar categoría a un vehículo
VehiculoCategoria.asignarCategoria = async function (vehiculoId, categoriaId) {
  try {
    const [relacion, creada] = await VehiculoCategoria.findOrCreate({
      where: { vehiculoId, categoriaId }
    });

    if (creada) {
      console.log(`✅ Categoría ${categoriaId} asignada al vehículo ${vehiculoId}`);
    } else {
      console.log(`ℹ️  La categoría ${categoriaId} ya estaba asignada al vehículo ${vehiculoId}`);
    }

    return relacion;
  } catch (error) {
    console.error('Error al asignar categoría:', error);
    throw error;
  }
};

// Asignar múltiples categorías a un vehículo
VehiculoCategoria.asignarCategorias = async function (vehiculoId, categoriasIds) {
  const promesas = categoriasIds.map(categoriaId =>
    VehiculoCategoria.asignarCategoria(vehiculoId, categoriaId)
  );
  return await Promise.all(promesas);
};

// Eliminar categoría de un vehículo
VehiculoCategoria.eliminarCategoria = async function (vehiculoId, categoriaId) {
  return await VehiculoCategoria.destroy({
    where: { vehiculoId, categoriaId }
  });
};

// Eliminar todas las categorías de un vehículo
VehiculoCategoria.eliminarTodasCategoriasVehiculo = async function (vehiculoId) {
  return await VehiculoCategoria.destroy({
    where: { vehiculoId }
  });
};

// Obtener todos los vehículos de una categoría
VehiculoCategoria.obtenerVehiculosPorCategoria = async function (categoriaId) {
  return await VehiculoCategoria.findAll({
    where: { categoriaId },
    include: ['Vehiculo']
  });
};

// Obtener todas las categorías de un vehículo
VehiculoCategoria.obtenerCategoriasPorVehiculo = async function (vehiculoId) {
  return await VehiculoCategoria.findAll({
    where: { vehiculoId },
    include: ['Categoria']
  });
};

export default VehiculoCategoria;