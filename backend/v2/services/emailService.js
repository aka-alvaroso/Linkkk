/**
 * Email Service using Resend
 * Handles all email notifications
 */

const { Resend } = require('resend');
const config = require('../config/environment');

let resend = null;

/**
 * Initialize Resend client
 */
function getResendClient() {
  if (resend) {
    return resend;
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️  Resend API key not configured. Email notifications will be skipped.');
    return null;
  }

  resend = new Resend(process.env.RESEND_API_KEY);
  console.log('✅ Email service (Resend) initialized');

  return resend;
}

/**
 * Email Templates
 */

const getUpgradeToProEmail = (userName, locale = 'en') => {
  if (locale === 'es') {
    return {
      subject: '🎉 ¡Bienvenido a Linkkk PRO!',
      html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; color: white; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
          .content { padding: 40px 30px; }
          .feature { margin: 20px 0; padding-left: 30px; position: relative; }
          .feature::before { content: "✓"; position: absolute; left: 0; color: #667eea; font-weight: bold; font-size: 20px; }
          .cta { text-align: center; margin: 40px 0; }
          .button { display: inline-block; padding: 14px 32px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
          .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #6c757d; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 ¡Bienvenido a PRO!</h1>
          </div>
          <div class="content">
            <p>Hola ${userName || 'amigo'},</p>
            <p>¡Tu cuenta ha sido mejorada a <strong>Linkkk PRO</strong>! Ahora tienes acceso a:</p>

            <div class="feature">Enlaces ilimitados</div>
            <div class="feature">Reglas ilimitadas por enlace</div>
            <div class="feature">Condiciones ilimitadas por regla</div>
            <div class="feature">Analíticas avanzadas</div>
            <div class="feature">Soporte prioritario</div>

            <p>¡Gracias por apoyar Linkkk! Estamos emocionados de ver lo que vas a crear.</p>

            <div class="cta">
              <a href="${config.frontend.url}/dashboard" class="button">Ir al Panel →</a>
            </div>
          </div>
          <div class="footer">
            <p>¿Preguntas? Responde a este correo o visita nuestro <a href="${config.frontend.url}/help">Centro de Ayuda</a></p>
            <p style="margin-top: 20px; font-size: 12px;">Linkkk - Gestión Inteligente de Enlaces</p>
          </div>
        </div>
      </body>
    </html>
  `
    };
  }

  return {
    subject: '🎉 Welcome to Linkkk PRO!',
    html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; color: white; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
          .content { padding: 40px 30px; }
          .feature { margin: 20px 0; padding-left: 30px; position: relative; }
          .feature::before { content: "✓"; position: absolute; left: 0; color: #667eea; font-weight: bold; font-size: 20px; }
          .cta { text-align: center; margin: 40px 0; }
          .button { display: inline-block; padding: 14px 32px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
          .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #6c757d; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to PRO!</h1>
          </div>
          <div class="content">
            <p>Hi ${userName || 'there'},</p>
            <p>Your account has been upgraded to <strong>Linkkk PRO</strong>! You now have access to:</p>

            <div class="feature">Unlimited links</div>
            <div class="feature">Unlimited rules per link</div>
            <div class="feature">Unlimited conditions per rule</div>
            <div class="feature">Advanced analytics</div>
            <div class="feature">Priority support</div>

            <p>Thank you for supporting Linkkk! We're excited to see what you'll build.</p>

            <div class="cta">
              <a href="${config.frontend.url}/dashboard" class="button">Go to Dashboard →</a>
            </div>
          </div>
          <div class="footer">
            <p>Questions? Reply to this email or visit our <a href="${config.frontend.url}/help">Help Center</a></p>
            <p style="margin-top: 20px; font-size: 12px;">Linkkk - Smart Link Management</p>
          </div>
        </div>
      </body>
    </html>
  `
  };
};

const getSubscriptionCancelledEmail = (userName, periodEnd, locale = 'en') => {
  if (locale === 'es') {
    return {
      subject: 'Suscripción Cancelada - Sentimos verte partir',
      html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: #6c757d; padding: 40px 20px; text-align: center; color: white; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
          .content { padding: 40px 30px; }
          .info-box { background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px; }
          .cta { text-align: center; margin: 40px 0; }
          .button { display: inline-block; padding: 14px 32px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
          .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #6c757d; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Suscripción Cancelada</h1>
          </div>
          <div class="content">
            <p>Hola ${userName || 'amigo'},</p>
            <p>Tu suscripción a Linkkk PRO ha sido cancelada.</p>

            <div class="info-box">
              <p style="margin: 0;"><strong>Acceso Hasta:</strong> ${periodEnd}</p>
              <p style="margin: 10px 0 0 0;">Mantendrás las funciones PRO hasta que finalice tu período de facturación actual.</p>
            </div>

            <p>¡Sentimos verte partir! Si hay algo que podríamos haber hecho mejor, nos encantaría saberlo.</p>

            <p><strong>¿Cambiaste de opinión?</strong> Puedes reactivar tu suscripción en cualquier momento desde tu configuración.</p>

            <div class="cta">
              <a href="${config.frontend.url}/settings" class="button">Gestionar Suscripción →</a>
            </div>
          </div>
          <div class="footer">
            <p>¿Preguntas? Responde a este correo</p>
            <p style="margin-top: 20px; font-size: 12px;">Linkkk - Gestión Inteligente de Enlaces</p>
          </div>
        </div>
      </body>
    </html>
  `
    };
  }

  return {
    subject: 'Subscription Cancelled - We\'re sad to see you go',
    html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: #6c757d; padding: 40px 20px; text-align: center; color: white; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
          .content { padding: 40px 30px; }
          .info-box { background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px; }
          .cta { text-align: center; margin: 40px 0; }
          .button { display: inline-block; padding: 14px 32px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
          .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #6c757d; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Subscription Cancelled</h1>
          </div>
          <div class="content">
            <p>Hi ${userName || 'there'},</p>
            <p>Your Linkkk PRO subscription has been cancelled.</p>

            <div class="info-box">
              <p style="margin: 0;"><strong>Access Until:</strong> ${periodEnd}</p>
              <p style="margin: 10px 0 0 0;">You'll keep PRO features until your current billing period ends.</p>
            </div>

            <p>We're sad to see you go! If there's anything we could have done better, we'd love to hear from you.</p>

            <p><strong>Changed your mind?</strong> You can reactivate your subscription anytime from your settings.</p>

            <div class="cta">
              <a href="${config.frontend.url}/settings" class="button">Manage Subscription →</a>
            </div>
          </div>
          <div class="footer">
            <p>Questions? Reply to this email</p>
            <p style="margin-top: 20px; font-size: 12px;">Linkkk - Smart Link Management</p>
          </div>
        </div>
      </body>
    </html>
  `
  };
};

const getPaymentFailedEmail = (userName, locale = 'en') => {
  if (locale === 'es') {
    return {
      subject: '⚠️ Pago Fallido - Acción Requerida',
      html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: #dc3545; padding: 40px 20px; text-align: center; color: white; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
          .content { padding: 40px 30px; }
          .warning-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 4px; }
          .cta { text-align: center; margin: 40px 0; }
          .button { display: inline-block; padding: 14px 32px; background: #dc3545; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
          .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #6c757d; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Pago Fallido</h1>
          </div>
          <div class="content">
            <p>Hola ${userName || 'amigo'},</p>
            <p>No pudimos procesar tu último pago de Linkkk PRO.</p>

            <div class="warning-box">
              <p style="margin: 0;"><strong>Acción Requerida:</strong></p>
              <p style="margin: 10px 0 0 0;">Por favor actualiza tu método de pago para continuar disfrutando de las funciones PRO.</p>
            </div>

            <p>Razones comunes de fallos de pago:</p>
            <ul>
              <li>Tarjeta de crédito vencida</li>
              <li>Fondos insuficientes</li>
              <li>Tarjeta rechazada por el banco</li>
            </ul>

            <p>Actualiza tu método de pago ahora para evitar la interrupción del servicio.</p>

            <div class="cta">
              <a href="${config.frontend.url}/settings" class="button">Actualizar Método de Pago →</a>
            </div>
          </div>
          <div class="footer">
            <p>¿Preguntas? Responde a este correo</p>
            <p style="margin-top: 20px; font-size: 12px;">Linkkk - Gestión Inteligente de Enlaces</p>
          </div>
        </div>
      </body>
    </html>
  `
    };
  }

  return {
    subject: '⚠️ Payment Failed - Action Required',
    html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: #dc3545; padding: 40px 20px; text-align: center; color: white; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
          .content { padding: 40px 30px; }
          .warning-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 4px; }
          .cta { text-align: center; margin: 40px 0; }
          .button { display: inline-block; padding: 14px 32px; background: #dc3545; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
          .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #6c757d; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Payment Failed</h1>
          </div>
          <div class="content">
            <p>Hi ${userName || 'there'},</p>
            <p>We were unable to process your latest payment for Linkkk PRO.</p>

            <div class="warning-box">
              <p style="margin: 0;"><strong>Action Required:</strong></p>
              <p style="margin: 10px 0 0 0;">Please update your payment method to continue enjoying PRO features.</p>
            </div>

            <p>Common reasons for payment failures:</p>
            <ul>
              <li>Expired credit card</li>
              <li>Insufficient funds</li>
              <li>Card declined by bank</li>
            </ul>

            <p>Update your payment method now to avoid service interruption.</p>

            <div class="cta">
              <a href="${config.frontend.url}/settings" class="button">Update Payment Method →</a>
            </div>
          </div>
          <div class="footer">
            <p>Questions? Reply to this email</p>
            <p style="margin-top: 20px; font-size: 12px;">Linkkk - Smart Link Management</p>
          </div>
        </div>
      </body>
    </html>
  `
  };
};

const getRenewalSuccessEmail = (userName, nextBillingDate, amount, locale = 'en') => {
  if (locale === 'es') {
    return {
      subject: '✅ Suscripción Renovada con Éxito',
      html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: #28a745; padding: 40px 20px; text-align: center; color: white; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
          .content { padding: 40px 30px; }
          .info-box { background: #f8f9fa; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 4px; }
          .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #6c757d; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Pago Exitoso</h1>
          </div>
          <div class="content">
            <p>Hola ${userName || 'amigo'},</p>
            <p>Tu suscripción a Linkkk PRO ha sido renovada con éxito.</p>

            <div class="info-box">
              <p style="margin: 0;"><strong>Monto Cobrado:</strong> $${amount || '9.99'}</p>
              <p style="margin: 10px 0 0 0;"><strong>Próxima Fecha de Facturación:</strong> ${nextBillingDate}</p>
            </div>

            <p>¡Gracias por ser un miembro PRO! 🎉</p>

            <p>Puedes ver tu historial de facturación y gestionar tu suscripción en cualquier momento desde tu configuración.</p>
          </div>
          <div class="footer">
            <p>¿Preguntas? Responde a este correo</p>
            <p style="margin-top: 20px; font-size: 12px;">Linkkk - Gestión Inteligente de Enlaces</p>
          </div>
        </div>
      </body>
    </html>
  `
    };
  }

  return {
    subject: '✅ Subscription Renewed Successfully',
  html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: #28a745; padding: 40px 20px; text-align: center; color: white; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
          .content { padding: 40px 30px; }
          .info-box { background: #f8f9fa; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 4px; }
          .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #6c757d; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Payment Successful</h1>
          </div>
          <div class="content">
            <p>Hi ${userName || 'there'},</p>
            <p>Your Linkkk PRO subscription has been renewed successfully.</p>

            <div class="info-box">
              <p style="margin: 0;"><strong>Amount Charged:</strong> $${amount || '9.99'}</p>
              <p style="margin: 10px 0 0 0;"><strong>Next Billing Date:</strong> ${nextBillingDate}</p>
            </div>

            <p>Thank you for being a valued PRO member! 🎉</p>

            <p>You can view your billing history and manage your subscription anytime from your settings.</p>
          </div>
          <div class="footer">
            <p>Questions? Reply to this email</p>
            <p style="margin-top: 20px; font-size: 12px;">Linkkk - Smart Link Management</p>
          </div>
        </div>
      </body>
    </html>
  `
  };
};

/**
 * Send email functions
 */

async function sendUpgradeToProEmail(userEmail, userName, locale = 'en') {
  const client = getResendClient();
  if (!client) return { success: false, message: 'Email service not configured' };

  try {
    const { subject, html } = getUpgradeToProEmail(userName, locale);

    const result = await client.emails.send({
      from: 'Linkkk <noreply@linkkk.dev>',
      to: userEmail,
      subject,
      html,
    });

    console.log('✅ Upgrade email sent:', userEmail);
    return { success: true, id: result.id };
  } catch (error) {
    console.error('❌ Error sending upgrade email:', error);
    return { success: false, error: error.message };
  }
}

async function sendSubscriptionCancelledEmail(userEmail, userName, periodEnd, locale = 'en') {
  const client = getResendClient();
  if (!client) return { success: false, message: 'Email service not configured' };

  try {
    const formattedDate = new Date(periodEnd).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const { subject, html } = getSubscriptionCancelledEmail(userName, formattedDate, locale);

    const result = await client.emails.send({
      from: 'Linkkk <noreply@linkkk.dev>',
      to: userEmail,
      subject,
      html,
    });

    console.log('✅ Cancellation email sent:', userEmail);
    return { success: true, id: result.id };
  } catch (error) {
    console.error('❌ Error sending cancellation email:', error);
    return { success: false, error: error.message };
  }
}

async function sendPaymentFailedEmail(userEmail, userName, locale = 'en') {
  const client = getResendClient();
  if (!client) return { success: false, message: 'Email service not configured' };

  try {
    const { subject, html } = getPaymentFailedEmail(userName, locale);

    const result = await client.emails.send({
      from: 'Linkkk <noreply@linkkk.dev>',
      to: userEmail,
      subject,
      html,
    });

    console.log('✅ Payment failed email sent:', userEmail);
    return { success: true, id: result.id };
  } catch (error) {
    console.error('❌ Error sending payment failed email:', error);
    return { success: false, error: error.message };
  }
}

async function sendRenewalSuccessEmail(userEmail, userName, nextBillingDate, amount, locale = 'en') {
  const client = getResendClient();
  if (!client) return { success: false, message: 'Email service not configured' };

  try {
    const formattedDate = new Date(nextBillingDate).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const { subject, html } = getRenewalSuccessEmail(userName, formattedDate, amount, locale);

    const result = await client.emails.send({
      from: 'Linkkk <noreply@linkkk.dev>',
      to: userEmail,
      subject,
      html,
    });

    console.log('✅ Renewal email sent:', userEmail);
    return { success: true, id: result.id };
  } catch (error) {
    console.error('❌ Error sending renewal email:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendUpgradeToProEmail,
  sendSubscriptionCancelledEmail,
  sendPaymentFailedEmail,
  sendRenewalSuccessEmail,
};
