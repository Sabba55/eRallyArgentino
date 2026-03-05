import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import crypto from 'crypto';

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

// ========================================
// VALIDAR FIRMA DEL WEBHOOK DE MERCADOPAGO
// ========================================
export const validarFirmaWebhook = (req) => {
  try {
    const signatureHeader = req.headers['x-signature'];
    const requestId = req.headers['x-request-id'];

    if (!signatureHeader || !requestId) return false;

    // Extraer ts y hash del header
    // Formato: "ts=123456789,v1=hashaquí"
    const parts = signatureHeader.split(',');
    const ts = parts.find(p => p.startsWith('ts='))?.split('=')[1];
    const hash = parts.find(p => p.startsWith('v1='))?.split('=')[1];

    if (!ts || !hash) return false;

    // Construir el mensaje a firmar
    const dataId = req.body?.data?.id;
    const mensaje = `id:${dataId};request-id:${requestId};ts:${ts};`;

    // Calcular HMAC
    const calculado = crypto
      .createHmac('sha256', process.env.MP_WEBHOOK_SECRET)
      .update(mensaje)
      .digest('hex');

    return calculado === hash;
  } catch (error) {
    console.error('Error al validar firma webhook MP:', error);
    return false;
  }
};

// ========================================
// VALIDAR WEBHOOK DE PAYPAL
// ========================================
export const validarWebhookPayPal = async (req) => {
  try {
    // PayPal requiere reenviarle los headers y el body
    // para que confirme que la notificación es suya
    const verificacion = {
      auth_algo: req.headers['paypal-auth-algo'],
      cert_url: req.headers['paypal-cert-url'],
      transmission_id: req.headers['paypal-transmission-id'],
      transmission_sig: req.headers['paypal-transmission-sig'],
      transmission_time: req.headers['paypal-transmission-time'],
      webhook_id: process.env.PAYPAL_WEBHOOK_ID,
      webhook_event: req.body
    };

    // Obtener token de acceso de PayPal
    const authResponse = await axios.post(
      `https://api${process.env.PAYPAL_MODE === 'live' ? '' : '.sandbox'}.paypal.com/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        auth: {
          username: process.env.PAYPAL_CLIENT_ID,
          password: process.env.PAYPAL_CLIENT_SECRET
        },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    const accessToken = authResponse.data.access_token;

    // Verificar la firma con la API de PayPal
    const response = await axios.post(
      `https://api${process.env.PAYPAL_MODE === 'live' ? '' : '.sandbox'}.paypal.com/v1/notifications/verify-webhook-signature`,
      verificacion,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.verification_status === 'SUCCESS';
  } catch (error) {
    console.error('Error al validar firma webhook PayPal:', error);
    return false;
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