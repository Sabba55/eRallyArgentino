import nodemailer from 'nodemailer';

// Configurar transporter de Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ========================================
// EMAIL DE VERIFICACIÓN DE CUENTA (✅)
// ========================================
export const enviarEmailVerificacion = async (email, nombre, token) => {
  try {
    const urlVerificacion = `${process.env.FRONTEND_URL}/verificar-email/${token}`;

    const mailOptions = {
      from: `"eRally Argentino" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verificá tu cuenta - eRally Argentino',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1a1a; padding: 30px; border-radius: 12px;">

          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #00d4ff; padding-bottom: 20px;">
            <h1 style="font-family: Arial, sans-serif; font-weight: 900; color: #00d4ff; font-size: 1.8rem; letter-spacing: 3px; margin: 0;">
              eRally Argentino
            </h1>
          </div>

          <!-- Título -->
          <h2 style="color: #00d4ff; font-size: 1.5rem; letter-spacing: 2px; margin-bottom: 20px;">
            👋 ¡Hola ${nombre}!
          </h2>

          <p style="font-size: 15px; color: #cccccc; margin-bottom: 20px;">
            ¡Bienvenido a <strong style="color: #ffffff;">eRally Argentino</strong>!
          </p>

          <p style="font-size: 15px; color: #cccccc; margin-bottom: 25px;">
            Para activar tu cuenta, hacé click en el siguiente botón:
          </p>

          <!-- Botón -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${urlVerificacion}"
               style="background: linear-gradient(135deg, #00d4ff, #39ff14); color: #1a1a1a; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-size: 15px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">
              Verificar mi cuenta
            </a>
          </div>

          <!-- Link de respaldo -->
          <div style="background-color: #2a2a2a; border-left: 4px solid #00d4ff; border-radius: 8px; padding: 16px; margin-bottom: 25px;">
            <p style="font-size: 13px; color: #a0a0a0; margin: 0 0 8px 0;">
              Si el botón no funciona, copiá y pegá este link en tu navegador:
            </p>
            <p style="font-size: 13px; color: #00d4ff; word-break: break-all; margin: 0;">
              ${urlVerificacion}
            </p>
          </div>

          <p style="font-size: 13px; color: #666666; margin-bottom: 0;">
            Este link expira en <strong style="color: #a0a0a0;">24 horas</strong>. Si no creaste esta cuenta, podés ignorar este email.
          </p>

          <!-- Footer -->
          <hr style="border: none; border-top: 1px solid #3a3a3a; margin: 30px 0;">

          <p style="font-size: 12px; color: #666666; text-align: center; margin: 0;">
            <strong style="color: #a0a0a0;">eRally Argentino</strong>
          </p>

        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email de verificación enviado a: ${email}`);
  } catch (error) {
    console.error('Error al enviar email de verificación:', error);
    throw new Error('No se pudo enviar el email de verificación');
  }
};

// ========================================
// EMAIL DE RECUPERACIÓN DE CONTRASEÑA (✅)
// ========================================
export const enviarEmailRecuperacion = async (email, nombre, token) => {
  try {
    const urlRecuperacion = `${process.env.FRONTEND_URL}/resetear-password/${token}`;

    const mailOptions = {
      from: `"eRally Argentino" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Recuperación de contraseña - eRally Argentino',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1a1a; padding: 30px; border-radius: 12px;">

          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #00d4ff; padding-bottom: 20px;">
            <h1 style="font-family: Arial, sans-serif; font-weight: 900; color: #00d4ff; font-size: 1.8rem; letter-spacing: 3px; margin: 0;">
              eRally Argentino
            </h1>
          </div>

          <!-- Título -->
          <h2 style="color: #ff4444; font-size: 1.5rem; letter-spacing: 2px; margin-bottom: 20px;">
            Recuperación de contraseña
          </h2>

          <p style="font-size: 15px; color: #cccccc; margin-bottom: 20px;">
            Hola <strong style="color: #ffffff;">${nombre}</strong>,
          </p>

          <p style="font-size: 15px; color: #cccccc; margin-bottom: 25px;">
            Recibimos una solicitud para restablecer tu contraseña. Hacé click en el siguiente botón para crear una nueva:
          </p>

          <!-- Botón -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${urlRecuperacion}"
               style="background: linear-gradient(135deg, #00d4ff, #39ff14); color: #1a1a1a; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-size: 15px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">
              Restablecer contraseña
            </a>
          </div>

          <!-- Link de respaldo -->
          <div style="background-color: #2a2a2a; border-left: 4px solid #00d4ff; border-radius: 8px; padding: 16px; margin-bottom: 25px;">
            <p style="font-size: 13px; color: #a0a0a0; margin: 0 0 8px 0;">
              Si el botón no funciona, copiá y pegá este link en tu navegador:
            </p>
            <p style="font-size: 13px; color: #00d4ff; word-break: break-all; margin: 0;">
              ${urlRecuperacion}
            </p>
          </div>

          <p style="font-size: 13px; color: #666666; margin-bottom: 0;">
            Este link expira en <strong style="color: #a0a0a0;">1 hora</strong>. Si no solicitaste este cambio, ignorá este email y tu contraseña no será modificada.
          </p>

          <!-- Footer -->
          <hr style="border: none; border-top: 1px solid #3a3a3a; margin: 30px 0;">

          <p style="font-size: 12px; color: #666666; text-align: center; margin: 0;">
            <strong style="color: #a0a0a0;">eRally Argentino</strong>
          </p>

        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email de recuperación enviado a: ${email}`);
  } catch (error) {
    console.error('Error al enviar email de recuperación:', error);
    throw new Error('No se pudo enviar el email de recuperación');
  }
};

// ========================================
// EMAIL DE CONFIRMACIÓN DE COMPRA (✅)
// ========================================
export const enviarEmailCompra = async (email, nombre, vehiculo) => {
  try {
    const mailOptions = {
      from: `"eRally Argentino" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Compra confirmada: ${vehiculo} - eRally Argentino`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1a1a; padding: 30px; border-radius: 12px;">

          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #00d4ff; padding-bottom: 20px;">
            <h1 style="font-family: Arial, sans-serif; font-weight: 900; color: #00d4ff; font-size: 1.8rem; letter-spacing: 3px; margin: 0;">
              eRally Argentino
            </h1>
          </div>

          <!-- Título -->
          <h2 style="color: #39ff14; font-size: 1.5rem; letter-spacing: 2px; margin-bottom: 20px;">
            ¡Compra confirmada!
          </h2>

          <p style="font-size: 15px; color: #cccccc; margin-bottom: 20px;">
            Hola <strong style="color: #ffffff;">${nombre}</strong>,
          </p>

          <p style="font-size: 15px; color: #cccccc; margin-bottom: 25px;">
            Tu compra se procesó exitosamente.
          </p>

          <!-- Detalles -->
          <div style="background-color: #2a2a2a; border-left: 4px solid #39ff14; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #00d4ff; text-transform: uppercase; letter-spacing: 1px; margin-top: 0; margin-bottom: 16px;">
              Vehículo comprado
            </h3>

            <p style="font-size: 16px; color: #ffffff; font-weight: bold; margin: 0 0 12px 0;">
              ${vehiculo}
            </p>

            <p style="font-size: 14px; color: #a0a0a0; margin: 0;">
              Duracion: 1 año desde hoy
            </p>
          </div>

          <p style="font-size: 15px; color: #cccccc; margin-bottom: 25px;">
            Ya podés ver tu vehículo en tu garage y usarlo en todos las fechas permitidas que quieras.
          </p>

          <!-- Botón -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/garage"
               style="background: linear-gradient(135deg, #00d4ff, #39ff14); color: #1a1a1a; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-size: 15px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">
              Ver mi garage
            </a>
          </div>

          <!-- Footer -->
          <hr style="border: none; border-top: 1px solid #3a3a3a; margin: 30px 0;">

          <p style="font-size: 12px; color: #666666; text-align: center; margin: 0;">
            <strong style="color: #a0a0a0;">eRally Argentino</strong>
          </p>

        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email de compra enviado a: ${email}`);
  } catch (error) {
    console.error('Error al enviar email de compra:', error);
    throw new Error('No se pudo enviar el email de confirmación');
  }
};

// ========================================
// EMAIL DE CONFIRMACIÓN DE ALQUILER (✅)
// ========================================
export const enviarEmailAlquiler = async (email, nombre, vehiculo, rally, fecha) => {
  try {
    const fechaFormateada = new Date(fecha).toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const mailOptions = {
      from: `"eRally Argentino" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Alquiler confirmado: ${rally} - eRally Argentino`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1a1a; padding: 30px; border-radius: 12px;">

          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #00d4ff; padding-bottom: 20px;">
            <h1 style="font-family: Arial, sans-serif; font-weight: 900; color: #00d4ff; font-size: 1.8rem; letter-spacing: 3px; margin: 0;">
              eRally Argentino
            </h1>
          </div>

          <!-- Título -->
          <h2 style="color: #39ff14; font-size: 1.5rem; letter-spacing: 2px; margin-bottom: 20px;">
            ¡Alquiler confirmado!
          </h2>

          <p style="font-size: 15px; color: #cccccc; margin-bottom: 20px;">
            Hola <strong style="color: #ffffff;">${nombre}</strong>,
          </p>

          <p style="font-size: 15px; color: #cccccc; margin-bottom: 25px;">
            ¡Tu alquiler se procesó exitosamente!
          </p>

          <!-- Detalles -->
          <div style="background-color: #2a2a2a; border-left: 4px solid #39ff14; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #00d4ff; text-transform: uppercase; letter-spacing: 1px; margin-top: 0; margin-bottom: 16px;">
              Detalles del alquiler
            </h3>

            <p style="font-size: 14px; color: #a0a0a0; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 1px;">Vehículo</p>
            <p style="font-size: 16px; color: #ffffff; font-weight: bold; margin: 0 0 16px 0;">
              ${vehiculo}
            </p>

            <p style="font-size: 14px; color: #a0a0a0; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 1px;">Rally</p>
            <p style="font-size: 16px; color: #ffffff; font-weight: bold; margin: 0 0 16px 0;">
              ${rally}
            </p>

            <p style="font-size: 14px; color: #a0a0a0; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 1px;">Fecha</p>
            <p style="font-size: 16px; color: #ffffff; font-weight: bold; margin: 0; text-transform: capitalize;">
              ${fechaFormateada}
            </p>
          </div>

          <p style="font-size: 15px; color: #cccccc; margin-bottom: 25px;">
            El vehículo ya está disponible en tu garage y estará activo hasta la fecha del rally.
          </p>

          <!-- Botón -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/garage"
               style="background: linear-gradient(135deg, #00d4ff, #39ff14); color: #1a1a1a; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-size: 15px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">
              Ver mi garage
            </a>
          </div>

          <!-- Footer -->
          <hr style="border: none; border-top: 1px solid #3a3a3a; margin: 30px 0;">

          <p style="font-size: 12px; color: #666666; text-align: center; margin: 0;">
            <strong style="color: #a0a0a0;">eRally Argentino</strong>
          </p>

        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email de alquiler enviado a: ${email}`);
  } catch (error) {
    console.error('Error al enviar email de alquiler:', error);
    throw new Error('No se pudo enviar el email de confirmación');
  }
};

// ========================================
// EMAIL DE REPROGRAMACIÓN DE RALLY (✅)
// ========================================
export const enviarEmailReprogramacion = async (email, nombre, rally, vehiculo, fechaAnterior, fechaNueva) => {
  try {
    const fechaAnteriorFormateada = new Date(fechaAnterior).toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const fechaNuevaFormateada = new Date(fechaNueva).toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const mailOptions = {
      from: `"eRally Argentino" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `${rally} fue reprogramado - eRally Argentino`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1a1a; padding: 30px; border-radius: 12px;">

          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #00d4ff; padding-bottom: 20px;">
            <h1 style="font-family: Arial, sans-serif; font-weight: 900; color: #00d4ff; font-size: 1.8rem; letter-spacing: 3px; margin: 0;">
              eRally Argentino
            </h1>
          </div>

          <!-- Título -->
          <h2 style="color: #ffd60a; font-size: 1.5rem; letter-spacing: 2px; margin-bottom: 20px;">
            ${rally} fue reprogramado
          </h2>

          <p style="font-size: 15px; color: #cccccc; margin-bottom: 20px;">
            Hola <strong style="color: #ffffff;">${nombre}</strong>,
          </p>

          <p style="font-size: 15px; color: #cccccc; margin-bottom: 25px;">
            Te informamos que el rally <strong style="color: #ffffff;">${rally}</strong> ha sido reprogramado.
          </p>

          <!-- Fechas -->
          <div style="background-color: #2a2a2a; border-left: 4px solid #ffd60a; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #00d4ff; text-transform: uppercase; letter-spacing: 1px; margin-top: 0; margin-bottom: 16px;">
              Cambio de fecha
            </h3>

            <p style="font-size: 14px; color: #a0a0a0; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 1px;">Fecha anterior</p>
            <p style="font-size: 16px; color: #ff4444; font-weight: bold; margin: 0 0 16px 0; text-decoration: line-through; text-transform: capitalize;">
              ${fechaAnteriorFormateada}
            </p>

            <p style="font-size: 14px; color: #a0a0a0; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 1px;">Nueva fecha</p>
            <p style="font-size: 16px; color: #39ff14; font-weight: bold; margin: 0; text-transform: capitalize;">
              ${fechaNuevaFormateada}
            </p>
          </div>

          <!-- Vehículo -->
          <div style="background-color: #2a2a2a; border-left: 4px solid #00d4ff; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #00d4ff; text-transform: uppercase; letter-spacing: 1px; margin-top: 0; margin-bottom: 12px;">
              Tu vehículo alquilado
            </h3>
            <p style="font-size: 16px; color: #ffffff; font-weight: bold; margin: 0 0 10px 0;">
              ${vehiculo}
            </p>
            <p style="font-size: 14px; color: #a0a0a0; margin: 0;">
              Tu alquiler se actualizó automáticamente a la nueva fecha. No necesitás hacer nada.
            </p>
          </div>

          <!-- Botón -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/fechas"
               style="background: linear-gradient(135deg, #00d4ff, #39ff14); color: #1a1a1a; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-size: 15px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">
              Ver próximas fechas
            </a>
          </div>

          <!-- Footer -->
          <hr style="border: none; border-top: 1px solid #3a3a3a; margin: 30px 0;">

          <p style="font-size: 12px; color: #666666; text-align: center; margin: 0;">
            <strong style="color: #a0a0a0;">eRally Argentino</strong>
          </p>

        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email de reprogramación enviado a: ${email}`);
  } catch (error) {
    console.error('Error al enviar email de reprogramación:', error);
    throw new Error('No se pudo enviar el email de reprogramación');
  }
};

// ========================================
// EMAIL DE CANCELACIÓN DE RALLY (✅)
// ========================================
export const enviarEmailCancelacion = async (email, nombre, rally, vehiculo) => {
  try {
    const mailOptions = {
      from: `"eRally Argentino" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `${rally} fue cancelado - eRally Argentino`,
      html: `
        <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1a1a; padding: 30px; border-radius: 12px;">

          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #00d4ff; padding-bottom: 20px;">
            <h1 style="font-family: Arial, sans-serif; font-weight: 900; color: #00d4ff; font-size: 1.8rem; letter-spacing: 3px; margin: 0;">
              eRally Argentino
            </h1>
          </div>

          <!-- Título -->
          <h2 style="color: #ff4444; font-size: 1.5rem; letter-spacing: 2px; margin-bottom: 20px;">
            ❌ ${rally} fue cancelado
          </h2>

          <p style="font-size: 15px; color: #cccccc; margin-bottom: 20px;">
            Hola <strong style="color: #ffffff;">${nombre}</strong>,
          </p>

          <p style="font-size: 15px; color: #cccccc; margin-bottom: 25px;">
            Lamentamos informarte que el rally <strong style="color: #ffffff;">${rally}</strong> ha sido cancelado.
          </p>

          <!-- Vehículo -->
          <div style="background-color: #2a2a2a; border-left: 4px solid #ff4444; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #00d4ff; text-transform: uppercase; letter-spacing: 1px; margin-top: 0; margin-bottom: 12px;">
              Tu vehículo alquilado
            </h3>
            <p style="font-size: 16px; color: #ffffff; font-weight: bold; margin: 0 0 10px 0;">
              ${vehiculo}
            </p>
            <p style="font-size: 14px; color: #a0a0a0; margin: 0;">
              El vehículo quedara en tu garage y podés usarlo para otro rally cuando quieras.
            </p>
          </div>

          <!-- Aviso soporte -->
          <div style="background-color: #2a2a2a; border-left: 4px solid #ffd60a; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <p style="font-size: 14px; color: #ffd60a; font-weight: bold; margin: 0 0 6px 0;">
                ¿Querés participar en otra fecha?
            </p>
            <p style="font-size: 14px; color: #a0a0a0; margin: 0;">
              Comunicate con los administradores o soporte para que te asignen una nueva fecha.
            </p>
          </div>

          <!-- Botón -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/fechas"
               style="background: linear-gradient(135deg, #00d4ff, #39ff14); color: #1a1a1a; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-size: 15px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">
              Ver próximas fechas
            </a>
          </div>

          <!-- Footer -->
          <hr style="border: none; border-top: 1px solid #3a3a3a; margin: 30px 0;">

          <p style="font-size: 12px; color: #666666; text-align: center; margin: 0;">
            <strong style="color: #a0a0a0;">eRally Argentino</strong>
          </p>

        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email de cancelación enviado a: ${email}`);
  } catch (error) {
    console.error('Error al enviar email de cancelación:', error);
    throw new Error('No se pudo enviar el email de cancelación');
  }
};

export default {
  enviarEmailVerificacion,
  enviarEmailRecuperacion,
  enviarEmailCompra,
  enviarEmailAlquiler,
  enviarEmailReprogramacion,
  enviarEmailCancelacion
};