import { Vehiculo, Categoria, VehiculoCategoria } from '../modelos/index.js';
import { subirImagen, eliminarImagen } from '../config/cloudinary.js';

// ========================================
// LISTAR TODOS LOS VEHÍCULOS
// ========================================
export const listarVehiculos = async (req, res) => {
  try {
    const { disponible, marca, categoriaId, limite = 50, pagina = 1 } = req.query;

    const whereClause = {};
    if (disponible !== undefined) whereClause.disponible = disponible === 'true';
    if (marca) whereClause.marca = { [Op.iLike]: `%${marca}%` };

    const includeOptions = [{
      model: Categoria,
      as: 'categorias',
      through: { attributes: [] }
    }];

    // Filtrar por categoría si se especifica
    if (categoriaId) {
      includeOptions[0].where = { id: categoriaId };
      includeOptions[0].required = true;
    }

    const vehiculos = await Vehiculo.findAndCountAll({
      where: whereClause,
      include: includeOptions,
      limit: parseInt(limite),
      offset: (parseInt(pagina) - 1) * parseInt(limite),
      order: [['marca', 'ASC'], ['nombre', 'ASC']],
      distinct: true
    });

    res.json({
      vehiculos: vehiculos.rows,
      paginacion: {
        total: vehiculos.count,
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        totalPaginas: Math.ceil(vehiculos.count / parseInt(limite))
      }
    });
  } catch (error) {
    console.error('Error al listar vehículos:', error);
    res.status(500).json({
      error: 'Error al listar vehículos',
      detalle: error.message
    });
  }
};

// ========================================
// LISTAR VEHÍCULOS DISPONIBLES (PÚBLICO)
// ========================================
export const listarDisponibles = async (req, res) => {
  try {
    const vehiculos = await Vehiculo.obtenerDisponibles();

    res.json({
      vehiculos,
      total: vehiculos.length
    });
  } catch (error) {
    console.error('Error al listar vehículos disponibles:', error);
    res.status(500).json({
      error: 'Error al listar vehículos disponibles',
      detalle: error.message
    });
  }
};

// ========================================
// OBTENER VEHÍCULO POR ID
// ========================================
export const obtenerVehiculo = async (req, res) => {
  try {
    const { id } = req.params;

    const vehiculo = await Vehiculo.buscarConCategorias(id);

    if (!vehiculo) {
      return res.status(404).json({
        error: 'Vehículo no encontrado'
      });
    }

    res.json({
      vehiculo
    });
  } catch (error) {
    console.error('Error al obtener vehículo:', error);
    res.status(500).json({
      error: 'Error al obtener vehículo',
      detalle: error.message
    });
  }
};

// ========================================
// CREAR VEHÍCULO (ADMIN)
// ========================================
export const crearVehiculo = async (req, res) => {
  try {
    const { marca, nombre, descripcion, precioCompra, precioAlquiler, categoriasIds } = req.body;

    // Verificar que se haya enviado una imagen
    if (!req.file) {
      return res.status(400).json({
        error: 'Debes subir una imagen del vehículo'
      });
    }

    // Subir imagen a Cloudinary
    const urlImagen = await subirImagen(req.file.buffer, 'vehiculos');

    // Crear vehículo
    const nuevoVehiculo = await Vehiculo.create({
      marca,
      nombre,
      descripcion,
      foto: urlImagen,
      precioCompra: parseFloat(precioCompra),
      precioAlquiler: parseFloat(precioAlquiler),
      disponible: true
    });

    // Asignar categorías si se especificaron
    if (categoriasIds && Array.isArray(categoriasIds) && categoriasIds.length > 0) {
      await VehiculoCategoria.asignarCategorias(nuevoVehiculo.id, categoriasIds);
    }

    // Obtener el vehículo con sus categorías
    const vehiculoConCategorias = await Vehiculo.buscarConCategorias(nuevoVehiculo.id);

    res.status(201).json({
      mensaje: 'Vehículo creado exitosamente',
      vehiculo: vehiculoConCategorias
    });
  } catch (error) {
    console.error('Error al crear vehículo:', error);
    res.status(500).json({
      error: 'Error al crear vehículo',
      detalle: error.message
    });
  }
};

// ========================================
// ACTUALIZAR VEHÍCULO (ADMIN)
// ========================================
export const actualizarVehiculo = async (req, res) => {
  try {
    const { id } = req.params;
    const { marca, nombre, descripcion, precioCompra, precioAlquiler, categoriasIds } = req.body;

    const vehiculo = await Vehiculo.findByPk(id);

    if (!vehiculo) {
      return res.status(404).json({
        error: 'Vehículo no encontrado'
      });
    }

    // Si se envió nueva imagen, actualizar
    if (req.file) {
      // Eliminar imagen anterior
      await eliminarImagen(vehiculo.foto);

      // Subir nueva imagen
      const urlImagen = await subirImagen(req.file.buffer, 'vehiculos');
      vehiculo.foto = urlImagen;
    }

    // Actualizar campos
    if (marca) vehiculo.marca = marca;
    if (nombre) vehiculo.nombre = nombre;
    if (descripcion !== undefined) vehiculo.descripcion = descripcion;
    if (precioCompra) vehiculo.precioCompra = parseFloat(precioCompra);
    if (precioAlquiler) vehiculo.precioAlquiler = parseFloat(precioAlquiler);

    await vehiculo.save();

    // Actualizar categorías si se especificaron
    if (categoriasIds && Array.isArray(categoriasIds)) {
      await VehiculoCategoria.eliminarTodasCategoriasVehiculo(vehiculo.id);
      if (categoriasIds.length > 0) {
        await VehiculoCategoria.asignarCategorias(vehiculo.id, categoriasIds);
      }
    }

    // Obtener vehículo actualizado con categorías
    const vehiculoActualizado = await Vehiculo.buscarConCategorias(vehiculo.id);

    res.json({
      mensaje: 'Vehículo actualizado exitosamente',
      vehiculo: vehiculoActualizado
    });
  } catch (error) {
    console.error('Error al actualizar vehículo:', error);
    res.status(500).json({
      error: 'Error al actualizar vehículo',
      detalle: error.message
    });
  }
};

// ========================================
// CAMBIAR DISPONIBILIDAD (ADMIN)
// ========================================
export const cambiarDisponibilidad = async (req, res) => {
  try {
    const { id } = req.params;
    const { disponible } = req.body;

    const vehiculo = await Vehiculo.findByPk(id);

    if (!vehiculo) {
      return res.status(404).json({
        error: 'Vehículo no encontrado'
      });
    }

    await vehiculo.cambiarDisponibilidad(disponible);

    res.json({
      mensaje: `Vehículo ${disponible ? 'habilitado' : 'deshabilitado'} exitosamente`,
      vehiculo: {
        id: vehiculo.id,
        marca: vehiculo.marca,
        nombre: vehiculo.nombre,
        disponible: vehiculo.disponible
      }
    });
  } catch (error) {
    console.error('Error al cambiar disponibilidad:', error);
    res.status(500).json({
      error: 'Error al cambiar disponibilidad',
      detalle: error.message
    });
  }
};

// ========================================
// ACTUALIZAR PRECIOS (ADMIN)
// ========================================
export const actualizarPrecios = async (req, res) => {
  try {
    const { id } = req.params;
    const { precioCompra, precioAlquiler } = req.body;

    const vehiculo = await Vehiculo.findByPk(id);

    if (!vehiculo) {
      return res.status(404).json({
        error: 'Vehículo no encontrado'
      });
    }

    await vehiculo.actualizarPrecios(
      precioCompra ? parseFloat(precioCompra) : null,
      precioAlquiler ? parseFloat(precioAlquiler) : null
    );

    res.json({
      mensaje: 'Precios actualizados exitosamente',
      vehiculo: {
        id: vehiculo.id,
        marca: vehiculo.marca,
        nombre: vehiculo.nombre,
        precioCompra: vehiculo.precioCompra,
        precioAlquiler: vehiculo.precioAlquiler
      }
    });
  } catch (error) {
    console.error('Error al actualizar precios:', error);
    res.status(500).json({
      error: 'Error al actualizar precios',
      detalle: error.message
    });
  }
};

// ========================================
// ELIMINAR VEHÍCULO (ADMIN)
// ========================================
export const eliminarVehiculo = async (req, res) => {
  try {
    const { id } = req.params;

    const vehiculo = await Vehiculo.findByPk(id);

    if (!vehiculo) {
      return res.status(404).json({
        error: 'Vehículo no encontrado'
      });
    }

    // Eliminar imagen de Cloudinary
    await eliminarImagen(vehiculo.foto);

    // Eliminar vehículo (las categorías se eliminan automáticamente por CASCADE)
    await vehiculo.destroy();

    res.json({
      mensaje: 'Vehículo eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar vehículo:', error);

    // Si hay compras o alquileres, Sequelize bloqueará la eliminación (RESTRICT)
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        error: 'No se puede eliminar este vehículo porque tiene compras o alquileres asociados'
      });
    }

    res.status(500).json({
      error: 'Error al eliminar vehículo',
      detalle: error.message
    });
  }
};

// ========================================
// GESTIÓN DE CATEGORÍAS DEL VEHÍCULO
// ========================================

// Asignar categoría a un vehículo
export const asignarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoriaId } = req.body;

    const vehiculo = await Vehiculo.findByPk(id);
    if (!vehiculo) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    const categoria = await Categoria.findByPk(categoriaId);
    if (!categoria) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    await VehiculoCategoria.asignarCategoria(id, categoriaId);

    res.json({
      mensaje: 'Categoría asignada exitosamente'
    });
  } catch (error) {
    console.error('Error al asignar categoría:', error);
    res.status(500).json({
      error: 'Error al asignar categoría',
      detalle: error.message
    });
  }
};

// Eliminar categoría de un vehículo
export const eliminarCategoria = async (req, res) => {
  try {
    const { id, categoriaId } = req.params;

    await VehiculoCategoria.eliminarCategoria(id, categoriaId);

    res.json({
      mensaje: 'Categoría eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({
      error: 'Error al eliminar categoría',
      detalle: error.message
    });
  }
};