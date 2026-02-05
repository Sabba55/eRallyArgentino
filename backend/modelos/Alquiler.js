import { DataTypes } from 'sequelize';
import sequelize from '../config/baseDatos.js';

const Alquiler = sequelize.define(
  'Alquiler',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    vehiculoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'vehiculos',
        key: 'id'
      },
      onDelete: 'RESTRICT', // No permitir borrar un vehículo con alquileres activos
      onUpdate: 'CASCADE'
    },
    rallyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'rallies',
        key: 'id'
      },
      onDelete: 'RESTRICT', // No permitir borrar rally con alquileres activos
      onUpdate: 'CASCADE'
    },
    fechaAlquiler: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    fechaFinalizacion: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Fecha del rally (puede cambiar si se reprograma)'
    },
    fechaReprogramada: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      comment: 'Nueva fecha si el rally se reprogramó'
    },
    monto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'El monto debe ser mayor a 0'
        }
      }
    },
    moneda: {
      type: DataTypes.ENUM('ARS', 'USD'),
      allowNull: false,
      defaultValue: 'ARS'
    },
    metodoPago: {
      type: DataTypes.ENUM('MercadoPago', 'PayPal'),
      allowNull: false
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'aprobado', 'rechazado', 'vencido', 'rally_cancelado'),
      allowNull: false,
      defaultValue: 'pendiente'
    },
    transaccionId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'ID de transacción de Mercado Pago o PayPal'
    }
  },
  {
    tableName: 'alquileres',
    timestamps: true,
    indexes: [
      {
        fields: ['usuarioId']
      },
      {
        fields: ['vehiculoId']
      },
      {
        fields: ['rallyId']
      },
      {
        fields: ['estado']
      },
      {
        fields: ['fechaFinalizacion']
      },
      {
        unique: true,
        fields: ['usuarioId', 'rallyId'],
        name: 'unique_usuario_rally_alquiler',
        where: {
          estado: 'aprobado'
        }
      }
    ]
  }
);

// ========================================
// MÉTODOS ESTÁTICOS
// ========================================

// Obtener alquileres activos de un usuario (aprobados y no vencidos)
Alquiler.obtenerActivosUsuario = async function (usuarioId) {
  const ahora = new Date();
  return await Alquiler.findAll({
    where: {
      usuarioId,
      estado: 'aprobado',
      [sequelize.Sequelize.Op.or]: [
        {
          fechaFinalizacion: {
            [sequelize.Sequelize.Op.gt]: ahora
          }
        },
        {
          fechaReprogramada: {
            [sequelize.Sequelize.Op.gt]: ahora
          }
        }
      ]
    },
    include: ['Vehiculo', 'Rally'],
    order: [['fechaFinalizacion', 'ASC']]
  });
};

// Obtener alquileres vencidos
Alquiler.obtenerVencidos = async function () {
  const ahora = new Date();
  return await Alquiler.findAll({
    where: {
      estado: 'aprobado',
      fechaFinalizacion: {
        [sequelize.Sequelize.Op.lte]: ahora
      },
      [sequelize.Sequelize.Op.or]: [
        { fechaReprogramada: null },
        {
          fechaReprogramada: {
            [sequelize.Sequelize.Op.lte]: ahora
          }
        }
      ]
    }
  });
};

// Obtener alquileres pendientes de aprobación
Alquiler.obtenerPendientes = async function () {
  return await Alquiler.findAll({
    where: { estado: 'pendiente' },
    include: ['Usuario', 'Vehiculo', 'Rally'],
    order: [['createdAt', 'DESC']]
  });
};

// Obtener alquileres de un rally específico
Alquiler.obtenerPorRally = async function (rallyId) {
  return await Alquiler.findAll({
    where: { rallyId, estado: 'aprobado' },
    include: ['Usuario', 'Vehiculo']
  });
};

// Verificar si un usuario ya alquiló un vehículo para un rally
Alquiler.usuarioTieneVehiculoEnRally = async function (usuarioId, vehiculoId, rallyId) {
  const alquiler = await Alquiler.findOne({
    where: {
      usuarioId,
      vehiculoId,
      rallyId,
      estado: 'aprobado'
    }
  });
  return alquiler !== null;
};

// Verificar si un usuario ya tiene CUALQUIER vehículo alquilado para un rally
Alquiler.usuarioTieneAlquilerEnRally = async function (usuarioId, rallyId) {
  const alquiler = await Alquiler.findOne({
    where: {
      usuarioId,
      rallyId,
      estado: 'aprobado'
    }
  });
  return alquiler !== null;
};

// ========================================
// MÉTODOS DE INSTANCIA
// ========================================

// Aprobar alquiler
Alquiler.prototype.aprobar = async function () {
  this.estado = 'aprobado';
  await this.save();
  console.log(`✅ Alquiler #${this.id} aprobado`);
  return this;
};

// Rechazar alquiler
Alquiler.prototype.rechazar = async function () {
  this.estado = 'rechazado';
  await this.save();
  console.log(`❌ Alquiler #${this.id} rechazado`);
  return this;
};

// Marcar como vencido
Alquiler.prototype.marcarVencido = async function () {
  this.estado = 'vencido';
  await this.save();
  console.log(`⏰ Alquiler #${this.id} marcado como vencido`);
  return this;
};

// Marcar como rally cancelado
Alquiler.prototype.marcarRallyCancelado = async function () {
  this.estado = 'rally_cancelado';
  await this.save();
  console.log(`🚫 Alquiler #${this.id} - Rally cancelado`);
  return this;
};

// Reprogramar (actualizar fecha de finalización)
Alquiler.prototype.reprogramar = async function (nuevaFecha) {
  this.fechaReprogramada = nuevaFecha;
  await this.save();
  console.log(`📅 Alquiler #${this.id} reprogramado a ${nuevaFecha}`);
  return this;
};

// Verificar si está vencido
Alquiler.prototype.estaVencido = function () {
  const ahora = new Date();
  const fechaFinal = this.fechaReprogramada || this.fechaFinalizacion;
  return ahora > fechaFinal;
};

// Calcular días restantes
Alquiler.prototype.diasRestantes = function () {
  const ahora = new Date();
  const fechaFinal = this.fechaReprogramada || this.fechaFinalizacion;
  const diferencia = fechaFinal - ahora;
  const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  return dias > 0 ? dias : 0;
};

// Verificar si fue reprogramado
Alquiler.prototype.fueReprogramado = function () {
  return this.fechaReprogramada !== null;
};

export default Alquiler;