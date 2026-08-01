const NodeCache = require("node-cache");
const config = require("../config/environment");
const proxyaddr = require("proxy-addr");

const isTrustedProxy = proxyaddr.compile(config.security.trustedProxies);


// Cache for IP geolocation data (1 hour TTL)
// This prevents excessive API calls and improves performance
// SECURITY: maxKeys prevents DoS attacks via cache flooding (VUL-004 fix)
const ipCache = new NodeCache({
  stdTTL: 3600,      // 1 hour time-to-live
  maxKeys: 10000,    // Maximum 10,000 IPs cached (prevents memory exhaustion)
  checkperiod: 600,  // Check for expired keys every 10 minutes
});

const defineCountry = async (ip) => {
  // Check cache first
  const cacheKey = `country:${ip}`;
  const cached = ipCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000); // 2s timeout

    const r = await fetch(`https://api.ipquery.io/${ip}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!r.ok) throw new Error(`API returned ${r.status}`);

    const data = await r.json();
    const country = data.location?.country_code || "UNKNOWN";

    // Cache the result
    ipCache.set(cacheKey, country);

    return country;
  } catch (error) {
    // SECURITY: Use proper logger instead of console.error (VUL-008 fix)
    const { sanitizeIp } = require('./logSanitizer');
    const logger = require('./logger');
    logger.error('Geolocation API error', {
      ip: sanitizeIp(ip),
      error: error.message,
      api: 'ipquery.io',
    });
    // Cache the UNKNOWN result to avoid repeated failures
    ipCache.set(cacheKey, "UNKNOWN", 300); // 5 min cache for errors
    return "UNKNOWN";
  }
};

const defineIsVPN = async (ip) => {
  // Check cache first
  const cacheKey = `vpn:${ip}`;
  const cached = ipCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000); // 2s timeout

    const r = await fetch(`https://api.ipquery.io/${ip}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!r.ok) throw new Error(`API returned ${r.status}`);

    const data = await r.json();
    const isVpn =
      data.risk.is_vpn ||
      data.risk.is_tor ||
      data.risk.is_proxy;

    // Cache the result
    ipCache.set(cacheKey, isVpn);

    return isVpn;
  } catch (error) {
    // SECURITY: Use proper logger instead of console.error (VUL-008 fix)
    const { sanitizeIp } = require('./logSanitizer');
    const logger = require('./logger');
    logger.error('VPN detection API error', {
      ip: sanitizeIp(ip),
      error: error.message,
      api: 'ipquery.io',
    });
    // Cache false to avoid repeated failures
    ipCache.set(cacheKey, false, 300); // 5 min cache for errors
    return false;
  }
};

// Devuelve la IP real del cliente.
// - Si la conexión viene de un proxy de confianza (Cloudflare), nos fiamos de
//   CF-Connecting-IP, que Cloudflare fija y que un cliente no puede falsificar
//   porque su tráfico pasa por Cloudflare.
// - Si viene directa al origen (no es Cloudflare), ignoramos las cabeceras
//   (falsificables) y usamos req.ip, que es la IP real de quien conectó.
const getClientIp = (req) => {
  const normalize = (ip) => {
    if (!ip) return "";
    if (ip === "::1" || ip === "::ffff:127.0.0.1") return "127.0.0.1";
    return ip.startsWith("::ffff:") ? ip.slice(7) : ip;
  };

  // req.ip lo calcula Express validando la cadena de proxies de confianza.
  // Si cae en rangos de Cloudflare, la conexión vino por Cloudflare y podemos
  // fiarnos de CF-Connecting-IP. Si no, es tráfico directo: usamos req.ip crudo.
  if (isTrustedProxy(req.ip)) {
    const cfIp = req.headers["cf-connecting-ip"];
    if (cfIp) return normalize(cfIp.trim());
  }

  return normalize(req.ip);
};

module.exports = {
  defineCountry,
  defineIsVPN,
  getClientIp,
};
