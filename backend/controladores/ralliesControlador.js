import { Rally, Categoria, CategoriaRally, Alquiler } from '../modelos/index.js';
import { subirImagen, eliminarImagen } from '../config/cloudinary.js';
import { enviarEmailReprogramacion, enviarEmailCancelacion } from '../utilidades/enviarEmail.js';
import { Op } from 'sequelize';

// ========================================
// LISTAR TODOS LOS RALLIES
// ========================================
export const listarRallies = async (req, res) => {
  try {
    const { campeonato, estado = 'todos', limite = 50, pagina = 1 } = req.query;

    const whereClause = {};
    if (campeonato) whereClause.campeonato = campeonato;

    const ahora = new Date();
    if (estado === 'proximos') {
      whereClause.fecha = { [Op.gte]: ahora };
    } else if (estado === 'pasados') {
      whereClause.fecha = { [Op.lt]: ahora };
    }

    const rallies = await Rally.findAndCountAll({
      where: whereClause,
      include: [{
        model: Categoria,
        as: 'categorias',
        through: { attributes: [] }
      }],
      limit: parseInt(limite),
      offset: (parseInt(pagina) - 1) * parseInt(limite),
      order: [['fecha', estado === 'pasados' ? 'DESC' : 'ASC']]
    });

    res.json({
      rallies: rallies.rows,
      paginacion: {
        total: rallies.count,
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        totalPaginas: Math.ceil(rallies.count / parseInt(limite))
      }
    });
  } catch (error) {
    console.error('Error al listar rallies:', error);
    res.status(500).json({
      error: 'Error al listar rallies',
      detalle: error.message
    });
  }
};

// ========================================
// LISTAR PRÓXIMOS RALLIES (PÚBLICO)
// ========================================
export const listarProximos = async (req, res) => {
  try {
    const rallies = await Rally.obtenerProximos();
    res.json({ rallies, total: rallies.length });
  } catch (error) {
    console.error('Error al listar próximos rallies:', error);
    res.status(500).json({
      error: 'Error al listar próximos rallies',
      detalle: error.message
    });
  }
};

// ========================================
// LISTAR RALLIES PASADOS (PÚBLICO)
// ========================================
export const listarPasados = async (req, res) => {
  try {
    const rallies = await Rally.obtenerPasados();
    res.json({ rallies, total: rallies.length });
  } catch (error) {
    console.error('Error al listar rallies pasados:', error);
    res.status(500).json({
      error: 'Error al listar rallies pasados',
      detalle: error.message
    });
  }
};

// ========================================
// OBTENER RALLY POR ID
// ========================================
export const obtenerRally = async (req, res) => {
  try {
    const { id } = req.params;
    const rally = await Rally.buscarConCategorias(id);

    if (!rally) {
      return res.status(404).json({ error: 'Rally no encontrado' });
    }

    const rallyData = rally.toJSON();
    rallyData.fueReprogramado = rally.fueReprogramado();
    rallyData.yaPaso = rally.yaPaso();

    res.json({ rally: rallyData });
  } catch (error) {
    console.error('Error al obtener rally:', error);
    res.status(500).json({
      error: 'Error al obtener rally',
      detalle: error.message
    });
  }
};

// ========================================
// CREAR RALLY - ACTUALIZADO
// ========================================
export const crearRally = async (req, res) => {
  try {
    const { campeonato, nombre, subtitulo, fecha } = req.body;
    const usuario = req.usuario;

    // Normalizar categoriasIds (FormData los envía como strings)
    let categoriasIds = req.body.categoriasIds || [];
    if (!Array.isArray(categoriasIds)) categoriasIds = [categoriasIds];
    categoriasIds = categoriasIds.map(id => parseInt(id)).filter(id => !isNaN(id));

    // Normalizar contactos
    let contactos = null;
    if (req.body.contactos) {
      try {
        contactos = typeof req.body.contactos === 'string' 
          ? JSON.parse(req.body.contactos) 
          : req.body.contactos;
      } catch (e) {
        contactos = null;
      }
    }

    // Subir logo a Cloudinary si se envió archivo
    let urlLogo = null;
    if (req.file) {
      // Construir nombre: primera-segunda (en minúsculas, sin espacios)
      const palabras = campeonato.trim().toLowerCase().split(/\s+/);
      const nombreArchivo = palabras.slice(0, 2).join('-').replace(/[^a-z0-9-]/g, '');
      urlLogo = await subirImagen(req.file.buffer, 'campeonato', nombreArchivo);
    } else if (req.body.logoExistente) {
      // Si se seleccionó un logo existente
      urlLogo = req.body.logoExistente;
    }

    const nuevoRally = await Rally.create({
      campeonato,
      nombre,
      subtitulo: subtitulo || null,
      fecha: new Date(fecha),
      logo: urlLogo,
      contactos,
      creadoPorId: usuario.id
    });

    if (categoriasIds.length > 0) {
      await CategoriaRally.habilitarCategorias(nuevoRally.id, categoriasIds);
    }

    const rallyConCategorias = await Rally.buscarConCategorias(nuevoRally.id);
    res.status(201).json({
      mensaje: 'Rally creado exitosamente',
      rally: rallyConCategorias
    });
  } catch (error) {
    console.error('Error al crear rally:', error);
    res.status(500).json({
      error: 'Error al crear rally',
      detalle: error.message
    });
  }
};

// ========================================
// ACTUALIZAR RALLY - ACTUALIZADO
// ========================================
export const actualizarRally = async (req, res) => {
  try {
    const { id } = req.params;
    const { campeonato, nombre, subtitulo, fecha } = req.body;

    const rally = await Rally.findByPk(id);
    if (!rally) {
      return res.status(404).json({ error: 'Rally no encontrado' });
    }

    // Normalizar categoriasIds
    let categoriasIds = req.body.categoriasIds || [];
    if (!Array.isArray(categoriasIds)) categoriasIds = [categoriasIds];
    categoriasIds = categoriasIds.map(id => parseInt(id)).filter(id => !isNaN(id));

    // Normalizar contactos
    let contactos = null;
    if (req.body.contactos) {
      try {
        contactos = typeof req.body.contactos === 'string'
          ? JSON.parse(req.body.contactos)
          : req.body.contactos;
      } catch (e) {
        contactos = null;
      }
    }

    // Manejar logo
    if (req.file) {
      // Eliminar logo anterior si existe
      if (rally.logo) await eliminarImagen(rally.logo);
      
      // Subir nuevo logo
      const palabras = (campeonato || rally.campeonato).trim().toLowerCase().split(/\s+/);
      const nombreArchivo = palabras.slice(0, 2).join('-').replace(/[^a-z0-9-]/g, '');
      rally.logo = await subirImagen(req.file.buffer, 'campeonato', nombreArchivo);
    } else if (req.body.logoExistente) {
      // Seleccionó un logo existente
      if (rally.logo && rally.logo !== req.body.logoExistente) {
        await eliminarImagen(rally.logo);
      }
      rally.logo = req.body.logoExistente;
    } else if (req.body.logo !== undefined) {
      // Si se envió logo como string (vacío = eliminar)
      if (rally.logo && req.body.logo !== rally.logo) {
        await eliminarImagen(rally.logo);
      }
      rally.logo = req.body.logo || null;
    }

    // Actualizar campos
    if (campeonato) rally.campeonato = campeonato;
    if (nombre) rally.nombre = nombre;
    if (subtitulo !== undefined) rally.subtitulo = subtitulo;
    if (fecha) rally.fecha = new Date(fecha);
    if (contactos) rally.contactos = contactos;

    await rally.save();

    // Actualizar categorías
    if (categoriasIds && Array.isArray(categoriasIds)) {
      await CategoriaRally.deshabilitarTodasCategoriasRally(rally.id);
      if (categoriasIds.length > 0) {
        await CategoriaRally.habilitarCategorias(rally.id, categoriasIds);
      }
    }

    const rallyActualizado = await Rally.buscarConCategorias(rally.id);
    res.json({
      mensaje: 'Rally actualizado exitosamente',
      rally: rallyActualizado
    });
  } catch (error) {
    console.error('Error al actualizar rally:', error);
    res.status(500).json({
      error: 'Error al actualizar rally',
      detalle: error.message
    });
  }
};

// ========================================
// REPROGRAMAR RALLY (sin cambios)
// ========================================
export const reprogramarRally = async (req, res) => {
  try {
    const { id } = req.params;
    const { nuevaFecha } = req.body;

    const rally = await Rally.findByPk(id);
    if (!rally) {
      return res.status(404).json({ error: 'Rally no encontrado' });
    }

    const fechaAnterior = rally.fecha;
    await rally.reprogramar(new Date(nuevaFecha));

    const alquileres = await Alquiler.obtenerPorRally(id);

    for (const alquiler of alquileres) {
      await alquiler.reprogramar(new Date(nuevaFecha));

      const usuario = await alquiler.Usuario;
      const vehiculo = await alquiler.Vehiculo;

      await enviarEmailReprogramacion(
        usuario.email,
        usuario.nombre,
        rally.nombre,
        vehiculo.nombreCompleto(),
        fechaAnterior,
        nuevaFecha
      );
    }

    res.json({
      mensaje: 'Rally reprogramado exitosamente',
      rally: {
        id: rally.id,
        nombre: rally.nombre,
        fechaOriginal: rally.fechaOriginal,
        fechaAnterior,
        fechaNueva: rally.fecha
      },
      alquileresActualizados: alquileres.length
    });
  } catch (error) {
    console.error('Error al reprogramar rally:', error);
    res.status(500).json({
      error: 'Error al reprogramar rally',
      detalle: error.message
    });
  }
};

// ========================================
// CARGAR RESULTADOS (sin cambios)
// ========================================
export const cargarResultados = async (req, res) => {
  try {
    const { id } = req.params;
    const { resultados } = req.body;

    const rally = await Rally.findByPk(id);
    if (!rally) {
      return res.status(404).json({ error: 'Rally no encontrado' });
    }

    await rally.cargarResultados(resultados);

    res.json({
      mensaje: 'Resultados cargados exitosamente',
      rally: {
        id: rally.id,
        nombre: rally.nombre,
        resultados: rally.resultados
      }
    });
  } catch (error) {
    console.error('Error al cargar resultados:', error);
    res.status(500).json({
      error: 'Error al cargar resultados',
      detalle: error.message
    });
  }
};

// ========================================
// ELIMINAR RALLY (sin cambios)
// ========================================
export const eliminarRally = async (req, res) => {
  try {
    const { id } = req.params;

    const rally = await Rally.findByPk(id);
    if (!rally) {
      return res.status(404).json({ error: 'Rally no encontrado' });
    }

    const alquileres = await Alquiler.obtenerPorRally(id);

    for (const alquiler of alquileres) {
      const usuario = await alquiler.Usuario;
      const vehiculo = await alquiler.Vehiculo;

      await alquiler.marcarRallyCancelado();

      await enviarEmailCancelacion(
        usuario.email,
        usuario.nombre,
        rally.nombre,
        vehiculo.nombreCompleto()
      );
    }

    if (rally.logo) {
      await eliminarImagen(rally.logo);
    }

    await rally.destroy();

    res.json({
      mensaje: 'Rally eliminado exitosamente',
      usuariosNotificados: alquileres.length
    });
  } catch (error) {
    console.error('Error al eliminar rally:', error);

    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        error: 'No se puede eliminar este rally porque tiene registros en el historial'
      });
    }

    res.status(500).json({
      error: 'Error al eliminar rally',
      detalle: error.message
    });
  }
};

// ========================================
// GESTIÓN DE CATEGORÍAS (sin cambios)
// ========================================
export const habilitarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoriaId } = req.body;

    const rally = await Rally.findByPk(id);
    if (!rally) {
      return res.status(404).json({ error: 'Rally no encontrado' });
    }

    const categoria = await Categoria.findByPk(categoriaId);
    if (!categoria) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    await CategoriaRally.habilitarCategoria(id, categoriaId);

    res.json({ mensaje: 'Categoría habilitada exitosamente' });
  } catch (error) {
    console.error('Error al habilitar categoría:', error);
    res.status(500).json({
      error: 'Error al habilitar categoría',
      detalle: error.message
    });
  }
};

export const deshabilitarCategoria = async (req, res) => {
  try {
    const { id, categoriaId } = req.params;

    await CategoriaRally.deshabilitarCategoria(id, categoriaId);

    res.json({ mensaje: 'Categoría deshabilitada exitosamente' });
  } catch (error) {
    console.error('Error al deshabilitar categoría:', error);
    res.status(500).json({
      error: 'Error al deshabilitar categoría',
      detalle: error.message
    });
  }
};