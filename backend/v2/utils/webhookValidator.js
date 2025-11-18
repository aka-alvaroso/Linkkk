/**
 * Webhook URL Validator
 * Protects against SSRF (Server-Side Request Forgery) attacks
 */

/**
 * Validates webhook URLs to prevent SSRF attacks
 * @param {string} url - The webhook URL to validate
 * @returns {boolean} - True if URL is safe, false otherwise
 */
const isValidWebhookUrl = (url) => {
  try {
    const parsed = new URL(url);
    const protocol = parsed.protocol.toLowerCase();
    const hostname = parsed.hostname.toLowerCase();

    // Only allow HTTPS (enforce encryption for webhooks)
    if (protocol !== 'https:') {
      console.warn('[SECURITY] Webhook URL must use HTTPS:', url);
      return false;
    }

    // Block all private/internal IPs and local addresses
    const blockedPatterns = [
      // Localhost
      /^localhost$/i,
      /^127\./,                    // 127.0.0.0/8
      /^0\.0\.0\.0$/,

      // Private IPv4 ranges
      /^10\./,                     // 10.0.0.0/8
      /^172\.(1[6-9]|2[0-9]|3[01])\./, // 172.16.0.0/12
      /^192\.168\./,               // 192.168.0.0/16

      // Link-local
      /^169\.254\./,               // 169.254.0.0/16 (AWS metadata)

      // IPv6 localhost and private
      /^::1$/,                     // IPv6 localhost
      /^fc00:/,                    // IPv6 unique local
      /^fe80:/,                    // IPv6 link-local
      /^::ffff:127\./,             // IPv4-mapped IPv6 localhost
      /^::ffff:10\./,              // IPv4-mapped IPv6 private
      /^::ffff:172\.(1[6-9]|2[0-9]|3[01])\./, // IPv4-mapped IPv6 private
      /^::ffff:192\.168\./,        // IPv4-mapped IPv6 private

      // Special domains
      /\.local$/i,
      /\.localhost$/i,
      /\.internal$/i,
      /\.corp$/i,
      /\.home$/i,
      /\.lan$/i,

      // Prevent DNS rebinding
      /^(127|0|10|172|192|169)\./,
    ];

    if (blockedPatterns.some(pattern => pattern.test(hostname))) {
      console.warn('[SECURITY] Blocked private/internal IP in webhook URL:', url);
      return false;
    }

    // Additional security: Validate hostname is not an IP (prefer domains)
    // This is optional but adds another layer
    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4Pattern.test(hostname)) {
      // If it's an IP, make sure it's not in private ranges (already checked above)
      // But we can add an extra check here if needed
      const parts = hostname.split('.').map(Number);

      // Block if any part is invalid
      if (parts.some(part => part > 255)) {
        return false;
      }

      // Additional check: Block cloud metadata IPs
      if (hostname === '169.254.169.254') { // AWS
        console.warn('[SECURITY] Blocked AWS metadata IP:', url);
        return false;
      }
      if (hostname === '169.254.169.253') { // AWS ECS
        console.warn('[SECURITY] Blocked AWS ECS metadata IP:', url);
        return false;
      }
      if (hostname === '169.254.169.123') { // Azure IMDS
        console.warn('[SECURITY] Blocked Azure metadata IP:', url);
        return false;
      }
      if (hostname === '169.254.169.254:80') { // GCP
        console.warn('[SECURITY] Blocked GCP metadata IP:', url);
        return false;
      }
    }

    // Validate port (block common internal service ports)
    const blockedPorts = [
      22,    // SSH
      23,    // Telnet
      25,    // SMTP
      3306,  // MySQL
      5432,  // PostgreSQL
      6379,  // Redis
      27017, // MongoDB
      9200,  // Elasticsearch
      8080,  // Common dev server
      3000,  // Common dev server
      5000,  // Common dev server
    ];

    if (parsed.port && blockedPorts.includes(parseInt(parsed.port))) {
      console.warn('[SECURITY] Blocked webhook to suspicious port:', parsed.port);
      return false;
    }

    return true;
  } catch (error) {
    // Invalid URL format
    console.warn('[SECURITY] Invalid webhook URL format:', url);
    return false;
  }
};

module.exports = {
  isValidWebhookUrl,
};
