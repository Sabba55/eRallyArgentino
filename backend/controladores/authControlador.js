import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Usuario, TokenVerificacion } from '../modelos/index.js';
import { enviarEmailVerificacion, enviarEmailRecuperacion } from '../utilidades/enviarEmail.js';

// ========================================
// REGISTRO DE USUARIO
// ========================================
export const registro = async (req, res) => {
  try {
    console.log('📥 Datos recibidos en registro:', req.body);
    
    const { nombre, email, contraseña, equipo, fotoPerfil } = req.body;

    // LOG: Verificar cada campo
    console.log('🔍 Campos procesados:', {
      nombre: nombre || 'NO RECIBIDO',
      email: email || 'NO RECIBIDO',
      contraseña: contraseña ? `${contraseña.length} caracteres` : 'NO RECIBIDO',
      equipo: equipo || 'vacío (opcional)',
      fotoPerfil: fotoPerfil || 'vacío (opcional)'
    });

    // Verificar si el email ya existe
    const usuarioExistente = await Usuario.findOne({ where: { email } });

    if (usuarioExistente) {
      return res.status(400).json({
        error: 'Este email ya está registrado'
      });
    }

    // Crear el usuario
    console.log('🚀 Intentando crear usuario...');
    const nuevoUsuario = await Usuario.create({
      nombre,
      email,
      contraseña, // Se encripta automáticamente en el hook del modelo
      equipo,
      fotoPerfil,
      rol: 'usuario',
      emailVerificado: false
    });

    console.log('✅ Usuario creado exitosamente:', nuevoUsuario.id);

    // Crear token de verificación
    const tokenVerificacion = await TokenVerificacion.crearTokenEmail(nuevoUsuario.id);

    // Enviar email de verificación (no bloquea el registro si falla)
    try {
      await enviarEmailVerificacion(email, nombre, tokenVerificacion.token)
    } catch (emailError) {
      console.warn('⚠️ No se pudo enviar email de verificación:', emailError.message)
    }

    // Generar JWT para login automático
    const token = jwt.sign(
      { id: nuevoUsuario.id, email: nuevoUsuario.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION || '7d' }
    );

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      token,
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        equipo: nuevoUsuario.equipo,
        fotoPerfil: nuevoUsuario.fotoPerfil,
        rol: nuevoUsuario.rol,
        emailVerificado: nuevoUsuario.emailVerificado,
        createdAt: nuevoUsuario.createdAt
      },
      aviso: 'Revisá tu email para verificar tu cuenta'
    });
  } catch (error) {
    console.error('❌ Error en registro:', error);
    
    // Si es error de validación de Sequelize
    if (error.name === 'SequelizeValidationError') {
      const errores = error.errors.map(e => e.message);
      console.error('🔴 Errores de validación:', errores);
      return res.status(400).json({
        error: 'Errores de validación',
        detalles: errores
      });
    }
    
    // Si es error de unique constraint
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.error('🔴 Email duplicado');
      return res.status(400).json({
        error: 'Este email ya está registrado'
      });
    }
    
    res.status(500).json({
      error: 'Error al registrar usuario',
      detalle: error.message
    });
  }
};

// ========================================
// LOGIN
// ========================================
export const login = async (req, res) => {
  try {
    const { email, contraseña } = req.body;

    // Buscar usuario por email
    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
      return res.status(401).json({
        error: 'Email o contraseña incorrectos'
      });
    }

    // Verificar contraseña
    const contraseñaValida = await usuario.verificarContraseña(contraseña);

    if (!contraseñaValida) {
      return res.status(401).json({
        error: 'Email o contraseña incorrectos'
      });
    }

    // Generar JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION || '7d' }
    );

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        equipo: usuario.equipo,
        fotoPerfil: usuario.fotoPerfil,
        rol: usuario.rol,
        emailVerificado: usuario.emailVerificado,
        createdAt: usuario.createdAt
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      error: 'Error al iniciar sesión',
      detalle: error.message
    });
  }
};

// ========================================
// VERIFICAR EMAIL
// ========================================
export const verificarEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Verificar que el token sea válido
    const verificacion = await TokenVerificacion.verificarToken(token, 'verificacion_email');

    if (!verificacion.valido) {
      return res.status(400).json({
        error: verificacion.mensaje
      });
    }

    // Buscar el usuario
    const usuario = await Usuario.findByPk(verificacion.token.usuarioId);

    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    // Verificar el email del usuario
    usuario.emailVerificado = true;
    await usuario.save();

    // Marcar el token como usado
    await verificacion.token.marcarComoUsado();

    res.json({
      mensaje: 'Email verificado exitosamente',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        emailVerificado: usuario.emailVerificado
      }
    });
  } catch (error) {
    console.error('Error al verificar email:', error);
    res.status(500).json({
      error: 'Error al verificar email',
      detalle: error.message
    });
  }
};

// ========================================
// REENVIAR EMAIL DE VERIFICACIÓN
// ========================================
export const reenviarVerificacion = async (req, res) => {
  try {
    const usuario = req.usuario; // Viene del middleware de autenticación

    if (usuario.emailVerificado) {
      return res.status(400).json({
        error: 'Tu email ya está verificado'
      });
    }

    // Invalidar tokens anteriores
    await TokenVerificacion.destroy({
      where: {
        usuarioId: usuario.id,
        tipoToken: 'verificacion_email',
        usado: false
      }
    });

    // Crear nuevo token
    const tokenVerificacion = await TokenVerificacion.crearTokenEmail(usuario.id);

    // Enviar email
    await enviarEmailVerificacion(usuario.email, usuario.nombre, tokenVerificacion.token);

    res.json({
      mensaje: 'Email de verificación reenviado',
      aviso: 'Revisá tu casilla de correo'
    });
  } catch (error) {
    console.error('Error al reenviar verificación:', error);
    res.status(500).json({
      error: 'Error al reenviar email de verificación',
      detalle: error.message
    });
  }
};

// ========================================
// SOLICITAR RECUPERACIÓN DE CONTRASEÑA
// ========================================
export const solicitarRecuperacion = async (req, res) => {
  try {
    const { email } = req.body;
    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
      return res.json({
        mensaje: 'Si el email existe, recibirás un link de recuperación'
      });
    }

    const tokenRecuperacion = await TokenVerificacion.crearTokenRecuperacion(usuario.id);

    // ← Protegido igual que en registro
    try {
      await enviarEmailRecuperacion(usuario.email, usuario.nombre, tokenRecuperacion.token);
    } catch (emailError) {
      console.warn('⚠️ No se pudo enviar email de recuperación:', emailError.message)
    }

    res.json({
      mensaje: 'Si el email existe, recibirás un link de recuperación'
    });
  } catch (error) {
    console.error('Error al solicitar recuperación:', error);
    res.status(500).json({
      error: 'Error al solicitar recuperación de contraseña',
      detalle: error.message
    });
  }
};

// ========================================
// RESETEAR CONTRASEÑA
// ========================================
export const resetearContraseña = async (req, res) => {
  try {
    const { token, nuevaContraseña } = req.body;

    // Verificar token
    const verificacion = await TokenVerificacion.verificarToken(token, 'recuperacion_password');

    if (!verificacion.valido) {
      return res.status(400).json({
        error: verificacion.mensaje
      });
    }

    // Buscar usuario
    const usuario = await Usuario.findByPk(verificacion.token.usuarioId);

    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    // Actualizar contraseña (se encripta automáticamente)
    usuario.contraseña = nuevaContraseña;
    await usuario.save();

    // Marcar token como usado
    await verificacion.token.marcarComoUsado();

    res.json({
      mensaje: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al resetear contraseña:', error);
    res.status(500).json({
      error: 'Error al resetear contraseña',
      detalle: error.message
    });
  }
};

// ========================================
// OBTENER USUARIO ACTUAL
// ========================================
export const obtenerUsuarioActual = async (req, res) => {
  try {
    const usuario = req.usuario; // Viene del middleware de autenticación

    res.json({
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        equipo: usuario.equipo,
        fotoPerfil: usuario.fotoPerfil,
        rol: usuario.rol,
        emailVerificado: usuario.emailVerificado,
        createdAt: usuario.createdAt
      }
    });
  } catch (error) {
    console.error('Error al obtener usuario actual:', error);
    res.status(500).json({
      error: 'Error al obtener datos del usuario',
      detalle: error.message
    });
  }
};