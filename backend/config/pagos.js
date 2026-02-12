import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';

// ========================================
// CONFIGURACIÓN DE MERCADOPAGO
// ========================================

// Verificar que exista el Access Token
if (!process.env.MP_ACCESS_TOKEN) {
  console.warn('⚠️ ADVERTENCIA: MP_ACCESS_TOKEN no está configurado en .env');
}

// Crear cliente de MercadoPago (nueva API)
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-token-temporal',
  options: {
    timeout: 5000,
    idempotencyKey: 'erally-' + Date.now()
  }
});

// Instancias para trabajar con pagos y preferencias
const payment = new Payment(client);
const preference = new Preference(client);

// ========================================
// FUNCIÓN: CREAR PREFERENCIA DE PAGO
// ========================================
export const crearPreferenciaPago = async (datosCompra) => {
  try {
    const { titulo, precio, cantidad = 1, usuarioId, metadata = {} } = datosCompra;

    // Validaciones
    if (!titulo || !precio) {
      throw new Error('Título y precio son obligatorios');
    }

    // Crear preferencia
    const preferenciaData = {
      items: [
        {
          title: titulo,
          unit_price: Number(precio),
          quantity: Number(cantidad),
          currency_id: 'ARS'
        }
      ],
      payer: {
        email: metadata.email || 'comprador@erally.com'
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL}/pago/exitoso`,
        failure: `${process.env.FRONTEND_URL}/pago/fallido`,
        pending: `${process.env.FRONTEND_URL}/pago/pendiente`
      },
      auto_return: 'approved',
      notification_url: `${process.env.BACKEND_URL}/api/pagos/webhook/mercadopago`,
      external_reference: `${usuarioId}-${Date.now()}`,
      metadata: {
        usuario_id: usuarioId,
        ...metadata
      }
    };

    const respuesta = await preference.create({ body: preferenciaData });

    return {
      id: respuesta.id,
      init_point: respuesta.init_point, // URL para redirigir al usuario
      sandbox_init_point: respuesta.sandbox_init_point // URL de prueba
    };
  } catch (error) {
    console.error('❌ Error al crear preferencia de MercadoPago:', error);
    throw new Error(`Error en MercadoPago: ${error.message}`);
  }
};

// ========================================
// FUNCIÓN: VERIFICAR ESTADO DE PAGO
// ========================================
export const verificarPago = async (paymentId) => {
  try {
    const pago = await payment.get({ id: paymentId });

    return {
      id: pago.id,
      status: pago.status,
      status_detail: pago.status_detail,
      transaction_amount: pago.transaction_amount,
      external_reference: pago.external_reference,
      metadata: pago.metadata
    };
  } catch (error) {
    console.error('❌ Error al verificar pago:', error);
    throw new Error(`Error al verificar pago: ${error.message}`);
  }
};

// ========================================
// FUNCIÓN: PROCESAR WEBHOOK (NOTIFICACIONES)
// ========================================
export const procesarWebhook = async (req, res) => {
  try {
    const { type, data } = req.body;

    // Solo procesar notificaciones de pago
    if (type !== 'payment') {
      return res.sendStatus(200);
    }

    const paymentId = data.id;
    const infoPago = await verificarPago(paymentId);

    // Acá podés agregar lógica personalizada según el estado
    switch (infoPago.status) {
      case 'approved':
        console.log('✅ Pago aprobado:', paymentId);
        // TODO: Actualizar compra/alquiler en la BD
        break;

      case 'pending':
        console.log('⏳ Pago pendiente:', paymentId);
        break;

      case 'rejected':
        console.log('❌ Pago rechazado:', paymentId);
        break;

      default:
        console.log('ℹ️ Estado de pago:', infoPago.status);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('❌ Error en webhook:', error);
    res.sendStatus(500);
  }
};

// ========================================
// CONFIGURACIÓN DE PAYPAL
// ========================================

// Verificar que existan las credenciales
if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
  console.warn('⚠️ ADVERTENCIA: Credenciales de PayPal no configuradas en .env');
}

export const paypalConfig = {
  mode: process.env.PAYPAL_MODE || 'sandbox', // 'sandbox' o 'live'
  client_id: process.env.PAYPAL_CLIENT_ID || '',
  client_secret: process.env.PAYPAL_CLIENT_SECRET || ''
};

// ========================================
// FUNCIÓN: CREAR ORDEN DE PAYPAL
// ========================================
export const crearOrdenPayPal = async (datosCompra) => {
  try {
    const { titulo, precioUSD, usuarioId, metadata = {} } = datosCompra;

    // PayPal requiere integración con su SDK
    // Por ahora devolvemos estructura básica
    console.log('💡 Orden PayPal creada (simulada):', {
      titulo,
      precioUSD,
      usuarioId
    });

    return {
      orderID: `PAYPAL-${Date.now()}`,
      approveURL: `https://www.sandbox.paypal.com/checkoutnow?token=DEMO`
    };
  } catch (error) {
    console.error('❌ Error al crear orden PayPal:', error);
    throw new Error(`Error en PayPal: ${error.message}`);
  }
};

// ========================================
// FUNCIÓN: CAPTURAR PAGO DE PAYPAL
// ========================================
export const capturarPagoPayPal = async (orderId) => {
  try {
    // PayPal requiere integración con su SDK
    // Por ahora devolvemos estructura básica
    console.log('💡 Capturando pago PayPal (simulado):', orderId);

    return {
      id: orderId,
      status: 'COMPLETED',
      payer: {
        email_address: 'comprador@ejemplo.com'
      },
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: '0.00'
          }
        }
      ]
    };
  } catch (error) {
    console.error('❌ Error al capturar pago PayPal:', error);
    throw new Error(`Error al capturar pago PayPal: ${error.message}`);
  }
};

export default {
  crearPreferenciaPago,
  verificarPago,
  procesarWebhook,
  paypalConfig,
  crearOrdenPayPal,
  capturarPagoPayPal 
};