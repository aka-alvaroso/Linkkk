/**
 * Telegram Service for Admin Notifications
 * Sends real-time notifications about subscription events
 */

const config = require('../config/environment');

let telegramConfig = {
  botToken: null,
  chatId: null,
};

/**
 * Initialize Telegram configuration
 */
function initializeTelegram() {
  telegramConfig.botToken = process.env.TELEGRAM_BOT_TOKEN;
  telegramConfig.chatId = process.env.TELEGRAM_CHAT_ID;

  if (!telegramConfig.botToken || !telegramConfig.chatId) {
    console.warn('⚠️  Telegram not configured. Admin notifications will be skipped.');
    console.warn('   Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env to enable.');
    return false;
  }

  console.log('✅ Telegram service initialized');
  return true;
}

/**
 * Send message to Telegram
 */
async function sendMessage(message) {
  if (!telegramConfig.botToken || !telegramConfig.chatId) {
    if (!initializeTelegram()) {
      return { success: false, message: 'Telegram not configured' };
    }
  }

  try {
    const url = `https://api.telegram.org/bot${telegramConfig.botToken}/sendMessage`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: telegramConfig.chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      console.error('❌ Telegram API error:', data);
      return { success: false, error: data.description || 'Unknown error' };
    }

    console.log('✅ Telegram notification sent');
    return { success: true, messageId: data.result.message_id };
  } catch (error) {
    console.error('❌ Error sending Telegram message:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Format currency
 */
function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Format date
 */
function formatDate(date) {
  return new Date(date).toLocaleString('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

/**
 * Send notification when a user subscribes to PRO
 */
async function notifyNewSubscription(userEmail, userName, amount, periodEnd) {
  const message = `
🎉 <b>Nueva Suscripción PRO</b>

👤 <b>Usuario:</b> ${userName || 'N/A'}
📧 <b>Email:</b> ${userEmail}
💰 <b>Monto:</b> ${formatCurrency(amount / 100)}
📅 <b>Próximo cobro:</b> ${formatDate(periodEnd)}

🔗 <a href="${config.frontend.url}/admin">Ver panel</a>
  `.trim();

  return sendMessage(message);
}

/**
 * Send notification when a subscription is cancelled
 */
async function notifyCancellation(userEmail, userName, periodEnd, reason = 'user_action') {
  const reasonText = reason === 'user_action' ? 'Usuario canceló' : 'Cancelación automática';

  const message = `
❌ <b>Suscripción Cancelada</b>

👤 <b>Usuario:</b> ${userName || 'N/A'}
📧 <b>Email:</b> ${userEmail}
⚠️ <b>Motivo:</b> ${reasonText}
📅 <b>Acceso hasta:</b> ${formatDate(periodEnd)}

🔗 <a href="${config.frontend.url}/admin">Ver panel</a>
  `.trim();

  return sendMessage(message);
}

/**
 * Send notification when a payment fails
 */
async function notifyPaymentFailed(userEmail, userName, amount, attemptCount) {
  const message = `
⚠️ <b>Pago Fallido</b>

👤 <b>Usuario:</b> ${userName || 'N/A'}
📧 <b>Email:</b> ${userEmail}
💰 <b>Monto:</b> ${formatCurrency(amount / 100)}
🔄 <b>Intento:</b> ${attemptCount}

⚡ El usuario ha sido notificado por email.

🔗 <a href="${config.frontend.url}/admin">Ver panel</a>
  `.trim();

  return sendMessage(message);
}

/**
 * Send notification when a subscription is renewed successfully
 */
async function notifyRenewalSuccess(userEmail, userName, amount, nextBillingDate) {
  const message = `
✅ <b>Renovación Exitosa</b>

👤 <b>Usuario:</b> ${userName || 'N/A'}
📧 <b>Email:</b> ${userEmail}
💰 <b>Monto:</b> ${formatCurrency(amount / 100)}
📅 <b>Próximo cobro:</b> ${formatDate(nextBillingDate)}

🔗 <a href="${config.frontend.url}/admin">Ver panel</a>
  `.trim();

  return sendMessage(message);
}

/**
 * Send notification when a payment recovers from PAST_DUE
 */
async function notifyPaymentRecovered(userEmail, userName, amount) {
  const message = `
🎉 <b>Pago Recuperado</b>

👤 <b>Usuario:</b> ${userName || 'N/A'}
📧 <b>Email:</b> ${userEmail}
💰 <b>Monto:</b> ${formatCurrency(amount / 100)}

✅ La suscripción ha sido reactivada.

🔗 <a href="${config.frontend.url}/admin">Ver panel</a>
  `.trim();

  return sendMessage(message);
}

/**
 * Send test notification
 */
async function sendTestNotification() {
  const message = `
🤖 <b>Test de Notificaciones</b>

✅ El servicio de Telegram está funcionando correctamente.

🕐 ${formatDate(new Date())}
  `.trim();

  return sendMessage(message);
}

module.exports = {
  initializeTelegram,
  notifyNewSubscription,
  notifyCancellation,
  notifyPaymentFailed,
  notifyRenewalSuccess,
  notifyPaymentRecovered,
  sendTestNotification,
};
