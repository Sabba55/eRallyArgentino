import { DataTypes } from 'sequelize';
import sequelize from '../config/baseDatos.js';

const Rally = sequelize.define(
  'Rally',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    campeonato: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El nombre del campeonato no puede estar vacío'
        }
      }
    },
    nombre: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El nombre del rally no puede estar vacío'
        }
      }
    },
    subtitulo: {
      type: DataTypes.STRING(200),
      allowNull: true,
      defaultValue: null
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: {
          msg: 'Debe ser una fecha válida'
        }
      }
    },
    fechaOriginal: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: {
          msg: 'Debe ser una fecha válida'
        }
      }
    },
    logo: {
      type: DataTypes.STRING(500),
      allowNull: true,
      defaultValue: null,
      validate: {
        isUrl: {
          msg: 'El logo debe ser una URL válida'
        }
      }
    },
    resultados: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    },
    contactos: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
      comment: 'Almacena redes sociales y contactos: {whatsapp, email, instagram, facebook, web}'
    },
    creadoPorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      comment: 'Usuario que creó este rally (para control de permisos de creador_fechas)'
    }
  },
  {
    tableName: 'rallies',
    timestamps: true,
    indexes: [
      {
        fields: ['fecha']
      },
      {
        fields: ['campeonato']
      },
      {
        fields: ['creadoPorId']
      }
    ],
    hooks: {
      // Hook: Al crear un rally, la fechaOriginal es igual a la fecha
      beforeValidate: (rally) => {
        if (!rally.fechaOriginal && rally.fecha) {
          rally.fechaOriginal = rally.fecha;
        }
      }
    }
  }
);

// ========================================
// MÉTODOS ESTÁTICOS
// ========================================

// Obtener rallies futuros (ordenados por fecha)
Rally.obtenerProximos = async function () {
  const ahora = new Date();
  return await Rally.findAll({
    where: {
      fecha: {
        [sequelize.Sequelize.Op.gte]: ahora
      }
    },
    order: [['fecha', 'ASC']]
  });
};

// Obtener rallies pasados
Rally.obtenerPasados = async function () {
  const ahora = new Date();
  return await Rally.findAll({
    where: {
      fecha: {
        [sequelize.Sequelize.Op.lt]: ahora
      }
    },
    order: [['fecha', 'DESC']]
  });
};

// Obtener rallies por campeonato
Rally.obtenerPorCampeonato = async function (campeonato) {
  return await Rally.findAll({
    where: { campeonato },
    order: [['fecha', 'ASC']]
  });
};

// Buscar rally por ID con sus categorías habilitadas
Rally.buscarConCategorias = async function (id) {
  return await Rally.findByPk(id, {
    include: ['categorias']
  });
};

// Obtener rallies creados por un usuario
Rally.obtenerPorCreador = async function (usuarioId) {
  return await Rally.findAll({
    where: { creadoPorId: usuarioId },
    order: [['fecha', 'DESC']]
  });
};

// ========================================
// MÉTODOS DE INSTANCIA
// ========================================

// Reprogramar rally (cambiar fecha)
Rally.prototype.reprogramar = async function (nuevaFecha) {
  this.fecha = nuevaFecha;
  await this.save();
  console.log(`📅 Rally "${this.nombre}" reprogramado a ${nuevaFecha}`);
  return this;
};

// Verificar si el rally fue reprogramado
Rally.prototype.fueReprogramado = function () {
  return this.fecha.getTime() !== this.fechaOriginal.getTime();
};

// Verificar si el rally ya pasó
Rally.prototype.yaPaso = function () {
  return new Date() > this.fecha;
};

// Cargar resultados después del evento
Rally.prototype.cargarResultados = async function (resultados) {
  this.resultados = resultados;
  await this.save();
  console.log(`🏆 Resultados cargados para "${this.nombre}"`);
  return this;
};

// Obtener contacto específico
Rally.prototype.obtenerContacto = function (tipo) {
  return this.contactos?.[tipo] || null;
};

// Verificar si un usuario es el creador de este rally
Rally.prototype.esCreador = function (usuarioId) {
  return this.creadoPorId === usuarioId;
};

export default Rally;