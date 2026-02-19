import { Usuario, Compra, Alquiler, Historial } from '../modelos/index.js';
import { subirImagen, eliminarImagen } from '../config/cloudinary.js';

// ========================================
// OBTENER PERFIL DE USUARIO
// ========================================
export const obtenerPerfil = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id, {
      attributes: { exclude: ['contraseña'] }
    });

    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        equipo: usuario.equipo,
        fotoPerfil: usuario.fotoPerfil,
        rol: usuario.rol,
        emailVerificado: usuario.emailVerificado
      }
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      error: 'Error al obtener perfil del usuario',
      detalle: error.message
    });
  }
};

// ========================================
// ACTUALIZAR PERFIL
// ========================================
export const actualizarPerfil = async (req, res) => {
  try {
    const usuario = req.usuario; // Viene del middleware
    const { nombre, equipo, fotoPerfil } = req.body;

    // Actualizar solo los campos permitidos
    if (nombre) usuario.nombre = nombre;
    if (equipo !== undefined) usuario.equipo = equipo;
    if (fotoPerfil !== undefined) usuario.fotoPerfil = fotoPerfil;

    await usuario.save();

    res.json({
      mensaje: 'Perfil actualizado exitosamente',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        equipo: usuario.equipo,
        fotoPerfil: usuario.fotoPerfil,
        rol: usuario.rol,
        emailVerificado: usuario.emailVerificado
      }
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      error: 'Error al actualizar perfil',
      detalle: error.message
    });
  }
};

// ========================================
// ACTUALIZAR FOTO DE PERFIL
// ========================================
export const actualizarFotoPerfil = async (req, res) => {
  try {
    const usuario = req.usuario;

    // Verificar que se haya enviado un archivo
    if (!req.file) {
      return res.status(400).json({
        error: 'No se envió ninguna imagen'
      });
    }

    // Eliminar la foto anterior si existe
    if (usuario.fotoPerfil) {
      await eliminarImagen(usuario.fotoPerfil);
    }

    // Construir nombre del archivo: nombre-usuario (sin espacios, en minúsculas)
    const nombreArchivo = usuario.nombre
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    // Subir nueva foto a Cloudinary con carpeta y nombre personalizados
    const urlImagen = await subirImagen(req.file.buffer, 'usuarios-photos', nombreArchivo);

    // Actualizar en la base de datos
    usuario.fotoPerfil = urlImagen;
    await usuario.save();

    res.json({
      mensaje: 'Foto de perfil actualizada exitosamente',
      fotoPerfil: urlImagen
    });
  } catch (error) {
    console.error('Error al actualizar foto de perfil:', error);
    res.status(500).json({
      error: 'Error al actualizar foto de perfil',
      detalle: error.message
    });
  }
};

// ========================================
// CAMBIAR CONTRASEÑA
// ========================================
export const cambiarContraseña = async (req, res) => {
  try {
    const { contraseñaActual, nuevaContraseña } = req.body;

    // Recargar usuario con contraseña (req.usuario no la tiene por toJSON)
    const usuario = await Usuario.findByPk(req.usuario.id);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar que la contraseña actual sea correcta
    const contraseñaValida = await usuario.verificarContraseña(contraseñaActual);

    if (!contraseñaValida) {
      return res.status(401).json({
        error: 'La contraseña actual es incorrecta'
      });
    }

    // Actualizar contraseña (se encripta automáticamente)
    usuario.contraseña = nuevaContraseña;
    await usuario.save();

    res.json({
      mensaje: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      error: 'Error al cambiar contraseña',
      detalle: error.message
    });
  }
};

// ========================================
// OBTENER MI GARAGE (VEHÍCULOS ACTIVOS)
// ========================================
export const obtenerMiGarage = async (req, res) => {
  try {
    const usuario = req.usuario;

    // Obtener compras activas (vehículos comprados)
    const compras = await Compra.obtenerActivasUsuario(usuario.id);

    // Obtener alquileres activos (vehículos alquilados)
    const alquileres = await Alquiler.obtenerActivosUsuario(usuario.id);

    // Formatear respuesta
    const vehiculosComprados = compras.map(compra => ({
      id: compra.id,
      vehiculo: {
        id: compra.Vehiculo.id,
        marca: compra.Vehiculo.marca,
        nombre: compra.Vehiculo.nombre,
        foto: compra.Vehiculo.foto
      },
      tipo: 'compra',
      fechaCompra: compra.fechaCompra,
      fechaVencimiento: compra.fechaVencimiento,
      diasRestantes: compra.diasRestantes()
    }));

    const vehiculosAlquilados = alquileres.map(alquiler => ({
      id: alquiler.id,
      vehiculo: {
        id: alquiler.Vehiculo.id,
        marca: alquiler.Vehiculo.marca,
        nombre: alquiler.Vehiculo.nombre,
        foto: alquiler.Vehiculo.foto
      },
      rally: {
        id: alquiler.Rally.id,
        nombre: alquiler.Rally.nombre,
        fecha: alquiler.Rally.fecha
      },
      tipo: 'alquiler',
      fechaAlquiler: alquiler.fechaAlquiler,
      fechaFinalizacion: alquiler.fechaReprogramada || alquiler.fechaFinalizacion,
      diasRestantes: alquiler.diasRestantes(),
      reprogramado: alquiler.fueReprogramado()
    }));

    res.json({
      garage: {
        compras: vehiculosComprados,
        alquileres: vehiculosAlquilados,
        total: vehiculosComprados.length + vehiculosAlquilados.length
      }
    });
  } catch (error) {
    console.error('Error al obtener garage:', error);
    res.status(500).json({
      error: 'Error al obtener garage',
      detalle: error.message
    });
  }
};

// ========================================
// LISTAR TODOS LOS USUARIOS (ADMIN)
// ========================================
export const listarUsuarios = async (req, res) => {
  try {
    const { rol, emailVerificado, limite = 50, pagina = 1 } = req.query;

    const whereClause = {};

    if (rol) whereClause.rol = rol;
    if (emailVerificado !== undefined) whereClause.emailVerificado = emailVerificado === 'true';

    const usuarios = await Usuario.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['contraseña'] },
      limit: parseInt(limite),
      offset: (parseInt(pagina) - 1) * parseInt(limite),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      usuarios: usuarios.rows,
      paginacion: {
        total: usuarios.count,
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        totalPaginas: Math.ceil(usuarios.count / parseInt(limite))
      }
    });
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({
      error: 'Error al listar usuarios',
      detalle: error.message
    });
  }
};

// ========================================
// CAMBIAR ROL DE USUARIO (ADMIN)
// ========================================
export const cambiarRol = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol } = req.body;

    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    // No permitir que un admin se quite sus propios permisos
    if (usuario.id === req.usuario.id && rol !== 'admin') {
      return res.status(400).json({
        error: 'No podés quitarte tus propios permisos de administrador'
      });
    }

    usuario.rol = rol;
    await usuario.save();

    res.json({
      mensaje: 'Rol actualizado exitosamente',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('Error al cambiar rol:', error);
    res.status(500).json({
      error: 'Error al cambiar rol',
      detalle: error.message
    });
  }
};

// ========================================
// ELIMINAR USUARIO (ADMIN)
// ========================================
export const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    // No permitir que un admin se elimine a sí mismo
    if (usuario.id === req.usuario.id) {
      return res.status(400).json({
        error: 'No podés eliminar tu propia cuenta'
      });
    }

    // Eliminar foto de perfil de Cloudinary si existe
    if (usuario.fotoPerfil) {
      await eliminarImagen(usuario.fotoPerfil);
    }

    await usuario.destroy();

    res.json({
      mensaje: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      error: 'Error al eliminar usuario',
      detalle: error.message
    });
  }
};