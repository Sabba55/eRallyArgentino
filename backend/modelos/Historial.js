import { DataTypes } from 'sequelize';
import sequelize from '../config/baseDatos.js';

const Historial = sequelize.define(
  'Historial',
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
      onDelete: 'CASCADE', // Si se borra el usuario, se borra su historial
      onUpdate: 'CASCADE'
    },
    rallyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'rallies',
        key: 'id'
      },
      onDelete: 'RESTRICT', // No permitir borrar rally con historial
      onUpdate: 'CASCADE'
    },
    vehiculoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'vehiculos',
        key: 'id'
      },
      onDelete: 'RESTRICT', // No permitir borrar vehículo con historial
      onUpdate: 'CASCADE'
    },
    categoriaNombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Nombre de la categoría (guardado por si se borra la categoría)'
    },
    tipoTransaccion: {
      type: DataTypes.ENUM('compra', 'alquiler'),
      allowNull: false
    },
    fechaParticipacion: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Fecha en la que participó en el rally'
    }
  },
  {
    tableName: 'historiales',
    timestamps: true,
    updatedAt: false, // Solo necesitamos createdAt
    indexes: [
      {
        fields: ['usuarioId']
      },
      {
        fields: ['rallyId']
      },
      {
        fields: ['vehiculoId']
      },
      {
        fields: ['tipoTransaccion']
      },
      {
        fields: ['fechaParticipacion']
      }
    ]
  }
);

// ========================================
// MÉTODOS ESTÁTICOS
// ========================================

// Crear registro de historial
Historial.crearRegistro = async function (datos) {
  try {
    const registro = await Historial.create({
      usuarioId: datos.usuarioId,
      rallyId: datos.rallyId,
      vehiculoId: datos.vehiculoId,
      categoriaNombre: datos.categoriaNombre,
      tipoTransaccion: datos.tipoTransaccion,
      fechaParticipacion: datos.fechaParticipacion
    });

    console.log(`📝 Registro de historial creado para usuario ${datos.usuarioId}`);
    return registro;
  } catch (error) {
    console.error('Error al crear registro de historial:', error);
    throw error;
  }
};

// Obtener historial completo de un usuario
Historial.obtenerPorUsuario = async function (usuarioId) {
  return await Historial.findAll({
    where: { usuarioId },
    include: ['Rally', 'Vehiculo'],
    order: [['fechaParticipacion', 'DESC']]
  });
};

// Obtener historial de un rally específico
Historial.obtenerPorRally = async function (rallyId) {
  return await Historial.findAll({
    where: { rallyId },
    include: ['Usuario', 'Vehiculo'],
    order: [['fechaParticipacion', 'ASC']]
  });
};

// Obtener historial de un vehículo específico
Historial.obtenerPorVehiculo = async function (vehiculoId) {
  return await Historial.findAll({
    where: { vehiculoId },
    include: ['Usuario', 'Rally'],
    order: [['fechaParticipacion', 'DESC']]
  });
};

// Obtener estadísticas de un usuario
Historial.obtenerEstadisticasUsuario = async function (usuarioId) {
  const registros = await Historial.findAll({
    where: { usuarioId },
    attributes: [
      'tipoTransaccion',
      [sequelize.fn('COUNT', sequelize.col('id')), 'total']
    ],
    group: ['tipoTransaccion'],
    raw: true
  });

  const totalRallies = await Historial.count({
    where: { usuarioId },
    distinct: true,
    col: 'rallyId'
  });

  const totalVehiculos = await Historial.count({
    where: { usuarioId },
    distinct: true,
    col: 'vehiculoId'
  });

  return {
    registros,
    totalRallies,
    totalVehiculos
  };
};

// Obtener participantes de un rally
Historial.obtenerParticipantesRally = async function (rallyId) {
  return await Historial.findAll({
    where: { rallyId },
    include: ['Usuario'],
    attributes: ['usuarioId', 'categoriaNombre', 'tipoTransaccion'],
    group: ['usuarioId', 'categoriaNombre', 'tipoTransaccion', 'Usuario.id', 'Usuario.nombre'],
    raw: false
  });
};

// Verificar si un usuario participó en un rally
Historial.usuarioParticipo = async function (usuarioId, rallyId) {
  const registro = await Historial.findOne({
    where: { usuarioId, rallyId }
  });
  return registro !== null;
};

// Obtener historial filtrado por tipo de transacción
Historial.obtenerPorTipo = async function (usuarioId, tipoTransaccion) {
  return await Historial.findAll({
    where: { usuarioId, tipoTransaccion },
    include: ['Rally', 'Vehiculo'],
    order: [['fechaParticipacion', 'DESC']]
  });
};

// Obtener historial reciente (últimos N registros)
Historial.obtenerRecientes = async function (usuarioId, limite = 10) {
  return await Historial.findAll({
    where: { usuarioId },
    include: ['Rally', 'Vehiculo'],
    order: [['fechaParticipacion', 'DESC']],
    limit: limite
  });
};

export default Historial;