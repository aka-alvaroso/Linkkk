const NodeCache = require("node-cache");

// Cache for IP geolocation data (1 hour TTL)
// This prevents excessive API calls and improves performance
const ipCache = new NodeCache({ stdTTL: 3600 });

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
    console.error(`Geolocation API error: ${error.message}`);
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
      data.risk.is_proxy ||
      data.risk.is_datacenter;

    // Cache the result
    ipCache.set(cacheKey, isVpn);

    return isVpn;
  } catch (error) {
    console.error(`VPN detection API error: ${error.message}`);
    // Cache false to avoid repeated failures
    ipCache.set(cacheKey, false, 300); // 5 min cache for errors
    return false;
  }
};

module.exports = {
  defineCountry,
  defineIsVPN,
};
