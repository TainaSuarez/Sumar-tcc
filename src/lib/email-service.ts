/**
 * Servicio de envío de emails para donaciones
 * Configurado para usar nodemailer o servicio de email de tu elección
 */

interface DonationThankYouEmailParams {
  donorEmail: string;
  donorName: string;
  amount: number;
  currency: string;
  campaignTitle: string;
  campaignCreator: string;
  transactionId: string;
  donationId: string;
  cardLastFour?: string;
  cardBrand?: string;
}

interface DonationPendingVerificationEmailParams {
  donorEmail: string;
  donorName: string;
  amount: number;
  currency: string;
  campaignTitle: string;
  campaignCreator: string;
}

/**
 * Formatea el monto con la moneda correspondiente
 */
function formatCurrency(amount: number, currency: string): string {
  const currencyMap: Record<string, { locale: string; currencyCode: string }> = {
    UYU: { locale: 'es-UY', currencyCode: 'UYU' },
    USD: { locale: 'en-US', currencyCode: 'USD' },
    EUR: { locale: 'es-ES', currencyCode: 'EUR' },
  };

  const config = currencyMap[currency.toUpperCase()] || currencyMap.UYU;

  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currencyCode,
  }).format(amount);
}

/**
 * Envía un email de agradecimiento al donante
 */
export async function sendDonationThankYouEmail(params: DonationThankYouEmailParams): Promise<void> {
  const {
    donorEmail,
    donorName,
    amount,
    currency,
    campaignTitle,
    campaignCreator,
    transactionId,
    donationId,
    cardLastFour,
    cardBrand,
  } = params;

  const formattedAmount = formatCurrency(amount, currency);
  const currentDate = new Date().toLocaleDateString('es-UY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Plantilla HTML del email
  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gracias por tu donación</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 10px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 3px solid #4CAF50;
      padding-bottom: 20px;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #4CAF50;
      margin-bottom: 10px;
    }
    .thank-you {
      font-size: 24px;
      color: #4CAF50;
      margin: 20px 0;
      font-weight: bold;
    }
    .message {
      font-size: 16px;
      margin: 20px 0;
      color: #555;
    }
    .donation-details {
      background-color: #f9f9f9;
      border-left: 4px solid #4CAF50;
      padding: 20px;
      margin: 25px 0;
      border-radius: 5px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      font-weight: 600;
      color: #666;
    }
    .detail-value {
      color: #333;
      text-align: right;
    }
    .amount {
      font-size: 28px;
      color: #4CAF50;
      font-weight: bold;
    }
    .campaign-info {
      background-color: #e3f2fd;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      color: #888;
      font-size: 14px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #4CAF50;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
    }
    .icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Sumar+</div>
      <div class="icon">❤️</div>
      <h1 class="thank-you">¡Gracias por tu donación!</h1>
    </div>

    <p class="message">
      Hola <strong>${donorName}</strong>,
    </p>

    <p class="message">
      Tu donación ha sido procesada correctamente. Queremos expresar nuestro más sincero agradecimiento
      por tu generosa contribución a la campaña <strong>"${campaignTitle}"</strong>.
    </p>

    <div class="campaign-info">
      <strong>Campaña:</strong> ${campaignTitle}<br>
      <strong>Creador:</strong> ${campaignCreator}
    </div>

    <div class="donation-details">
      <div class="detail-row">
        <span class="detail-label">Monto donado:</span>
        <span class="detail-value amount">${formattedAmount}</span>
      </div>
      ${cardBrand ? `
      <div class="detail-row">
        <span class="detail-label">Método de pago:</span>
        <span class="detail-value">${cardBrand} ${cardLastFour ? `**** ${cardLastFour}` : ''}</span>
      </div>
      ` : ''}
      <div class="detail-row">
        <span class="detail-label">Fecha:</span>
        <span class="detail-value">${currentDate}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">ID de transacción:</span>
        <span class="detail-value" style="font-family: monospace; font-size: 12px;">${transactionId}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">ID de donación:</span>
        <span class="detail-value" style="font-family: monospace; font-size: 12px;">${donationId}</span>
      </div>
    </div>

    <p class="message">
      Tu donación ayudará a hacer realidad esta causa. Cada contribución cuenta y juntos
      podemos generar un impacto positivo en nuestra comunidad.
    </p>

    <p class="message" style="text-align: center;">
      <strong>Tu apoyo hace la diferencia. ¡Gracias por sumar!</strong>
    </p>

    <div class="footer">
      <p>Este es un recibo automático de tu donación.</p>
      <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
      <p style="margin-top: 20px; color: #aaa; font-size: 12px;">
        © ${new Date().getFullYear()} Sumar+ - Plataforma de Donaciones y Crowdfunding
      </p>
    </div>
  </div>
</body>
</html>
  `;

  // Versión texto plano
  const textContent = `
¡Gracias por tu donación!

Hola ${donorName},

Tu donación ha sido procesada correctamente. Queremos expresar nuestro más sincero agradecimiento
por tu generosa contribución a la campaña "${campaignTitle}".

DETALLES DE LA DONACIÓN:
- Monto donado: ${formattedAmount}
- Campaña: ${campaignTitle}
- Creador: ${campaignCreator}
${cardBrand ? `- Método de pago: ${cardBrand} ${cardLastFour ? `**** ${cardLastFour}` : ''}` : ''}
- Fecha: ${currentDate}
- ID de transacción: ${transactionId}
- ID de donación: ${donationId}

Tu donación ayudará a hacer realidad esta causa. Cada contribución cuenta y juntos
podemos generar un impacto positivo en nuestra comunidad.

Tu apoyo hace la diferencia. ¡Gracias por sumar!

---
Este es un recibo automático de tu donación.
Si tienes alguna pregunta, no dudes en contactarnos.

© ${new Date().getFullYear()} Sumar+ - Plataforma de Donaciones y Crowdfunding
  `;

  // Logging para desarrollo
  console.log('📧 Email de agradecimiento enviado:', {
    to: donorEmail,
    subject: `¡Gracias por tu donación de ${formattedAmount}!`,
  });

  // Envío real de email con nodemailer
  try {
    const nodemailer = require('nodemailer');

    // Configurar transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Enviar email
    const info = await transporter.sendMail({
      from: `"Sumar+" <${process.env.SMTP_USER}>`,
      to: donorEmail,
      subject: `¡Gracias por tu donación de ${formattedAmount}!`,
      text: textContent,
      html: htmlContent,
    });

    console.log('✅ Email enviado exitosamente:', info.messageId);
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    throw error; // Re-lanzar el error para que la API lo maneje
  }
}

/**
 * Envía un email informando que el pago está pendiente de verificación del creador
 */
export async function sendDonationPendingVerificationEmail(params: DonationPendingVerificationEmailParams): Promise<void> {
  const {
    donorEmail,
    donorName,
    amount,
    currency,
    campaignTitle,
    campaignCreator,
  } = params;

  const formattedAmount = formatCurrency(amount, currency);

  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Información sobre tu donación</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 10px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 3px solid #FF9800;
      padding-bottom: 20px;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #FF9800;
      margin-bottom: 10px;
    }
    .icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .title {
      font-size: 22px;
      color: #FF9800;
      margin: 20px 0;
      font-weight: bold;
    }
    .message {
      font-size: 16px;
      margin: 20px 0;
      color: #555;
    }
    .info-box {
      background-color: #fff3e0;
      border-left: 4px solid #FF9800;
      padding: 20px;
      margin: 25px 0;
      border-radius: 5px;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      color: #888;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Sumar+</div>
      <div class="icon">⏳</div>
      <h1 class="title">Información Importante sobre tu Donación</h1>
    </div>

    <p class="message">
      Hola <strong>${donorName}</strong>,
    </p>

    <p class="message">
      Tu pago de <strong>${formattedAmount}</strong> para la campaña
      <strong>"${campaignTitle}"</strong> ha sido procesado correctamente.
    </p>

    <div class="info-box">
      <p style="margin: 0; font-weight: bold; color: #FF9800;">
        ⚠️ Información Importante
      </p>
      <p style="margin: 10px 0 0 0;">
        El creador de la campaña (<strong>${campaignCreator}</strong>) aún no ha completado
        la verificación de sus datos empresariales o bancarios. Por esta razón, tu donación
        quedará registrada pero el desembolso de fondos estará pendiente hasta que el creador
        valide su información.
      </p>
    </div>

    <p class="message">
      <strong>¿Qué significa esto?</strong>
    </p>
    <ul style="color: #555;">
      <li>Tu pago fue procesado exitosamente y está seguro.</li>
      <li>Tu donación aparecerá en el progreso de la campaña.</li>
      <li>Los fondos serán transferidos al creador una vez complete la verificación.</li>
      <li>Esto es un proceso de seguridad para proteger tanto a donantes como a creadores.</li>
    </ul>

    <p class="message">
      Te mantendremos informado sobre el estado de la campaña. Si tienes alguna pregunta,
      no dudes en contactarnos.
    </p>

    <p class="message" style="text-align: center;">
      <strong>¡Gracias por tu paciencia y generosidad!</strong>
    </p>

    <div class="footer">
      <p>Este es un mensaje automático de información.</p>
      <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
      <p style="margin-top: 20px; color: #aaa; font-size: 12px;">
        © ${new Date().getFullYear()} Sumar+ - Plataforma de Donaciones y Crowdfunding
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const textContent = `
Información Importante sobre tu Donación

Hola ${donorName},

Tu pago de ${formattedAmount} para la campaña "${campaignTitle}" ha sido procesado correctamente.

⚠️ INFORMACIÓN IMPORTANTE

El creador de la campaña (${campaignCreator}) aún no ha completado la verificación de sus datos
empresariales o bancarios. Por esta razón, tu donación quedará registrada pero el desembolso
de fondos estará pendiente hasta que el creador valide su información.

¿Qué significa esto?

- Tu pago fue procesado exitosamente y está seguro.
- Tu donación aparecerá en el progreso de la campaña.
- Los fondos serán transferidos al creador una vez complete la verificación.
- Esto es un proceso de seguridad para proteger tanto a donantes como a creadores.

Te mantendremos informado sobre el estado de la campaña. Si tienes alguna pregunta,
no dudes en contactarnos.

¡Gracias por tu paciencia y generosidad!

---
© ${new Date().getFullYear()} Sumar+ - Plataforma de Donaciones y Crowdfunding
  `;

  console.log('📧 Email de verificación pendiente:', {
    to: donorEmail,
    subject: 'Información sobre tu donación - Verificación pendiente',
  });

  // Envío real de email con nodemailer
  try {
    const nodemailer = require('nodemailer');

    // Configurar transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Enviar email
    const info = await transporter.sendMail({
      from: `"Sumar+" <${process.env.SMTP_USER}>`,
      to: donorEmail,
      subject: 'Información sobre tu donación - Verificación pendiente',
      text: textContent,
      html: htmlContent,
    });

    console.log('✅ Email de verificación enviado exitosamente:', info.messageId);
  } catch (error) {
    console.error('❌ Error enviando email de verificación:', error);
    throw error;
  }
}

/**
 * Envía notificación de actualización de campaña a los donadores
 */
export async function sendCampaignUpdateNotification(params: {
  donorEmail: string;
  donorName: string;
  campaignTitle: string;
  campaignCreator: string;
  updateTitle: string;
  updateContent: string;
  campaignSlug: string;
}): Promise<void> {
  const {
    donorEmail,
    donorName,
    campaignTitle,
    campaignCreator,
    updateTitle,
    updateContent,
    campaignSlug,
  } = params;

  const campaignUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/campaigns/${campaignSlug}`;

  // Truncar contenido si es muy largo
  const shortContent = updateContent.length > 300
    ? updateContent.substring(0, 300) + '...'
    : updateContent;

  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Actualización de Campaña</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 10px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 3px solid #2196F3;
      padding-bottom: 20px;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #2196F3;
      margin-bottom: 10px;
    }
    .icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .title {
      font-size: 22px;
      color: #2196F3;
      margin: 20px 0;
      font-weight: bold;
    }
    .message {
      font-size: 16px;
      margin: 20px 0;
      color: #555;
    }
    .update-box {
      background-color: #e3f2fd;
      border-left: 4px solid #2196F3;
      padding: 20px;
      margin: 25px 0;
      border-radius: 5px;
    }
    .update-title {
      font-size: 18px;
      font-weight: bold;
      color: #1976D2;
      margin-bottom: 10px;
    }
    .update-content {
      color: #555;
      line-height: 1.6;
    }
    .campaign-info {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #2196F3;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
      text-align: center;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      color: #888;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Sumar+</div>
      <div class="icon">📢</div>
      <h1 class="title">Nueva Actualización de Campaña</h1>
    </div>

    <p class="message">
      Hola <strong>${donorName}</strong>,
    </p>

    <p class="message">
      <strong>${campaignCreator}</strong> ha publicado una nueva actualización en la campaña
      <strong>"${campaignTitle}"</strong> que apoyaste con tu donación.
    </p>

    <div class="update-box">
      <div class="update-title">${updateTitle}</div>
      <div class="update-content">${shortContent}</div>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${campaignUrl}" class="button">
        Ver Actualización Completa
      </a>
    </div>

    <div class="campaign-info">
      <strong>Campaña:</strong> ${campaignTitle}<br>
      <strong>Creador:</strong> ${campaignCreator}
    </div>

    <p class="message">
      Gracias por tu apoyo a esta campaña. Tu contribución está ayudando a hacer realidad esta causa.
    </p>

    <div class="footer">
      <p>Recibes este email porque realizaste una donación a esta campaña.</p>
      <p>Si no deseas recibir más actualizaciones, puedes desactivar las notificaciones en tu perfil.</p>
      <p style="margin-top: 20px; color: #aaa; font-size: 12px;">
        © ${new Date().getFullYear()} Sumar+ - Plataforma de Donaciones y Crowdfunding
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const textContent = `
Nueva Actualización de Campaña

Hola ${donorName},

${campaignCreator} ha publicado una nueva actualización en la campaña "${campaignTitle}" que apoyaste con tu donación.

${updateTitle}
${shortContent}

Ver actualización completa: ${campaignUrl}

Campaña: ${campaignTitle}
Creador: ${campaignCreator}

Gracias por tu apoyo a esta campaña. Tu contribución está ayudando a hacer realidad esta causa.

---
Recibes este email porque realizaste una donación a esta campaña.
Si no deseas recibir más actualizaciones, puedes desactivar las notificaciones en tu perfil.

© ${new Date().getFullYear()} Sumar+ - Plataforma de Donaciones y Crowdfunding
  `;

  console.log('📧 Email de actualización de campaña:', {
    to: donorEmail,
    subject: `Nueva actualización: ${campaignTitle}`,
  });

  // Envío real de email con nodemailer
  try {
    const nodemailer = require('nodemailer');

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Sumar+" <${process.env.SMTP_USER}>`,
      to: donorEmail,
      subject: `Nueva actualización: ${campaignTitle}`,
      text: textContent,
      html: htmlContent,
    });

    console.log('✅ Email de actualización enviado exitosamente:', info.messageId);
  } catch (error) {
    console.error('❌ Error enviando email de actualización:', error);
    // No lanzar error para no bloquear la creación de la actualización
  }
}

/**
 * Configuración de email (para cuando implementes el servicio real)
 */
export const emailConfig = {
  from: '"Sumar+" <noreply@sumar.com>',
  replyTo: 'soporte@sumar.com',
  // Agrega aquí otras configuraciones según tu servicio de email
};
