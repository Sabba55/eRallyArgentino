// ========================================
// GENERAR LINK DE WHATSAPP
// ========================================

/**
 * Genera un link de WhatsApp con un mensaje pre-cargado
 * @param {string} numero - Número de teléfono en formato internacional (ej: 5493512345678)
 * @param {string} mensaje - Mensaje pre-cargado (opcional)
 * @returns {string} - URL de WhatsApp
 */
export const generarLinkWhatsApp = (numero, mensaje = '') => {
  // Limpiar el número (quitar espacios, guiones, paréntesis)
  const numeroLimpio = numero.replace(/[\s\-\(\)]/g, '');

  // Validar formato básico
  if (!numeroLimpio.match(/^\d{10,15}$/)) {
    throw new Error('Número de teléfono inválido');
  }

  // Codificar el mensaje para URL
  const mensajeCodificado = encodeURIComponent(mensaje);

  // Generar link
  if (mensaje) {
    return `https://wa.me/${numeroLimpio}?text=${mensajeCodificado}`;
  } else {
    return `https://wa.me/${numeroLimpio}`;
  }
};

// ========================================
// MENSAJES PRE-DEFINIDOS PARA RALLIES
// ========================================

/**
 * Genera link de WhatsApp con consulta sobre un rally
 */
export const consultaRally = (numero, nombreRally, nombreUsuario) => {
  const mensaje = `Hola! Soy ${nombreUsuario}. Quiero consultar sobre el rally "${nombreRally}". ¿Podrían darme más información?`;
  return generarLinkWhatsApp(numero, mensaje);
};

/**
 * Genera link de WhatsApp con consulta sobre alquiler
 */
export const consultaAlquiler = (numero, nombreVehiculo, nombreRally) => {
  const mensaje = `Hola! Quiero alquilar el vehículo "${nombreVehiculo}" para el rally "${nombreRally}". ¿Está disponible?`;
  return generarLinkWhatsApp(numero, mensaje);
};

/**
 * Genera link de WhatsApp con consulta sobre compra
 */
export const consultaCompra = (numero, nombreVehiculo) => {
  const mensaje = `Hola! Me interesa comprar el vehículo "${nombreVehiculo}". ¿Podrían darme más información?`;
  return generarLinkWhatsApp(numero, mensaje);
};

/**
 * Genera link de WhatsApp con soporte técnico
 */
export const soporteTecnico = (numero, nombreUsuario, problema) => {
  const mensaje = `Hola! Soy ${nombreUsuario}. Necesito ayuda con: ${problema}`;
  return generarLinkWhatsApp(numero, mensaje);
};

/**
 * Genera link de WhatsApp con consulta general
 */
export const consultaGeneral = (numero, nombreUsuario) => {
  const mensaje = `Hola! Soy ${nombreUsuario}. Tengo una consulta sobre eRally Argentino.`;
  return generarLinkWhatsApp(numero, mensaje);
};

// ========================================
// VALIDAR NÚMERO ARGENTINO
// ========================================

/**
 * Valida que el número sea formato argentino correcto
 * @param {string} numero - Número a validar
 * @returns {boolean} - true si es válido
 */
export const esNumeroArgentinoValido = (numero) => {
  // Formato esperado: 549 + código de área + número
  // Ejemplo: 5493512345678 (Córdoba)
  const regex = /^549\d{10}$/;
  return regex.test(numero.replace(/[\s\-\(\)]/g, ''));
};

/**
 * Formatea un número argentino para mostrar
 * @param {string} numero - Número en formato 5493512345678
 * @returns {string} - Número formateado: +54 9 351 234-5678
 */
export const formatearNumeroArgentino = (numero) => {
  const numeroLimpio = numero.replace(/[\s\-\(\)]/g, '');

  if (!esNumeroArgentinoValido(numeroLimpio)) {
    return numero; // Devolver sin formatear si es inválido
  }

  // Extraer partes: 549 + código área + número
  const codigoPais = numeroLimpio.substring(0, 2); // 54
  const nueveWhatsApp = numeroLimpio.substring(2, 3); // 9
  const codigoArea = numeroLimpio.substring(3, 6); // 351
  const primeraParte = numeroLimpio.substring(6, 9); // 234
  const segundaParte = numeroLimpio.substring(9); // 5678

  return `+${codigoPais} ${nueveWhatsApp} ${codigoArea} ${primeraParte}-${segundaParte}`;
};

// ========================================
// LINK PARA BOTÓN DE CONTACTO RÁPIDO
// ========================================

/**
 * Genera objeto con información completa para botón de WhatsApp
 * Útil para el frontend
 */
export const generarInfoContactoWhatsApp = (rally) => {
  if (!rally.contactos || !rally.contactos.whatsapp) {
    return null;
  }

  const numero = rally.contactos.whatsapp;
  const mensaje = `Hola! Quiero información sobre el rally "${rally.nombre}"`;

  return {
    numero,
    numeroFormateado: formatearNumeroArgentino(numero),
    link: generarLinkWhatsApp(numero, mensaje),
    esValido: esNumeroArgentinoValido(numero)
  };
};

export default {
  generarLinkWhatsApp,
  consultaRally,
  consultaAlquiler,
  consultaCompra,
  soporteTecnico,
  consultaGeneral,
  esNumeroArgentinoValido,
  formatearNumeroArgentino,
  generarInfoContactoWhatsApp
};