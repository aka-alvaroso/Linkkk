/**
 * Telegram Service for Admin Notifications
 * Sends real-time notifications about subscription events
 */

const config = require("../config/environment");

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
    console.warn(
      "⚠️  Telegram not configured. Admin notifications will be skipped."
    );
    console.warn(
      "   Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env to enable."
    );
    return false;
  }

  console.log("✅ Telegram service initialized");
  return true;
}

/**
 * Send message to Telegram
 */
async function sendMessage(message) {
  if (!telegramConfig.botToken || !telegramConfig.chatId) {
    if (!initializeTelegram()) {
      return { success: false, message: "Telegram not configured" };
    }
  }

  try {
    const url = `https://api.telegram.org/bot${telegramConfig.botToken}/sendMessage`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: telegramConfig.chatId,
        text: message,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      console.error("❌ Telegram API error:", data);
      return { success: false, error: data.description || "Unknown error" };
    }

    console.log("✅ Telegram notification sent");
    return { success: true, messageId: data.result.message_id };
  } catch (error) {
    console.error("❌ Error sending Telegram message:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Format currency
 */
function formatCurrency(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

/**
 * Format date
 */
function formatDate(date) {
  return new Date(date).toLocaleString("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/**
 * Send notification when a user subscribes to PRO
 */
async function notifyNewSubscription(userEmail, userName, amount, periodEnd) {
  const message = `
🎉 <b>Nueva Suscripción PRO</b>

👤 <b>Usuario:</b> ${userName || "N/A"}
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
async function notifyCancellation(
  userEmail,
  userName,
  periodEnd,
  reason = "user_action"
) {
  const reasonText =
    reason === "user_action" ? "Usuario canceló" : "Cancelación automática";

  const message = `
❌ <b>Suscripción Cancelada</b>

👤 <b>Usuario:</b> ${userName || "N/A"}
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

👤 <b>Usuario:</b> ${userName || "N/A"}
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
async function notifyRenewalSuccess(
  userEmail,
  userName,
  amount,
  nextBillingDate
) {
  const message = `
✅ <b>Renovación Exitosa</b>

👤 <b>Usuario:</b> ${userName || "N/A"}
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

👤 <b>Usuario:</b> ${userName || "N/A"}
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

// ============================================================================
// FEEDBACK NOTIFICATIONS
// ============================================================================

/**
 * Notify user feedback
 */
async function notifyFeedback(message, username, email) {
  const isAnonymous = !username && !email;

  const msg = `
💬 <b>Nuevo Feedback</b>

${isAnonymous ? "👤 <b>Usuario:</b> Anónimo" : `👤 <b>Usuario:</b> ${username || "N/A"}\n📧 <b>Email:</b> ${email || "N/A"}`}

📝 <b>Mensaje:</b>
${message}

🕐 ${formatDate(new Date())}
  `.trim();

  return sendMessage(msg);
}

// ============================================================================
// AUTH NOTIFICATIONS
// ============================================================================

/**
 * Notify user login
 */
async function notifyLogin(userEmail, userName, context) {
  const message = `
🔐 <b>Login</b>

👤 <b>Usuario:</b> ${userName || "N/A"}
📧 <b>Email:</b> ${userEmail}
👍 <b>Contexto:</b> ${context || "N/A"}
🕐 ${formatDate(new Date())}
  `.trim();

  return sendMessage(message);
}

/**
 * Notify user registration
 */
async function notifyRegistration(userEmail, userName) {
  const message = `
🎉 <b>Nuevo Registro</b>

👤 <b>Usuario:</b> ${userName}
📧 <b>Email:</b> ${userEmail}
🕐 ${formatDate(new Date())}

🔗 <a href="${config.frontend.url}/admin">Ver panel</a>
  `.trim();

  return sendMessage(message);
}

/**
 * Notify account deletion
 */
async function notifyAccountDeletion(userEmail, userName, role) {
  const message = `
🗑️ <b>Cuenta Eliminada</b>

👤 <b>Usuario:</b> ${userName || "N/A"}
📧 <b>Email:</b> ${userEmail}
👑 <b>Plan:</b> ${role}
🕐 ${formatDate(new Date())}
  `.trim();

  return sendMessage(message);
}

// ============================================================================
// WEBHOOK NOTIFICATIONS
// ============================================================================

/**
 * Notify webhook received
 */
async function notifyWebhookReceived(eventType, eventId) {
  const message = `
🔔 <b>Webhook Recibido</b>

📦 <b>Tipo:</b> <code>${eventType}</code>
🆔 <b>ID:</b> <code>${eventId}</code>
🕐 ${formatDate(new Date())}
  `.trim();

  return sendMessage(message);
}

/**
 * Notify webhook processed successfully
 */
async function notifyWebhookProcessed(eventType, eventId, duration) {
  const message = `
✅ <b>Webhook Procesado</b>

📦 <b>Tipo:</b> <code>${eventType}</code>
🆔 <b>ID:</b> <code>${eventId}</code>
⚡ <b>Duración:</b> ${duration}ms
🕐 ${formatDate(new Date())}
  `.trim();

  return sendMessage(message);
}

/**
 * Notify webhook failed
 */
async function notifyWebhookFailed(eventType, eventId, error, attempts) {
  const message = `
❌ <b>Webhook Fallido</b>

📦 <b>Tipo:</b> <code>${eventType}</code>
🆔 <b>ID:</b> <code>${eventId}</code>
🔄 <b>Intentos:</b> ${attempts}/3
⚠️ <b>Error:</b> ${error}
🕐 ${formatDate(new Date())}
  `.trim();

  return sendMessage(message);
}

// ============================================================================
// CRON JOB NOTIFICATIONS
// ============================================================================

/**
 * Notify cron job started
 */
async function notifyCronJobStarted(jobName) {
  const message = `
🔄 <b>Cron Job Iniciado</b>

📋 <b>Job:</b> ${jobName}
🕐 ${formatDate(new Date())}
  `.trim();

  return sendMessage(message);
}

/**
 * Notify cron job completed
 */
async function notifyCronJobCompleted(jobName, stats) {
  const statsText = Object.entries(stats)
    .map(([key, value]) => `  • ${key}: ${value}`)
    .join("\n");

  const message = `
✅ <b>Cron Job Completado</b>

📋 <b>Job:</b> ${jobName}
📊 <b>Resultados:</b>
${statsText}
🕐 ${formatDate(new Date())}
  `.trim();

  return sendMessage(message);
}

/**
 * Notify cron job failed
 */
async function notifyCronJobFailed(jobName, error) {
  const message = `
❌ <b>Cron Job Fallido</b>

📋 <b>Job:</b> ${jobName}
⚠️ <b>Error:</b> ${error}
🕐 ${formatDate(new Date())}

🔧 <b>Acción requerida:</b> Revisar logs del servidor
  `.trim();

  return sendMessage(message);
}

// ============================================================================
// ERROR NOTIFICATIONS
// ============================================================================

/**
 * Notify generic error
 */
async function notifyError(error, context = {}) {
  const contextText = Object.entries(context)
    .filter(([key]) => !["stack", "error"].includes(key))
    .map(
      ([key, value]) =>
        `  • ${key}: ${
          typeof value === "object" ? JSON.stringify(value) : value
        }`
    )
    .join("\n");

  const message = `
🚨 <b>Error Capturado</b>

⚠️ <b>Mensaje:</b> ${error.message || error}
📍 <b>Contexto:</b>
${contextText || "  Sin contexto adicional"}
🕐 ${formatDate(new Date())}

🔍 Revisar logs para más detalles
  `.trim();

  return sendMessage(message);
}

/**
 * Notify security event
 */
async function notifySecurityEvent(event, details) {
  const detailsText = Object.entries(details)
    .map(([key, value]) => `  • ${key}: ${value}`)
    .join("\n");

  const message = `
🔒 <b>Evento de Seguridad</b>

⚠️ <b>Evento:</b> ${event}
📋 <b>Detalles:</b>
${detailsText}
🕐 ${formatDate(new Date())}
  `.trim();

  return sendMessage(message);
}

/**
 * Notify dead letter event (failed after max retries)
 */
async function notifyDeadLetter(eventType, eventId, error) {
  const message = `
☠️ <b>Dead Letter - Requiere Intervención</b>

📦 <b>Tipo:</b> <code>${eventType}</code>
🆔 <b>ID:</b> <code>${eventId}</code>
⚠️ <b>Error:</b> ${error}
🔄 <b>Intentos:</b> 3/3 (máximo alcanzado)
🕐 ${formatDate(new Date())}

🔧 <b>Acción requerida:</b> Revisar evento en BD y reprocesar manualmente
  `.trim();

  return sendMessage(message);
}

module.exports = {
  initializeTelegram,

  // Feedback notifications
  notifyFeedback,

  // Subscription notifications
  notifyNewSubscription,
  notifyCancellation,
  notifyPaymentFailed,
  notifyRenewalSuccess,
  notifyPaymentRecovered,

  // Auth notifications
  notifyLogin,
  notifyRegistration,
  notifyAccountDeletion,

  // Webhook notifications
  notifyWebhookReceived,
  notifyWebhookProcessed,
  notifyWebhookFailed,

  // Cron job notifications
  notifyCronJobStarted,
  notifyCronJobCompleted,
  notifyCronJobFailed,

  // Error notifications
  notifyError,
  notifySecurityEvent,
  notifyDeadLetter,

  // Test
  sendTestNotification,
};
