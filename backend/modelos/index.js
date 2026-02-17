import sequelize from '../config/baseDatos.js';

// Importar todos los modelos
import Usuario from './Usuario.js';
import TokenVerificacion from './TokenVerificacion.js';
import Categoria from './Categoria.js';
import Vehiculo from './Vehiculo.js';
import VehiculoCategoria from './VehiculoCategoria.js';
import Rally from './Rally.js';
import CategoriaRally from './CategoriaRally.js';
import Compra from './Compra.js';
import Alquiler from './Alquiler.js';
import Historial from './Historial.js';

// ========================================
// DEFINIR RELACIONES
// ========================================

// ========================================
// 1. USUARIO ↔ TOKEN VERIFICACION
// ========================================
// Un usuario puede tener muchos tokens
Usuario.hasMany(TokenVerificacion, {
  foreignKey: 'usuarioId',
  as: 'tokens'
});

// Un token pertenece a un usuario
TokenVerificacion.belongsTo(Usuario, {
  foreignKey: 'usuarioId',
  as: 'usuario'
});

// ========================================
// 2. VEHICULO ↔ CATEGORIA (Muchos a Muchos)
// ========================================
// Un vehículo puede tener muchas categorías
Vehiculo.belongsToMany(Categoria, {
  through: VehiculoCategoria,
  foreignKey: 'vehiculoId',
  otherKey: 'categoriaId',
  as: 'categorias'
});

// Una categoría puede tener muchos vehículos
Categoria.belongsToMany(Vehiculo, {
  through: VehiculoCategoria,
  foreignKey: 'categoriaId',
  otherKey: 'vehiculoId',
  as: 'vehiculos'
});

// Relaciones directas de VehiculoCategoria (para métodos propios)
VehiculoCategoria.belongsTo(Vehiculo, {
  foreignKey: 'vehiculoId',
  as: 'Vehiculo'
});

VehiculoCategoria.belongsTo(Categoria, {
  foreignKey: 'categoriaId',
  as: 'Categoria'
});

// ========================================
// 3. RALLY ↔ CATEGORIA (Muchos a Muchos)
// ========================================
// Un rally puede aceptar muchas categorías
Rally.belongsToMany(Categoria, {
  through: CategoriaRally,
  foreignKey: 'rallyId',
  otherKey: 'categoriaId',
  as: 'categorias'
});

// Una categoría puede estar en muchos rallies
Categoria.belongsToMany(Rally, {
  through: CategoriaRally,
  foreignKey: 'categoriaId',
  otherKey: 'rallyId',
  as: 'rallies'
});

// Relaciones directas de CategoriaRally (para métodos propios)
CategoriaRally.belongsTo(Rally, {
  foreignKey: 'rallyId',
  as: 'Rally'
});

CategoriaRally.belongsTo(Categoria, {
  foreignKey: 'categoriaId',
  as: 'Categoria'
});

// ===================================
// 4.1 USUARIO ↔ RALLY (Creador)
// ===================================
// Un usuario puede crear muchos rallies
Usuario.hasMany(Rally, {
  foreignKey: 'creadoPorId',
  as: 'ralliesCreados'
});

// Un rally pertenece a un usuario creador
Rally.belongsTo(Usuario, {
  foreignKey: 'creadoPorId',
  as: 'creador'
});

// ========================================
// 4. USUARIO ↔ COMPRA ↔ VEHICULO
// ========================================
// Un usuario puede tener muchas compras
Usuario.hasMany(Compra, {
  foreignKey: 'usuarioId',
  as: 'compras'
});

// Una compra pertenece a un usuario
Compra.belongsTo(Usuario, {
  foreignKey: 'usuarioId',
  as: 'Usuario'
});

// Un vehículo puede tener muchas compras
Vehiculo.hasMany(Compra, {
  foreignKey: 'vehiculoId',
  as: 'compras'
});

// Una compra pertenece a un vehículo
Compra.belongsTo(Vehiculo, {
  foreignKey: 'vehiculoId',
  as: 'Vehiculo'
});

// ========================================
// 5. USUARIO ↔ ALQUILER ↔ VEHICULO ↔ RALLY
// ========================================
// Un usuario puede tener muchos alquileres
Usuario.hasMany(Alquiler, {
  foreignKey: 'usuarioId',
  as: 'alquileres'
});

// Un alquiler pertenece a un usuario
Alquiler.belongsTo(Usuario, {
  foreignKey: 'usuarioId',
  as: 'Usuario'
});

// Un vehículo puede tener muchos alquileres
Vehiculo.hasMany(Alquiler, {
  foreignKey: 'vehiculoId',
  as: 'alquileres'
});

// Un alquiler pertenece a un vehículo
Alquiler.belongsTo(Vehiculo, {
  foreignKey: 'vehiculoId',
  as: 'Vehiculo'
});

// Un rally puede tener muchos alquileres
Rally.hasMany(Alquiler, {
  foreignKey: 'rallyId',
  as: 'alquileres'
});

// Un alquiler pertenece a un rally
Alquiler.belongsTo(Rally, {
  foreignKey: 'rallyId',
  as: 'Rally'
});

// ========================================
// 6. USUARIO ↔ HISTORIAL ↔ RALLY ↔ VEHICULO
// ========================================
// Un usuario puede tener muchos registros de historial
Usuario.hasMany(Historial, {
  foreignKey: 'usuarioId',
  as: 'historiales'
});

// Un registro de historial pertenece a un usuario
Historial.belongsTo(Usuario, {
  foreignKey: 'usuarioId',
  as: 'Usuario'
});

// Un rally puede tener muchos registros de historial
Rally.hasMany(Historial, {
  foreignKey: 'rallyId',
  as: 'historiales'
});

// Un registro de historial pertenece a un rally
Historial.belongsTo(Rally, {
  foreignKey: 'rallyId',
  as: 'Rally'
});

// Un vehículo puede tener muchos registros de historial
Vehiculo.hasMany(Historial, {
  foreignKey: 'vehiculoId',
  as: 'historiales'
});

// Un registro de historial pertenece a un vehículo
Historial.belongsTo(Vehiculo, {
  foreignKey: 'vehiculoId',
  as: 'Vehiculo'
});

// ========================================
// EXPORTAR MODELOS Y SEQUELIZE
// ========================================

const db = {
  sequelize,
  Usuario,
  TokenVerificacion,
  Categoria,
  Vehiculo,
  VehiculoCategoria,
  Rally,
  CategoriaRally,
  Compra,
  Alquiler,
  Historial
};

export default db;

// Exportar también individualmente para mayor flexibilidad
export {
  sequelize,
  Usuario,
  TokenVerificacion,
  Categoria,
  Vehiculo,
  VehiculoCategoria,
  Rally,
  CategoriaRally,
  Compra,
  Alquiler,
  Historial
};