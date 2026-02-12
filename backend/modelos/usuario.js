import { DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
import sequelize from '../config/baseDatos.js';

const Usuario = sequelize.define(
  'Usuario',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El nombre no puede estar vacío'
        },
        len: {
          args: [2, 100],
          msg: 'El nombre debe tener entre 2 y 100 caracteres'
        }
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: {
        msg: 'Este email ya está registrado'
      },
      validate: {
        isEmail: {
          msg: 'Debe ser un email válido'
        },
        notEmpty: {
          msg: 'El email no puede estar vacío'
        }
      }
    },
    contraseña: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'La contraseña no puede estar vacía'
        },
        len: {
          args: [8, 255],
          msg: 'La contraseña debe tener al menos 8 caracteres'
        }
      }
    },
    equipo: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null
    },
    fotoPerfil: {
      type: DataTypes.STRING(500),
      allowNull: true,
      defaultValue: null,
      validate: {
        // Validar URL solo si NO es null/undefined
        esUrlValida(value) {
          if (value !== null && value !== undefined && value !== '') {
            const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
            if (!urlRegex.test(value)) {
              throw new Error('La foto de perfil debe ser una URL válida');
            }
          }
        }
      }
    },
    rol: {
      type: DataTypes.ENUM('usuario', 'creador_fechas', 'admin'),
      allowNull: false,
      defaultValue: 'usuario',
      validate: {
        isIn: {
          args: [['usuario', 'creador_fechas', 'admin']],
          msg: 'El rol debe ser: usuario, creador_fechas o admin'
        }
      }
    },
    emailVerificado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    tableName: 'usuarios',
    timestamps: true,
    hooks: {
      // Hook: ANTES de crear un usuario, encriptar la contraseña
      beforeCreate: async (usuario) => {
        if (usuario.contraseña) {
          const salt = await bcrypt.genSalt(10);
          usuario.contraseña = await bcrypt.hash(usuario.contraseña, salt);
        }
      },
      // Hook: ANTES de actualizar un usuario, encriptar la contraseña si cambió
      beforeUpdate: async (usuario) => {
        if (usuario.changed('contraseña')) {
          const salt = await bcrypt.genSalt(10);
          usuario.contraseña = await bcrypt.hash(usuario.contraseña, salt);
        }
      }
    }
  }
);

// ========================================
// MÉTODOS DE INSTANCIA
// ========================================

// Método para verificar contraseña
Usuario.prototype.verificarContraseña = async function (contraseñaIngresada) {
  return await bcrypt.compare(contraseñaIngresada, this.contraseña);
};

// Método para obtener usuario sin contraseña
Usuario.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.contraseña; // No devolver nunca la contraseña
  return values;
};

// ========================================
// MÉTODOS ESTÁTICOS
// ========================================

// Buscar usuario por email
Usuario.buscarPorEmail = async function (email) {
  return await Usuario.findOne({ where: { email } });
};

// Verificar si es admin
Usuario.prototype.esAdministrador = function () {
  return this.rol === 'admin';
};

// Verificar si es creador de fechas o admin
Usuario.prototype.esCreadorFechas = function () {
  return this.rol === 'creador_fechas' || this.rol === 'admin';
};

export default Usuario;