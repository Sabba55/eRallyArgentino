import mercadopago from 'mercadopago';
import paypal from '@paypal/checkout-server-sdk';
import dotenv from 'dotenv';

dotenv.config();

// ========================================
// MERCADO PAGO (ARS)
// ========================================
mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN
});

export const crearPreferenciaMercadoPago = async (datos) => {
  try {
    const preference = {
      items: [
        {
          title: datos.titulo,
          unit_price: parseFloat(datos.precio),
          quantity: 1,
          currency_id: 'ARS'
        }
      ],
      back_urls: {
        success: `${process.env.FRONTEND_URL}/pago/exito`,
        failure: `${process.env.FRONTEND_URL}/pago/error`,
        pending: `${process.env.FRONTEND_URL}/pago/pendiente`
      },
      auto_return: 'approved',
      external_reference: datos.referencia, // ID de la compra/alquiler
      statement_descriptor: 'eRally Argentino',
      notification_url: `${process.env.BACKEND_URL}/api/pagos/webhook/mercadopago`
    };

    const response = await mercadopago.preferences.create(preference);
    return response.body;
  } catch (error) {
    console.error('Error al crear preferencia de Mercado Pago:', error);
    throw error;
  }
};

// ========================================
// PAYPAL (USD)
// ========================================

// Determinar entorno (sandbox o producción)
const Environment =
  process.env.PAYPAL_MODE === 'live'
    ? paypal.core.LiveEnvironment
    : paypal.core.SandboxEnvironment;

// Configurar cliente de PayPal
const paypalClient = new paypal.core.PayPalHttpClient(
  new Environment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  )
);

export const crearOrdenPayPal = async (datos) => {
  try {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: datos.referencia,
          description: datos.descripcion,
          amount: {
            currency_code: 'USD',
            value: datos.precio.toFixed(2)
          }
        }
      ],
      application_context: {
        brand_name: 'eRally Argentino',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: `${process.env.FRONTEND_URL}/pago/exito`,
        cancel_url: `${process.env.FRONTEND_URL}/pago/cancelado`
      }
    });

    const order = await paypalClient.execute(request);
    return order.result;
  } catch (error) {
    console.error('Error al crear orden de PayPal:', error);
    throw error;
  }
};

export const capturarPagoPayPal = async (orderId) => {
  try {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const capture = await paypalClient.execute(request);
    return capture.result;
  } catch (error) {
    console.error('Error al capturar pago de PayPal:', error);
    throw error;
  }
};

export { mercadopago, paypalClient };