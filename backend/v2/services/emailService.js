/**
 * Email Service — Resend
 *
 * Sends transactional emails for link rule notifications.
 * All user-supplied values (query params, custom messages) are HTML-escaped
 * before being embedded in the template.
 */

const { Resend } = require("resend");
const config = require("../config/environment");
const logger = require("../utils/logger");
const { escapeParamsForHtml, escapeParamForHtml } = require("../utils/queryParamsSanitizer");

// ============================================
// CLIENT
// ============================================

// Lazily initialised so the app starts even without RESEND_API_KEY in dev.
let _client = null;
const getClient = () => {
  if (!_client) {
    if (!config.resend.apiKey) {
      return null;
    }
    _client = new Resend(config.resend.apiKey);
  }
  return _client;
};

// ============================================
// IN-MEMORY THROTTLE
// ============================================

// Prevents email floods when a link receives high traffic.
// Key: ruleId (number), Value: timestamp of last email sent (ms).
// NOTE: This is per-process. For multi-instance deployments a Redis-backed
// throttle would be needed. Acceptable for single-instance.
const _lastSentAt = new Map();
const THROTTLE_MS = 5 * 60 * 1000; // 5 minutes per rule

const isThrottled = (ruleId) => {
  const last = _lastSentAt.get(ruleId);
  if (!last) return false;
  return Date.now() - last < THROTTLE_MS;
};

const markSent = (ruleId) => {
  _lastSentAt.set(ruleId, Date.now());
};

// ============================================
// EMAIL TEMPLATE
// ============================================

/**
 * Builds the HTML body for a rule notification email.
 * Every user-controlled value is HTML-escaped before insertion.
 *
 * @param {object} opts
 * @param {string}  opts.shortUrl
 * @param {string}  opts.longUrl
 * @param {string}  opts.country
 * @param {string}  opts.device
 * @param {string}  opts.ip       - Shown partially masked for privacy
 * @param {boolean} opts.isBot
 * @param {boolean} opts.isVPN
 * @param {number}  opts.accessCount
 * @param {object}  opts.queryParams  - Already sanitized plain-text params
 * @param {string}  [opts.message]    - Optional custom message from rule config
 * @param {string}  opts.frontendUrl
 */
const buildEmailHtml = ({
  shortUrl,
  longUrl,
  country,
  device,
  ip,
  isBot,
  isVPN,
  accessCount,
  queryParams,
  message,
  frontendUrl,
}) => {
  // HTML-escape every user-influenced value
  const safeShortUrl = esc(shortUrl);
  const safeLongUrl = esc(longUrl);
  const safeCountry = esc(country || "Unknown");
  const safeDevice = esc(device || "Unknown");
  // Mask last octet of IP for privacy (e.g. 1.2.3.4 → 1.2.3.xxx)
  const maskedIp = esc(maskIp(ip));
  const safeMessage = message ? esc(message) : null;
  const safeParams = escapeParamsForHtml(queryParams || {});
  const paramEntries = Object.entries(safeParams);
  const hasParams = paramEntries.length > 0;
  const timestamp = new Date().toUTCString();

  const queryParamsSection = hasParams
    ? `
      <tr>
        <td style="padding: 0 32px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;border-radius:8px;border:1px solid #e9ecef;">
            <tr>
              <td style="padding:16px 20px 8px;">
                <p style="margin:0 0 12px;font-size:12px;font-weight:600;color:#6c757d;text-transform:uppercase;letter-spacing:0.5px;">Query Parameters</p>
              </td>
            </tr>
            ${paramEntries.map(([k, v]) => `
            <tr>
              <td style="padding:4px 20px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:40%;padding:6px 0;font-size:13px;font-family:monospace;color:#495057;font-weight:600;">${k}</td>
                    <td style="padding:6px 0;font-size:13px;font-family:monospace;color:#212529;word-break:break-all;">${v}</td>
                  </tr>
                </table>
              </td>
            </tr>`).join("")}
            <tr><td style="height:8px;"></td></tr>
          </table>
        </td>
      </tr>`
    : "";

  const messageSection = safeMessage
    ? `
      <tr>
        <td style="padding: 0 32px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff3cd;border-radius:8px;border:1px solid #ffc107;border-left:4px solid #ffc107;">
            <tr>
              <td style="padding:14px 16px;">
                <p style="margin:0;font-size:13px;color:#856404;">${safeMessage}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Link accessed — Linkkk</title>
</head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <a href="${esc(frontendUrl)}" style="text-decoration:none;">
                <img src="${esc(frontendUrl)}/linkkk-logo-noBg.png" alt="linkkk" height="36" style="display:block;border:0;" />
              </a>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
              <table width="100%" cellpadding="0" cellspacing="0">

                <!-- Card header -->
                <tr>
                  <td style="padding:28px 32px 20px;">
                    <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#6c757d;text-transform:uppercase;letter-spacing:0.5px;">Link notification</p>
                    <h1 style="margin:0;font-size:20px;font-weight:700;color:#1a1a2e;">Someone accessed your link</h1>
                  </td>
                </tr>

                <!-- Divider -->
                <tr><td style="padding:0 32px;"><div style="height:1px;background:#e9ecef;"></div></td></tr>

                <!-- Link info -->
                <tr>
                  <td style="padding:20px 32px 24px;">
                    <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#6c757d;text-transform:uppercase;letter-spacing:0.5px;">Link</p>
                    <p style="margin:0 0 4px;font-size:15px;font-weight:600;color:#1a1a2e;font-family:monospace;">/${safeShortUrl}</p>
                    <p style="margin:0;font-size:13px;color:#6c757d;word-break:break-all;">${safeLongUrl}</p>
                  </td>
                </tr>

                <!-- Access details -->
                <tr>
                  <td style="padding: 0 32px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;border-radius:8px;">
                      <tr>
                        <td style="padding:16px 20px 8px;">
                          <p style="margin:0 0 12px;font-size:12px;font-weight:600;color:#6c757d;text-transform:uppercase;letter-spacing:0.5px;">Access details</p>
                        </td>
                      </tr>
                      ${detailRow("Country", safeCountry)}
                      ${detailRow("Device", safeDevice)}
                      ${detailRow("IP", maskedIp)}
                      ${detailRow("Bot", isBot ? "Yes" : "No")}
                      ${detailRow("VPN", isVPN ? "Yes" : "No")}
                      ${detailRow("Total accesses", String(accessCount))}
                      ${detailRow("Time", timestamp)}
                      <tr><td style="height:8px;"></td></tr>
                    </table>
                  </td>
                </tr>

                <!-- Query params (conditional) -->
                ${queryParamsSection}

                <!-- Custom message (conditional) -->
                ${messageSection}

                <!-- Footer link -->
                <tr>
                  <td style="padding:0 32px 28px;" align="center">
                    <a href="${esc(frontendUrl)}/dashboard" style="display:inline-block;padding:10px 24px;background:#1a1a2e;color:#ffffff;text-decoration:none;border-radius:6px;font-size:13px;font-weight:600;">Manage your links</a>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:20px;">
              <p style="margin:0;font-size:12px;color:#adb5bd;">You're receiving this because a rule on one of your links triggered an email notification.<br>To stop, disable or delete the rule in your dashboard.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

// ============================================
// HELPERS
// ============================================

const esc = (str) => {
  if (typeof str !== "string") return String(str ?? "");
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
};

const maskIp = (ip) => {
  if (!ip) return "Unknown";
  // IPv4: mask last octet
  const v4 = ip.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3})\.\d{1,3}$/);
  if (v4) return `${v4[1]}.xxx`;
  // IPv6: mask last 4 groups
  if (ip.includes(":")) return ip.split(":").slice(0, 4).join(":") + ":xxxx:xxxx:xxxx:xxxx";
  return ip;
};

const detailRow = (label, value) => `
  <tr>
    <td style="padding:4px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width:40%;padding:5px 0;font-size:13px;color:#6c757d;">${esc(label)}</td>
          <td style="padding:5px 0;font-size:13px;color:#212529;font-weight:500;">${esc(value)}</td>
        </tr>
      </table>
    </td>
  </tr>`;

// ============================================
// PUBLIC API
// ============================================

/**
 * Sends a rule notification email to the link owner.
 *
 * @param {object} opts
 * @param {number}  opts.ruleId       - For throttle tracking
 * @param {string}  opts.toEmail      - Verified owner email
 * @param {string}  opts.shortUrl
 * @param {string}  opts.longUrl
 * @param {string}  opts.country
 * @param {string}  opts.device
 * @param {string}  opts.ip
 * @param {boolean} opts.isBot
 * @param {boolean} opts.isVPN
 * @param {number}  opts.accessCount
 * @param {object}  [opts.queryParams] - Sanitized plain-text params
 * @param {string}  [opts.message]     - Optional custom rule message
 * @returns {Promise<boolean>} true if sent, false if throttled/skipped
 */
const sendRuleNotificationEmail = async (opts) => {
  const client = getClient();
  if (!client) {
    logger.warn("[EMAIL] Resend client not initialised — RESEND_API_KEY missing");
    return false;
  }

  if (isThrottled(opts.ruleId)) {
    logger.debug("[EMAIL] Throttled — skipping notification email", {
      ruleId: opts.ruleId,
    });
    return false;
  }

  const html = buildEmailHtml({
    shortUrl: opts.shortUrl,
    longUrl: opts.longUrl,
    country: opts.country,
    device: opts.device,
    ip: opts.ip,
    isBot: opts.isBot,
    isVPN: opts.isVPN,
    accessCount: opts.accessCount,
    queryParams: opts.queryParams,
    message: opts.message,
    frontendUrl: config.frontend.url,
  });

  try {
    const { error } = await client.emails.send({
      from: config.resend.fromEmail,
      to: opts.toEmail,
      subject: `Link /${opts.shortUrl} was accessed`,
      html,
    });

    if (error) {
      logger.warn("[EMAIL] Resend returned error", {
        ruleId: opts.ruleId,
        error: error.message,
      });
      return false;
    }

    markSent(opts.ruleId);
    logger.info("[EMAIL] Rule notification sent", { ruleId: opts.ruleId });
    return true;
  } catch (err) {
    logger.warn("[EMAIL] Failed to send rule notification email", {
      ruleId: opts.ruleId,
      error: err.message,
    });
    return false;
  }
};

module.exports = { sendRuleNotificationEmail };
