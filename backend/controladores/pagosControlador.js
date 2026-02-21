import { Compra, Alquiler, Usuario, Vehiculo, Rally, Historial } from '../modelos/index.js';
import { 
  crearPreferenciaPago,        // ← CORREGIDO
  verificarPago,
  crearOrdenPayPal, 
  capturarPagoPayPal 
} from '../config/pagos.js';
import { obtenerDolarBlue } from '../utilidades/obtenerDolar.js';
import { enviarEmailCompra, enviarEmailAlquiler } from '../utilidades/enviarEmail.js';

// ========================================
// CREAR COMPRA (MERCADO PAGO - ARS)
// ========================================
export const crearCompraMercadoPago = async (req, res) => {
  try {
    const usuario = req.usuario;
    const { vehiculoId } = req.body;

    // Verificar que el usuario tenga email verificado
    if (!usuario.emailVerificado) {
      return res.status(403).json({
        error: 'Debes verificar tu email antes de realizar una compra'
      });
    }

    // Verificar que el vehículo exista y esté disponible
    const vehiculo = await Vehiculo.findByPk(vehiculoId);

    if (!vehiculo) {
      return res.status(404).json({
        error: 'Vehículo no encontrado'
      });
    }

    if (!vehiculo.disponible) {
      return res.status(400).json({
        error: 'Este vehículo no está disponible'
      });
    }

    // Verificar que el usuario no tenga ya este vehículo comprado
    const tieneVehiculo = await Compra.usuarioTieneVehiculo(usuario.id, vehiculoId);

    if (tieneVehiculo) {
      return res.status(400).json({
        error: 'Ya tenés este vehículo en tu garage'
      });
    }

    // Crear la compra en estado "pendiente"
    const compra = await Compra.create({
      usuarioId: usuario.id,
      vehiculoId,
      monto: vehiculo.precioCompra,
      moneda: 'ARS',
      metodoPago: 'MercadoPago',
      estado: 'pendiente'
    });

    // Crear preferencia de Mercado Pago (CORREGIDO)
    const preferencia = await crearPreferenciaPago({
      titulo: `Compra - ${vehiculo.marca} ${vehiculo.nombre}`,
      precio: vehiculo.precioCompra,
      cantidad: 1,
      usuarioId: usuario.id,
      metadata: {
        tipo: 'compra',
        compraId: compra.id,
        vehiculoId,
        email: usuario.email
      }
    });

    // Actualizar la compra con el ID de transacción
    compra.transaccionId = preferencia.id;
    await compra.save();

    res.status(201).json({
      mensaje: 'Compra creada exitosamente',
      compra: {
        id: compra.id,
        vehiculo: {
          id: vehiculo.id,
          marca: vehiculo.marca,
          nombre: vehiculo.nombre,
          foto: vehiculo.foto
        },
        monto: compra.monto,
        moneda: compra.moneda,
        estado: compra.estado
      },
      preferencia: {
        id: preferencia.id,
        init_point: preferencia.init_point // URL para redirigir al usuario
      }
    });
  } catch (error) {
    console.error('Error al crear compra:', error);
    res.status(500).json({
      error: 'Error al crear compra',
      detalle: error.message
    });
  }
};

// ========================================
// CREAR COMPRA (PAYPAL - USD)
// ========================================
export const crearCompraPayPal = async (req, res) => {
  try {
    const usuario = req.usuario;
    const { vehiculoId } = req.body;

    if (!usuario.emailVerificado) {
      return res.status(403).json({
        error: 'Debes verificar tu email antes de realizar una compra'
      });
    }

    const vehiculo = await Vehiculo.findByPk(vehiculoId);

    if (!vehiculo) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    if (!vehiculo.disponible) {
      return res.status(400).json({ error: 'Este vehículo no está disponible' });
    }

    const tieneVehiculo = await Compra.usuarioTieneVehiculo(usuario.id, vehiculoId);

    if (tieneVehiculo) {
      return res.status(400).json({ error: 'Ya tenés este vehículo en tu garage' });
    }

    // Convertir ARS a USD usando cotización del dólar blue
    const dolarBlue = await obtenerDolarBlue();
    const montoUSD = (vehiculo.precioCompra / dolarBlue).toFixed(2);

    // Crear compra en estado pendiente
    const compra = await Compra.create({
      usuarioId: usuario.id,
      vehiculoId,
      monto: parseFloat(montoUSD),
      moneda: 'USD',
      metodoPago: 'PayPal',
      estado: 'pendiente'
    });

    // Crear orden de PayPal (CORREGIDO)
    const orden = await crearOrdenPayPal({
      titulo: `Compra - ${vehiculo.marca} ${vehiculo.nombre}`,
      precioUSD: montoUSD,
      usuarioId: usuario.id,
      metadata: {
        tipo: 'compra',
        compraId: compra.id,
        vehiculoId
      }
    });

    compra.transaccionId = orden.orderID;
    await compra.save();

    res.status(201).json({
      mensaje: 'Compra creada exitosamente',
      compra: {
        id: compra.id,
        vehiculo: {
          id: vehiculo.id,
          marca: vehiculo.marca,
          nombre: vehiculo.nombre,
          foto: vehiculo.foto
        },
        monto: compra.monto,
        moneda: compra.moneda,
        estado: compra.estado,
        cotizacionDolar: dolarBlue
      },
      orden: {
        id: orden.orderID,
        approveLink: orden.approveURL
      }
    });
  } catch (error) {
    console.error('Error al crear compra PayPal:', error);
    res.status(500).json({
      error: 'Error al crear compra',
      detalle: error.message
    });
  }
};

// ========================================
// CREAR ALQUILER (MERCADO PAGO - ARS)
// ========================================
export const crearAlquilerMercadoPago = async (req, res) => {
  try {
    const usuario = req.usuario;
    const { vehiculoId, rallyId } = req.body;

    if (!usuario.emailVerificado) {
      return res.status(403).json({
        error: 'Debes verificar tu email antes de realizar un alquiler'
      });
    }

    const vehiculo = await Vehiculo.findByPk(vehiculoId);
    const rally = await Rally.findByPk(rallyId);

    if (!vehiculo) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    if (!rally) {
      return res.status(404).json({ error: 'Rally no encontrado' });
    }

    if (!vehiculo.disponible) {
      return res.status(400).json({ error: 'Este vehículo no está disponible' });
    }

    // Verificar que el usuario no tenga ya un alquiler para este rally
    const tieneAlquiler = await Alquiler.usuarioTieneAlquilerEnRally(usuario.id, rallyId);

    if (tieneAlquiler) {
      return res.status(400).json({
        error: 'Ya tenés un vehículo alquilado para este rally'
      });
    }

    // Crear alquiler
    const alquiler = await Alquiler.create({
      usuarioId: usuario.id,
      vehiculoId,
      rallyId,
      fechaFinalizacion: rally.fecha,
      monto: vehiculo.precioAlquiler,
      moneda: 'ARS',
      metodoPago: 'MercadoPago',
      estado: 'pendiente'
    });

    // Crear preferencia de Mercado Pago (CORREGIDO)
    const preferencia = await crearPreferenciaPago({
      titulo: `Alquiler - ${vehiculo.marca} ${vehiculo.nombre} - ${rally.nombre}`,
      precio: vehiculo.precioAlquiler,
      cantidad: 1,
      usuarioId: usuario.id,
      metadata: {
        tipo: 'alquiler',
        alquilerId: alquiler.id,
        vehiculoId,
        rallyId,
        email: usuario.email
      }
    });

    alquiler.transaccionId = preferencia.id;
    await alquiler.save();

    res.status(201).json({
      mensaje: 'Alquiler creado exitosamente',
      alquiler: {
        id: alquiler.id,
        vehiculo: {
          id: vehiculo.id,
          marca: vehiculo.marca,
          nombre: vehiculo.nombre,
          foto: vehiculo.foto
        },
        rally: {
          id: rally.id,
          nombre: rally.nombre,
          fecha: rally.fecha
        },
        monto: alquiler.monto,
        moneda: alquiler.moneda,
        estado: alquiler.estado
      },
      preferencia: {
        id: preferencia.id,
        init_point: preferencia.init_point
      }
    });
  } catch (error) {
    console.error('Error al crear alquiler:', error);
    res.status(500).json({
      error: 'Error al crear alquiler',
      detalle: error.message
    });
  }
};

// ========================================
// CREAR ALQUILER (PAYPAL - USD)
// ========================================
export const crearAlquilerPayPal = async (req, res) => {
  try {
    const usuario = req.usuario;
    const { vehiculoId, rallyId } = req.body;

    if (!usuario.emailVerificado) {
      return res.status(403).json({
        error: 'Debes verificar tu email antes de realizar un alquiler'
      });
    }

    const vehiculo = await Vehiculo.findByPk(vehiculoId);
    const rally = await Rally.findByPk(rallyId);

    if (!vehiculo || !rally) {
      return res.status(404).json({ error: 'Vehículo o rally no encontrado' });
    }

    if (!vehiculo.disponible) {
      return res.status(400).json({ error: 'Este vehículo no está disponible' });
    }

    const tieneAlquiler = await Alquiler.usuarioTieneAlquilerEnRally(usuario.id, rallyId);

    if (tieneAlquiler) {
      return res.status(400).json({
        error: 'Ya tenés un vehículo alquilado para este rally'
      });
    }

    // Convertir a USD
    const dolarBlue = await obtenerDolarBlue();
    const montoUSD = (vehiculo.precioAlquiler / dolarBlue).toFixed(2);

    const alquiler = await Alquiler.create({
      usuarioId: usuario.id,
      vehiculoId,
      rallyId,
      fechaFinalizacion: rally.fecha,
      monto: parseFloat(montoUSD),
      moneda: 'USD',
      metodoPago: 'PayPal',
      estado: 'pendiente'
    });

    // Crear orden de PayPal (CORREGIDO)
    const orden = await crearOrdenPayPal({
      titulo: `Alquiler - ${vehiculo.marca} ${vehiculo.nombre} - ${rally.nombre}`,
      precioUSD: montoUSD,
      usuarioId: usuario.id,
      metadata: {
        tipo: 'alquiler',
        alquilerId: alquiler.id,
        vehiculoId,
        rallyId
      }
    });

    alquiler.transaccionId = orden.orderID;
    await alquiler.save();

    res.status(201).json({
      mensaje: 'Alquiler creado exitosamente',
      alquiler: {
        id: alquiler.id,
        vehiculo: {
          id: vehiculo.id,
          marca: vehiculo.marca,
          nombre: vehiculo.nombre,
          foto: vehiculo.foto
        },
        rally: {
          id: rally.id,
          nombre: rally.nombre,
          fecha: rally.fecha
        },
        monto: alquiler.monto,
        moneda: alquiler.moneda,
        estado: alquiler.estado,
        cotizacionDolar: dolarBlue
      },
      orden: {
        id: orden.orderID,
        approveLink: orden.approveURL
      }
    });
  } catch (error) {
    console.error('Error al crear alquiler PayPal:', error);
    res.status(500).json({
      error: 'Error al crear alquiler',
      detalle: error.message
    });
  }
};

// ========================================
// WEBHOOK MERCADO PAGO
// ========================================
export const webhookMercadoPago = async (req, res) => {
  try {
    const { type, data } = req.body;

    // Solo procesar pagos aprobados
    if (type === 'payment') {
      const paymentId = data.id;

      // Verificar el pago
      const infoPago = await verificarPago(paymentId);

      if (infoPago.status === 'approved') {
        // Buscar la transacción (puede ser compra o alquiler)
        const compra = await Compra.findOne({
          where: { transaccionId: paymentId, estado: 'pendiente' }
        });

        const alquiler = await Alquiler.findOne({
          where: { transaccionId: paymentId, estado: 'pendiente' }
        });

        if (compra) {
          await compra.aprobar();

          // Crear registro en historial
          const vehiculo = await Vehiculo.findByPk(compra.vehiculoId);
          const categorias = await vehiculo.getCategorias();

          await Historial.crearRegistro({
            usuarioId: compra.usuarioId,
            vehiculoId: compra.vehiculoId,
            rallyId: null,
            categoriaNombre: categorias[0]?.nombre || 'Sin categoría',
            tipoTransaccion: 'compra'
          });

          // Enviar email de confirmación
          const usuario = await Usuario.findByPk(compra.usuarioId);
          await enviarEmailCompra(usuario.email, usuario.nombre, vehiculo.nombreCompleto());
        }

        if (alquiler) {
          await alquiler.aprobar();

          // Crear registro en historial
          const vehiculo = await Vehiculo.findByPk(alquiler.vehiculoId);
          const rally = await Rally.findByPk(alquiler.rallyId);
          const categorias = await vehiculo.getCategorias();

          await Historial.crearRegistro({
            usuarioId: alquiler.usuarioId,
            vehiculoId: alquiler.vehiculoId,
            rallyId: alquiler.rallyId,
            categoriaNombre: categorias[0]?.nombre || 'Sin categoría',
            tipoTransaccion: 'alquiler',
            fechaParticipacion: rally.fecha
          });

          // Enviar email de confirmación
          const usuario = await Usuario.findByPk(alquiler.usuarioId);
          await enviarEmailAlquiler(
            usuario.email,
            usuario.nombre,
            vehiculo.nombreCompleto(),
            rally.nombre,
            rally.fecha
          );
        }
      }
    }

    res.status(200).json({ mensaje: 'Webhook procesado' });
  } catch (error) {
    console.error('Error en webhook Mercado Pago:', error);
    res.status(500).json({
      error: 'Error al procesar webhook',
      detalle: error.message
    });
  }
};

// ========================================
// WEBHOOK PAYPAL
// ========================================
export const webhookPayPal = async (req, res) => {
  try {
    const { event_type, resource } = req.body;

    // Solo procesar capturas completadas
    if (event_type === 'CHECKOUT.ORDER.APPROVED') {
      const orderId = resource.id;

      // Capturar el pago
      const captura = await capturarPagoPayPal(orderId);

      if (captura.status === 'COMPLETED') {
        // Buscar la transacción
        const compra = await Compra.findOne({
          where: { transaccionId: orderId, estado: 'pendiente' }
        });

        const alquiler = await Alquiler.findOne({
          where: { transaccionId: orderId, estado: 'pendiente' }
        });

        if (compra) {
          await compra.aprobar();

          const vehiculo = await Vehiculo.findByPk(compra.vehiculoId);
          const categorias = await vehiculo.getCategorias();

          await Historial.crearRegistro({
            usuarioId: compra.usuarioId,
            vehiculoId: compra.vehiculoId,
            rallyId: null,
            categoriaNombre: categorias[0]?.nombre || 'Sin categoría',
            tipoTransaccion: 'compra'
          });

          const usuario = await Usuario.findByPk(compra.usuarioId);
          await enviarEmailCompra(usuario.email, usuario.nombre, vehiculo.nombreCompleto());
        }

        if (alquiler) {
          await alquiler.aprobar();

          const vehiculo = await Vehiculo.findByPk(alquiler.vehiculoId);
          const rally = await Rally.findByPk(alquiler.rallyId);
          const categorias = await vehiculo.getCategorias();

          await Historial.crearRegistro({
            usuarioId: alquiler.usuarioId,
            vehiculoId: alquiler.vehiculoId,
            rallyId: alquiler.rallyId,
            categoriaNombre: categorias[0]?.nombre || 'Sin categoría',
            tipoTransaccion: 'alquiler',
            fechaParticipacion: rally.fecha
          });

          const usuario = await Usuario.findByPk(alquiler.usuarioId);
          await enviarEmailAlquiler(
            usuario.email,
            usuario.nombre,
            vehiculo.nombreCompleto(),
            rally.nombre,
            rally.fecha
          );
        }
      }
    }

    res.status(200).json({ mensaje: 'Webhook procesado' });
  } catch (error) {
    console.error('Error en webhook PayPal:', error);
    res.status(500).json({
      error: 'Error al procesar webhook',
      detalle: error.message
    });
  }
};

// ========================================
// LISTAR MIS COMPRAS
// ========================================
export const listarMisCompras = async (req, res) => {
  try {
    const usuario = req.usuario;
    const { estado } = req.query;

    const whereClause = { usuarioId: usuario.id };
    if (estado) whereClause.estado = estado;

    const compras = await Compra.findAll({
      where: whereClause,
      include: [{
        model: Vehiculo,
        as: 'Vehiculo'
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      compras,
      total: compras.length
    });
  } catch (error) {
    console.error('Error al listar compras:', error);
    res.status(500).json({
      error: 'Error al listar compras',
      detalle: error.message
    });
  }
};

// ========================================
// LISTAR MIS ALQUILERES
// ========================================
export const listarMisAlquileres = async (req, res) => {
  try {
    const usuario = req.usuario;
    const { estado } = req.query;

    const whereClause = { usuarioId: usuario.id };
    if (estado) whereClause.estado = estado;

    const alquileres = await Alquiler.findAll({
      where: whereClause,
      include: [
        { model: Vehiculo, as: 'Vehiculo' },
        { model: Rally, as: 'Rally' }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      alquileres,
      total: alquileres.length
    });
  } catch (error) {
    console.error('Error al listar alquileres:', error);
    res.status(500).json({
      error: 'Error al listar alquileres',
      detalle: error.message
    });
  }
};

// ========================================
// OBTENER PRECIOS DE UN VEHÍCULO (ARS + USD)
// GET /api/pagos/precios/:vehiculoId
// ========================================
export const obtenerPreciosVehiculo = async (req, res) => {
  try {
    const { vehiculoId } = req.params;

    const vehiculo = await Vehiculo.findByPk(vehiculoId);
    if (!vehiculo) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    // ✅ Intentar obtener cotización real
    let cotizacion = null;
    let cotizacionDisponible = false;

    try {
      cotizacion = await obtenerDolarBlue();
      // Rechazar el fallback hardcodeado — si viene 1200 sin haber conectado,
      // no es confiable para mostrarle un precio al usuario
      cotizacionDisponible = cotizacion !== null && cotizacion > 0;
    } catch {
      cotizacionDisponible = false;
    }

    const calcularUSD = (precioARS) => {
      if (!cotizacionDisponible) return null; // ← null = no mostrar
      const base = precioARS / cotizacion;
      return parseFloat((base * 1.054 + 0.30).toFixed(2));
    };

    res.json({
      vehiculoId: vehiculo.id,
      cotizacionDolar: cotizacionDisponible ? cotizacion : null,
      cotizacionDisponible,  // ← el frontend lo usa para habilitar/deshabilitar PayPal
      compra: {
        ars: parseFloat(vehiculo.precioCompra),
        usd: calcularUSD(vehiculo.precioCompra)
      },
      alquiler: {
        ars: parseFloat(vehiculo.precioAlquiler),
        usd: calcularUSD(vehiculo.precioAlquiler)
      }
    });

  } catch (error) {
    console.error('Error al obtener precios:', error);
    res.status(500).json({
      error: 'Error al obtener precios',
      detalle: error.message
    });
  }
};