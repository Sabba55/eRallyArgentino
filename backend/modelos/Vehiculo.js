import { DataTypes } from 'sequelize';
import sequelize from '../config/baseDatos.js';

const Vehiculo = sequelize.define(
  'Vehiculo',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    marca: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'La marca no puede estar vacía'
        },
        len: {
          args: [2, 50],
          msg: 'La marca debe tener entre 2 y 50 caracteres'
        }
      }
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El nombre del vehículo no puede estar vacío'
        },
        len: {
          args: [2, 100],
          msg: 'El nombre debe tener entre 2 y 100 caracteres'
        }
      }
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    },
    foto: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'La foto es obligatoria'
        },
        isUrl: {
          msg: 'La foto debe ser una URL válida'
        }
      }
    },
    precioCompra: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'El precio de compra debe ser mayor a 0'
        },
        isDecimal: {
          msg: 'El precio de compra debe ser un número válido'
        }
      }
    },
    precioAlquiler: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'El precio de alquiler debe ser mayor a 0'
        },
        isDecimal: {
          msg: 'El precio de alquiler debe ser un número válido'
        }
      }
    },
    disponible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },
  {
    tableName: 'vehiculos',
    timestamps: true,
    indexes: [
      {
        fields: ['marca']
      },
      {
        fields: ['disponible']
      }
    ]
  }
);

// ========================================
// MÉTODOS ESTÁTICOS
// ========================================

// Obtener todos los vehículos disponibles
Vehiculo.obtenerDisponibles = async function () {
  return await Vehiculo.findAll({
    where: { disponible: true },
    order: [['marca', 'ASC'], ['nombre', 'ASC']]
  });
};

// Buscar vehículos por marca
Vehiculo.buscarPorMarca = async function (marca) {
  return await Vehiculo.findAll({
    where: { marca, disponible: true },
    order: [['nombre', 'ASC']]
  });
};

// Buscar vehículo por ID con sus categorías
Vehiculo.buscarConCategorias = async function (id) {
  return await Vehiculo.findByPk(id, {
    include: ['categorias']
  });
};

// Cambiar disponibilidad
Vehiculo.prototype.cambiarDisponibilidad = async function (disponible) {
  this.disponible = disponible;
  await this.save();
  return this;
};

// Actualizar precios
Vehiculo.prototype.actualizarPrecios = async function (precioCompra, precioAlquiler) {
  if (precioCompra) this.precioCompra = precioCompra;
  if (precioAlquiler) this.precioAlquiler = precioAlquiler;
  await this.save();
  return this;
};

// Obtener nombre completo del vehículo
Vehiculo.prototype.nombreCompleto = function () {
  return `${this.marca} ${this.nombre}`;
};

export default Vehiculo;