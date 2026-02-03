import { DataTypes } from 'sequelize';
import crypto from 'crypto';
import sequelize from '../config/baseDatos.js';

const TokenVerificacion = sequelize.define(
  'TokenVerificacion',
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
      onDelete: 'CASCADE', // Si se borra el usuario, se borran sus tokens
      onUpdate: 'CASCADE'
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    tipoToken: {
      type: DataTypes.ENUM('verificacion_email', 'recuperacion_password'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['verificacion_email', 'recuperacion_password']],
          msg: 'El tipo debe ser verificacion_email o recuperacion_password'
        }
      }
    },
    expiraEn: {
      type: DataTypes.DATE,
      allowNull: false
    },
    usado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    tableName: 'tokens_verificacion',
    timestamps: true
  }
);

// ========================================
// MÉTODOS ESTÁTICOS
// ========================================

// Generar token único
TokenVerificacion.generarToken = function () {
  return crypto.randomBytes(32).toString('hex');
};

// Crear token de verificación de email (expira en 24 horas)
TokenVerificacion.crearTokenEmail = async function (usuarioId) {
  const token = TokenVerificacion.generarToken();
  const expiraEn = new Date();
  expiraEn.setHours(expiraEn.getHours() + 24); // 24 horas desde ahora

  return await TokenVerificacion.create({
    usuarioId,
    token,
    tipoToken: 'verificacion_email',
    expiraEn,
    usado: false
  });
};

// Crear token de recuperación de contraseña (expira en 1 hora)
TokenVerificacion.crearTokenRecuperacion = async function (usuarioId) {
  const token = TokenVerificacion.generarToken();
  const expiraEn = new Date();
  expiraEn.setHours(expiraEn.getHours() + 1); // 1 hora desde ahora

  return await TokenVerificacion.create({
    usuarioId,
    token,
    tipoToken: 'recuperacion_password',
    expiraEn,
    usado: false
  });
};

// Verificar si un token es válido
TokenVerificacion.verificarToken = async function (token, tipoToken) {
  const tokenEncontrado = await TokenVerificacion.findOne({
    where: {
      token,
      tipoToken,
      usado: false
    }
  });

  if (!tokenEncontrado) {
    return { valido: false, mensaje: 'Token no encontrado o ya fue usado' };
  }

  // Verificar si expiró
  const ahora = new Date();
  if (ahora > tokenEncontrado.expiraEn) {
    return { valido: false, mensaje: 'El token ha expirado' };
  }

  return { valido: true, token: tokenEncontrado };
};

// Marcar token como usado
TokenVerificacion.prototype.marcarComoUsado = async function () {
  this.usado = true;
  await this.save();
};

// Limpiar tokens expirados (usar en cron job)
TokenVerificacion.limpiarTokensExpirados = async function () {
  const ahora = new Date();
  const resultado = await TokenVerificacion.destroy({
    where: {
      expiraEn: {
        [sequelize.Sequelize.Op.lt]: ahora // Menores que ahora
      }
    }
  });
  console.log(`🗑️  Tokens expirados eliminados: ${resultado}`);
  return resultado;
};

export default TokenVerificacion;