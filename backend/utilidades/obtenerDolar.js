import axios from 'axios';

// ========================================
// OBTENER COTIZACIÓN DEL DÓLAR BLUE
// ========================================
// API pública: https://dolarapi.com/docs/

let cotizacionCache = null;
let ultimaActualizacion = null;
const CACHE_DURACION = 10 * 60 * 1000; // 10 minutos en milisegundos

export const obtenerDolarBlue = async () => {
  try {
    // Verificar si tenemos cache válido
    const ahora = Date.now();
    if (cotizacionCache && ultimaActualizacion && (ahora - ultimaActualizacion < CACHE_DURACION)) {
      console.log('Usando cotización en cache:', cotizacionCache);
      return cotizacionCache;
    }

    // Hacer request a la API
    const response = await axios.get('https://dolarapi.com/v1/dolares/blue', {
      timeout: 5000 // 5 segundos de timeout
    });

    // La API devuelve: { "compra": 1000, "venta": 1020, "casa": "blue", ... }
    const cotizacion = response.data.venta; // Usamos el precio de venta

    if (!cotizacion || isNaN(cotizacion)) {
      throw new Error('Cotización inválida recibida de la API');
    }

    // Guardar en cache
    cotizacionCache = parseFloat(cotizacion);
    ultimaActualizacion = ahora;

    console.log('Nueva cotización obtenida:', cotizacionCache);
    return cotizacionCache;

  } catch (error) {
    console.error('Error al obtener cotización del dólar:', error.message);

    // Si hay cache anterior (aunque esté vencido), usarlo como fallback
    if (cotizacionCache) {
      console.log('Usando cotización antigua del cache:', cotizacionCache);
      return cotizacionCache;
    }

    // Si no hay cache, usar valor de fallback
    const fallback = 1200; // Valor aproximado de fallback
    console.warn(`Usando cotización de fallback: ${fallback}`);
    return fallback;
  }
};

// ========================================
// OBTENER INFORMACIÓN COMPLETA DEL DÓLAR
// ========================================
export const obtenerInfoDolar = async () => {
  try {
    const response = await axios.get('https://dolarapi.com/v1/dolares/blue', {
      timeout: 5000
    });

    return {
      compra: parseFloat(response.data.compra),
      venta: parseFloat(response.data.venta),
      fecha: response.data.fechaActualizacion,
      fuente: 'dolarapi.com'
    };

  } catch (error) {
    console.error('Error al obtener información del dólar:', error.message);
    
    return {
      compra: 1180,
      venta: 1200,
      fecha: new Date().toISOString(),
      fuente: 'fallback'
    };
  }
};

// ========================================
// CONVERTIR ARS A USD
// ========================================
export const convertirARSaUSD = async (montoARS) => {
  try {
    const cotizacion = await obtenerDolarBlue();
    const montoUSD = montoARS / cotizacion;
    
    return {
      montoARS,
      montoUSD: parseFloat(montoUSD.toFixed(2)),
      cotizacion
    };
  } catch (error) {
    console.error('Error al convertir ARS a USD:', error.message);
    throw error;
  }
};

// ========================================
// CONVERTIR USD A ARS
// ========================================
export const convertirUSDaARS = async (montoUSD) => {
  try {
    const cotizacion = await obtenerDolarBlue();
    const montoARS = montoUSD * cotizacion;
    
    return {
      montoUSD,
      montoARS: parseFloat(montoARS.toFixed(2)),
      cotizacion
    };
  } catch (error) {
    console.error('Error al convertir USD a ARS:', error.message);
    throw error;
  }
};

// ========================================
// LIMPIAR CACHE MANUALMENTE (útil para testing)
// ========================================
export const limpiarCache = () => {
  cotizacionCache = null;
  ultimaActualizacion = null;
  console.log('Cache de cotización limpiado');
};

export default {
  obtenerDolarBlue,
  obtenerInfoDolar,
  convertirARSaUSD,
  convertirUSDaARS,
  limpiarCache
};