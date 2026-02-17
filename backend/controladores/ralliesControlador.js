import { Rally, Categoria, CategoriaRally, Alquiler } from '../modelos/index.js';
import { subirImagen, eliminarImagen } from '../config/cloudinary.js';
import { enviarEmailReprogramacion, enviarEmailCancelacion } from '../utilidades/enviarEmail.js';

// ========================================
// LISTAR TODOS LOS RALLIES
// ========================================
export const listarRallies = async (req, res) => {
  try {
    const { campeonato, estado = 'todos', limite = 50, pagina = 1 } = req.query;

    const whereClause = {};
    if (campeonato) whereClause.campeonato = campeonato;

    // Filtrar por estado (próximos, pasados, todos)
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

    res.json({
      rallies,
      total: rallies.length
    });
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

    res.json({
      rallies,
      total: rallies.length
    });
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
      return res.status(404).json({
        error: 'Rally no encontrado'
      });
    }

    // Agregar información adicional
    const rallyData = rally.toJSON();
    rallyData.fueReprogramado = rally.fueReprogramado();
    rallyData.yaPaso = rally.yaPaso();

    res.json({
      rally: rallyData
    });
  } catch (error) {
    console.error('Error al obtener rally:', error);
    res.status(500).json({
      error: 'Error al obtener rally',
      detalle: error.message
    });
  }
};

// ========================================
// CREAR RALLY (CREADOR FECHAS / ADMIN)
// ACTUALIZADO - Asigna automáticamente creadoPorId
// ========================================
export const crearRally = async (req, res) => {
  try {
    const { campeonato, nombre, subtitulo, fecha, contactos, categoriasIds } = req.body;
    const usuario = req.usuario; // Usuario autenticado

    // Verificar que se haya enviado un logo (OPCIONAL)
    let urlLogo = null;
    if (req.file) {
      urlLogo = await subirImagen(req.file.buffer, 'rallies');
    }

    // Crear rally CON creadoPorId
    const nuevoRally = await Rally.create({
      campeonato,
      nombre,
      subtitulo,
      fecha: new Date(fecha),
      logo: urlLogo,
      contactos: contactos ? JSON.parse(contactos) : null,
      creadoPorId: usuario.id // ASIGNAR CREADOR
    });

    // Asignar categorías permitidas si se especificaron
    if (categoriasIds && Array.isArray(categoriasIds) && categoriasIds.length > 0) {
      await CategoriaRally.habilitarCategorias(nuevoRally.id, categoriasIds);
    }

    // Obtener rally con categorías
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
// ACTUALIZAR RALLY (CREADOR FECHAS / ADMIN)
// ========================================
export const actualizarRally = async (req, res) => {
  try {
    const { id } = req.params;
    const { campeonato, nombre, subtitulo, fecha, contactos, categoriasIds, logo } = req.body;

    const rally = await Rally.findByPk(id);

    if (!rally) {
      return res.status(404).json({
        error: 'Rally no encontrado'
      });
    }

    // Si se envió nuevo logo como archivo, actualizar
    if (req.file) {
      // Eliminar logo anterior solo si existe
      if (rally.logo) {
        await eliminarImagen(rally.logo);
      }

      // Subir nuevo logo
      const urlLogo = await subirImagen(req.file.buffer, 'rallies');
      rally.logo = urlLogo;
    } else if (logo !== undefined) {
      // Si se envió logo como URL en el body
      if (rally.logo && logo !== rally.logo) {
        await eliminarImagen(rally.logo);
      }
      rally.logo = logo || null;
    }

    // Actualizar campos
    if (campeonato) rally.campeonato = campeonato;
    if (nombre) rally.nombre = nombre;
    if (subtitulo !== undefined) rally.subtitulo = subtitulo;
    if (fecha) rally.fecha = new Date(fecha);
    if (contactos) rally.contactos = JSON.parse(contactos);

    await rally.save();

    // Actualizar categorías si se especificaron
    if (categoriasIds && Array.isArray(categoriasIds)) {
      await CategoriaRally.deshabilitarTodasCategoriasRally(rally.id);
      if (categoriasIds.length > 0) {
        await CategoriaRally.habilitarCategorias(rally.id, categoriasIds);
      }
    }

    // Obtener rally actualizado
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
// REPROGRAMAR RALLY (CREADOR FECHAS / ADMIN)
// ========================================
export const reprogramarRally = async (req, res) => {
  try {
    const { id } = req.params;
    const { nuevaFecha } = req.body;

    const rally = await Rally.findByPk(id);

    if (!rally) {
      return res.status(404).json({
        error: 'Rally no encontrado'
      });
    }

    // Guardar fecha anterior
    const fechaAnterior = rally.fecha;

    // Reprogramar rally
    await rally.reprogramar(new Date(nuevaFecha));

    // Actualizar todos los alquileres asociados
    const alquileres = await Alquiler.obtenerPorRally(id);

    for (const alquiler of alquileres) {
      await alquiler.reprogramar(new Date(nuevaFecha));

      // Enviar email de notificación al usuario
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
// CARGAR RESULTADOS (CREADOR FECHAS / ADMIN)
// ========================================
export const cargarResultados = async (req, res) => {
  try {
    const { id } = req.params;
    const { resultados } = req.body;

    const rally = await Rally.findByPk(id);

    if (!rally) {
      return res.status(404).json({
        error: 'Rally no encontrado'
      });
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
// ELIMINAR RALLY (ADMIN)
// ========================================
export const eliminarRally = async (req, res) => {
  try {
    const { id } = req.params;

    const rally = await Rally.findByPk(id);

    if (!rally) {
      return res.status(404).json({
        error: 'Rally no encontrado'
      });
    }

    // Notificar a usuarios con alquileres
    const alquileres = await Alquiler.obtenerPorRally(id);

    for (const alquiler of alquileres) {
      const usuario = await alquiler.Usuario;
      const vehiculo = await alquiler.Vehiculo;

      // Marcar alquiler como rally cancelado
      await alquiler.marcarRallyCancelado();

      // Enviar email
      await enviarEmailCancelacion(
        usuario.email,
        usuario.nombre,
        rally.nombre,
        vehiculo.nombreCompleto()
      );
    }

    // Eliminar logo de Cloudinary
    await eliminarImagen(rally.logo);

    // Eliminar rally
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
// GESTIÓN DE CATEGORÍAS DEL RALLY
// ========================================

// Habilitar categoría en un rally
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

    res.json({
      mensaje: 'Categoría habilitada exitosamente'
    });
  } catch (error) {
    console.error('Error al habilitar categoría:', error);
    res.status(500).json({
      error: 'Error al habilitar categoría',
      detalle: error.message
    });
  }
};

// Deshabilitar categoría de un rally
export const deshabilitarCategoria = async (req, res) => {
  try {
    const { id, categoriaId } = req.params;

    await CategoriaRally.deshabilitarCategoria(id, categoriaId);

    res.json({
      mensaje: 'Categoría deshabilitada exitosamente'
    });
  } catch (error) {
    console.error('Error al deshabilitar categoría:', error);
    res.status(500).json({
      error: 'Error al deshabilitar categoría',
      detalle: error.message
    });
  }
};