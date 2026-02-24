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
// EMAIL DE VERIFICACIÓN DE CUENTA
// ========================================
export const enviarEmailVerificacion = async (email, nombre, token) => {
  try {
    const urlVerificacion = `${process.env.FRONTEND_URL}/verificar-email/${token}`;

    const mailOptions = {
      from: `"eRally Argentino" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '¡Bienvenido a eRally Argentino! Verificá tu cuenta',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2c3e50;">¡Hola ${nombre}! 👋</h1>
          
          <p style="font-size: 16px; color: #34495e;">
            ¡Bienvenido a <strong>eRally Argentino</strong>!
          </p>

          <p style="font-size: 16px; color: #34495e;">
            Para activar tu cuenta, hacé click en el siguiente botón:
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${urlVerificacion}" 
               style="background-color: #3498db; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; display: inline-block;">
              Verificar mi cuenta
            </a>
          </div>

          <p style="font-size: 14px; color: #7f8c8d;">
            Si el botón no funciona, copiá y pegá este link en tu navegador:
          </p>
          <p style="font-size: 14px; color: #3498db; word-break: break-all;">
            ${urlVerificacion}
          </p>

          <hr style="border: none; border-top: 1px solid #ecf0f1; margin: 30px 0;">

          <p style="font-size: 12px; color: #95a5a6;">
            Este link expira en 24 horas. Si no creaste esta cuenta, podés ignorar este email.
          </p>

          <p style="font-size: 12px; color: #95a5a6;">
            Saludos,<br>
            <strong>Equipo eRally Argentino</strong>
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
// EMAIL DE RECUPERACIÓN DE CONTRASEÑA
// ========================================
export const enviarEmailRecuperacion = async (email, nombre, token) => {
  try {
    const urlRecuperacion = `${process.env.FRONTEND_URL}/resetear-password/${token}`;

    const mailOptions = {
      from: `"eRally Argentino" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Recuperación de contraseña - eRally Argentino',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2c3e50;">Hola ${nombre} 👋</h1>
          
          <p style="font-size: 16px; color: #34495e;">
            Recibimos una solicitud para restablecer tu contraseña de <strong>eRally Argentino</strong>.
          </p>

          <p style="font-size: 16px; color: #34495e;">
            Hacé click en el siguiente botón para crear una nueva contraseña:
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${urlRecuperacion}" 
               style="background-color: #e74c3c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; display: inline-block;">
              Restablecer contraseña
            </a>
          </div>

          <p style="font-size: 14px; color: #7f8c8d;">
            Si el botón no funciona, copiá y pegá este link en tu navegador:
          </p>
          <p style="font-size: 14px; color: #e74c3c; word-break: break-all;">
            ${urlRecuperacion}
          </p>

          <hr style="border: none; border-top: 1px solid #ecf0f1; margin: 30px 0;">

          <p style="font-size: 12px; color: #95a5a6;">
            Este link expira en 1 hora. Si no solicitaste este cambio, ignorá este email y tu contraseña permanecerá sin cambios.
          </p>

          <p style="font-size: 12px; color: #95a5a6;">
            Saludos,<br>
            <strong>Equipo eRally Argentino</strong>
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
// EMAIL DE CONFIRMACIÓN DE COMPRA
// ========================================
export const enviarEmailCompra = async (email, nombre, vehiculo) => {
  try {
    const mailOptions = {
      from: `"eRally Argentino" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '¡Compra confirmada! 🎉 - eRally Argentino',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #27ae60;">¡Compra confirmada! 🎉</h1>
          
          <p style="font-size: 16px; color: #34495e;">
            Hola <strong>${nombre}</strong>,
          </p>

          <p style="font-size: 16px; color: #34495e;">
            ¡Felicitaciones! Tu compra se procesó exitosamente.
          </p>

          <div style="background-color: #ecf0f1; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #2c3e50; margin-top: 0;">Vehículo adquirido:</h3>
            <p style="font-size: 18px; color: #34495e; margin: 10px 0;">
              <strong>${vehiculo}</strong>
            </p>
            <p style="font-size: 14px; color: #7f8c8d; margin: 0;">
              Vigencia: 1 año desde hoy
            </p>
          </div>

          <p style="font-size: 16px; color: #34495e;">
            Ya podés ver tu vehículo en tu garage y usarlo en todos los rallies que quieras.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/garage" 
               style="background-color: #27ae60; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; display: inline-block;">
              Ver mi garage
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #ecf0f1; margin: 30px 0;">

          <p style="font-size: 12px; color: #95a5a6;">
            ¡Nos vemos en la pista! 🏁<br>
            <strong>Equipo eRally Argentino</strong>
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
// EMAIL DE CONFIRMACIÓN DE ALQUILER
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
      subject: '¡Alquiler confirmado! 🏁 - eRally Argentino',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f39c12;">¡Alquiler confirmado! 🏁</h1>
          
          <p style="font-size: 16px; color: #34495e;">
            Hola <strong>${nombre}</strong>,
          </p>

          <p style="font-size: 16px; color: #34495e;">
            ¡Tu alquiler se procesó exitosamente! Estás listo para correr.
          </p>

          <div style="background-color: #ecf0f1; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #2c3e50; margin-top: 0;">Detalles del alquiler:</h3>
            <p style="font-size: 18px; color: #34495e; margin: 10px 0;">
              <strong>Vehículo:</strong> ${vehiculo}
            </p>
            <p style="font-size: 18px; color: #34495e; margin: 10px 0;">
              <strong>Rally:</strong> ${rally}
            </p>
            <p style="font-size: 16px; color: #7f8c8d; margin: 10px 0;">
              <strong>Fecha:</strong> ${fechaFormateada}
            </p>
          </div>

          <p style="font-size: 16px; color: #34495e;">
            El vehículo ya está disponible en tu garage y estará activo hasta la fecha del rally.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/garage" 
               style="background-color: #f39c12; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; display: inline-block;">
              Ver mi garage
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #ecf0f1; margin: 30px 0;">

          <p style="font-size: 12px; color: #95a5a6;">
            ¡Mucha suerte en el rally! 🏆<br>
            <strong>Equipo eRally Argentino</strong>
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
// EMAIL DE REPROGRAMACIÓN DE RALLY
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
      subject: `Rally reprogramado: ${rally} - eRally Argentino`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #e67e22;">Rally reprogramado 📅</h1>
          
          <p style="font-size: 16px; color: #34495e;">
            Hola <strong>${nombre}</strong>,
          </p>

          <p style="font-size: 16px; color: #34495e;">
            Te informamos que el rally <strong>${rally}</strong> ha sido reprogramado.
          </p>

          <div style="background-color: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #856404; margin-top: 0;">Nueva fecha:</h3>
            <p style="font-size: 18px; color: #856404; margin: 10px 0;">
              <strong>Fecha anterior:</strong> ${fechaAnteriorFormateada}
            </p>
            <p style="font-size: 20px; color: #d39e00; margin: 10px 0;">
              <strong>Nueva fecha:</strong> ${fechaNuevaFormateada}
            </p>
          </div>

          <p style="font-size: 16px; color: #34495e;">
            Tu vehículo alquilado (<strong>${vehiculo}</strong>) sigue activo y estará disponible hasta la nueva fecha del rally.
          </p>

          <p style="font-size: 14px; color: #7f8c8d;">
            No necesitás hacer nada. Tu alquiler se actualizó automáticamente.
          </p>

          <hr style="border: none; border-top: 1px solid #ecf0f1; margin: 30px 0;">

          <p style="font-size: 12px; color: #95a5a6;">
            ¡Nos vemos en la nueva fecha! 🏁<br>
            <strong>Equipo eRally Argentino</strong>
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
// EMAIL DE CANCELACIÓN DE RALLY
// ========================================
export const enviarEmailCancelacion = async (email, nombre, rally, vehiculo) => {
  try {
    const mailOptions = {
      from: `"eRally Argentino" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Rally cancelado: ${rally} - eRally Argentino`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #e74c3c;">Rally cancelado ❌</h1>
          
          <p style="font-size: 16px; color: #34495e;">
            Hola <strong>${nombre}</strong>,
          </p>

          <p style="font-size: 16px; color: #34495e;">
            Lamentamos informarte que el rally <strong>${rally}</strong> ha sido cancelado.
          </p>

          <div style="background-color: #f8d7da; padding: 20px; border-left: 4px solid #dc3545; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #721c24; margin-top: 0;">Tu vehículo alquilado:</h3>
            <p style="font-size: 16px; color: #721c24; margin: 10px 0;">
              <strong>${vehiculo}</strong>
            </p>
            <p style="font-size: 14px; color: #721c24; margin: 10px 0;">
              El vehículo permanece en tu garage y podés usarlo para otro rally cuando quieras.
            </p>
          </div>

          <p style="font-size: 16px; color: #34495e;">
            No perdés tu alquiler. Podés elegir otra fecha para correr con este vehículo.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/rallies" 
               style="background-color: #3498db; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; display: inline-block;">
              Ver próximos rallies
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #ecf0f1; margin: 30px 0;">

          <p style="font-size: 12px; color: #95a5a6;">
            Disculpá las molestias.<br>
            <strong>Equipo eRally Argentino</strong>
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