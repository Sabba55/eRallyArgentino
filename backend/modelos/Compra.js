import { DataTypes } from 'sequelize';
import sequelize from '../config/baseDatos.js';

const Compra = sequelize.define(
  'Compra',
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
      onDelete: 'RESTRICT', // No permitir borrar un vehículo con compras activas
      onUpdate: 'CASCADE'
    },
    fechaCompra: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    fechaVencimiento: {
      type: DataTypes.DATE,
      allowNull: false
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
      type: DataTypes.ENUM('pendiente', 'aprobado', 'rechazado', 'vencido'),
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
    tableName: 'compras',
    timestamps: true,
    indexes: [
      {
        fields: ['usuarioId']
      },
      {
        fields: ['vehiculoId']
      },
      {
        fields: ['estado']
      },
      {
        fields: ['fechaVencimiento']
      },
      {
        unique: true,
        fields: ['usuarioId', 'vehiculoId'],
        name: 'unique_usuario_vehiculo_compra',
        where: {
          estado: 'aprobado'
        }
      }
    ]
  }
);

// ========================================
// HOOKS
// ========================================

// Hook: Al crear una compra, calcular fecha de vencimiento (1 año)
Compra.beforeCreate((compra) => {
  if (!compra.fechaVencimiento) {
    const fechaVenc = new Date(compra.fechaCompra);
    fechaVenc.setFullYear(fechaVenc.getFullYear() + 1);
    compra.fechaVencimiento = fechaVenc;
  }
});

// ========================================
// MÉTODOS ESTÁTICOS
// ========================================

// Obtener compras activas de un usuario (aprobadas y no vencidas)
Compra.obtenerActivasUsuario = async function (usuarioId) {
  const ahora = new Date();
  return await Compra.findAll({
    where: {
      usuarioId,
      estado: 'aprobado',
      fechaVencimiento: {
        [sequelize.Sequelize.Op.gt]: ahora
      }
    },
    include: ['Vehiculo'],
    order: [['fechaVencimiento', 'ASC']]
  });
};

// Obtener compras vencidas
Compra.obtenerVencidas = async function () {
  const ahora = new Date();
  return await Compra.findAll({
    where: {
      estado: 'aprobado',
      fechaVencimiento: {
        [sequelize.Sequelize.Op.lte]: ahora
      }
    }
  });
};

// Obtener compras pendientes de aprobación
Compra.obtenerPendientes = async function () {
  return await Compra.findAll({
    where: { estado: 'pendiente' },
    include: ['Usuario', 'Vehiculo'],
    order: [['createdAt', 'DESC']]
  });
};

// Verificar si un usuario ya compró un vehículo
Compra.usuarioTieneVehiculo = async function (usuarioId, vehiculoId) {
  const ahora = new Date();
  const compra = await Compra.findOne({
    where: {
      usuarioId,
      vehiculoId,
      estado: 'aprobado',
      fechaVencimiento: {
        [sequelize.Sequelize.Op.gt]: ahora
      }
    }
  });
  return compra !== null;
};

// ========================================
// MÉTODOS DE INSTANCIA
// ========================================

// Aprobar compra
Compra.prototype.aprobar = async function () {
  this.estado = 'aprobado';
  await this.save();
  console.log(`✅ Compra #${this.id} aprobada`);
  return this;
};

// Rechazar compra
Compra.prototype.rechazar = async function () {
  this.estado = 'rechazado';
  await this.save();
  console.log(`❌ Compra #${this.id} rechazada`);
  return this;
};

// Marcar como vencida
Compra.prototype.marcarVencida = async function () {
  this.estado = 'vencido';
  await this.save();
  console.log(`⏰ Compra #${this.id} marcada como vencida`);
  return this;
};

// Verificar si está vencida
Compra.prototype.estaVencida = function () {
  return new Date() > this.fechaVencimiento;
};

// Calcular días restantes
Compra.prototype.diasRestantes = function () {
  const ahora = new Date();
  const diferencia = this.fechaVencimiento - ahora;
  const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  return dias > 0 ? dias : 0;
};

export default Compra;