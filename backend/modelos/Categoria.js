import { DataTypes } from 'sequelize';
import sequelize from '../config/baseDatos.js';

const Categoria = sequelize.define(
  'Categoria',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: {
        msg: 'Ya existe una categoría con este nombre'
      },
      validate: {
        notEmpty: {
          msg: 'El nombre de la categoría no puede estar vacío'
        },
        len: {
          args: [2, 50],
          msg: 'El nombre debe tener entre 2 y 50 caracteres'
        }
      }
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    },
    color: {
      type: DataTypes.STRING(7),
      allowNull: false,
      defaultValue: '#00d4ff',
      validate: {
        is: {
          args: /^#[0-9A-Fa-f]{6}$/,
          msg: 'El color debe ser un código hexadecimal válido (ej: #00d4ff)'
        }
      }
    }
  },
  {
    tableName: 'categorias',
    timestamps: true
  }
);

// ========================================
// MÉTODOS ESTÁTICOS
// ========================================

// Buscar categoría por nombre
Categoria.buscarPorNombre = async function (nombre) {
  return await Categoria.findOne({ where: { nombre } });
};

// Obtener todas las categorías activas
Categoria.obtenerTodas = async function () {
  return await Categoria.findAll({
    order: [['nombre', 'ASC']]
  });
};

// Crear categorías iniciales (seed data)
Categoria.crearCategoriasIniciales = async function () {
  const categoriasIniciales = [
    { nombre: 'Rally2', descripcion: '', color: '#00d4ff' },
    { nombre: 'R5', descripcion: '', color: '#39ff14' },
    { nombre: 'Rally3', descripcion: '', color: '#ff6b00' },
    { nombre: 'Rally4', descripcion: '', color: '#ffd60a' },
    { nombre: 'Maxi Rally', descripcion: '', color: '#9d4edd' },
    { nombre: 'N4', descripcion: '', color: '#e63946' },
    { nombre: 'RC3', descripcion: '', color: '#ff006e' },
    { nombre: 'A1', descripcion: '', color: '#ff0037' },
    { nombre: 'N1', descripcion: '', color: '#2a9d8f' },
    { nombre: 'RC5', descripcion: '', color: '#0077b6' }
  ];

  try {
    for (const cat of categoriasIniciales) {
      await Categoria.findOrCreate({
        where: { nombre: cat.nombre },
        defaults: cat
      });
    }
    console.log('✅ Categorías iniciales creadas correctamente');
  } catch (error) {
    console.error('❌ Error al crear categorías iniciales:', error);
  }
};

export default Categoria;