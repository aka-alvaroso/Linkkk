/**
 * Google Safe Browsing Lookup API v4 client.
 *
 * Used to refuse link destinations Google already knows are phishing or
 * malware, and to stop redirecting to a destination that became flagged after
 * the link was created.
 *
 * Fail-open by design: with no GOOGLE_SAFE_BROWSING_KEY, on timeout, or on any
 * API error the URL is treated as clean. Link creation and redirects must
 * never break because Google is slow or down.
 *
 * Results are cached per URL (clean results shorter than flagged ones) so a
 * busy link costs at most one lookup per TTL, and redirects normally answer
 * from memory.
 */

const NodeCache = require("node-cache");
const logger = require("../utils/logger");

const API_URL = "https://safebrowsing.googleapis.com/v4/threatMatches:find";

const THREAT_TYPES = [
  "MALWARE",
  "SOCIAL_ENGINEERING",
  "UNWANTED_SOFTWARE",
  "POTENTIALLY_HARMFUL_APPLICATION",
];

const intFromEnv = (name, fallback) => {
  const value = parseInt(process.env[name], 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
};

const CLEAN_TTL_SECONDS = 30 * 60;
const FLAGGED_TTL_SECONDS = 6 * 60 * 60;

const cache = new NodeCache({ maxKeys: 20000, useClones: false, checkperiod: 600 });

const isEnabled = () => !!process.env.GOOGLE_SAFE_BROWSING_KEY;

const CLEAN = Object.freeze({ flagged: false, threats: [] });

const cacheResult = (url, result) => {
  try {
    cache.set(url, result, result.flagged ? FLAGGED_TTL_SECONDS : CLEAN_TTL_SECONDS);
  } catch {
    // maxKeys reached: just don't cache
  }
};

/**
 * Looks a URL up in Safe Browsing.
 *
 * @param {string} url
 * @param {{ timeoutMs?: number }} [options]
 * @returns {Promise<{ flagged: boolean, threats: string[], skipped?: string, cached?: boolean }>}
 */
const checkUrl = async (url, { timeoutMs } = {}) => {
  if (!isEnabled()) return { ...CLEAN, skipped: "not_configured" };
  if (typeof url !== "string" || !url) return { ...CLEAN, skipped: "invalid_url" };

  const cached = cache.get(url);
  if (cached) return { ...cached, cached: true };

  const timeout = timeoutMs ?? intFromEnv("SAFE_BROWSING_TIMEOUT_MS", 2000);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(
      `${API_URL}?key=${encodeURIComponent(process.env.GOOGLE_SAFE_BROWSING_KEY)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          client: { clientId: "linkkk", clientVersion: "2.0.0" },
          threatInfo: {
            threatTypes: THREAT_TYPES,
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url }],
          },
        }),
      }
    );

    if (!response.ok) {
      logger.warn("[SafeBrowsing] API error, failing open", { status: response.status });
      return { ...CLEAN, skipped: "api_error" };
    }

    const data = await response.json();
    const matches = Array.isArray(data?.matches) ? data.matches : [];
    const threats = [...new Set(matches.map((m) => m.threatType).filter(Boolean))];
    const result = { flagged: threats.length > 0, threats };

    cacheResult(url, result);
    return result;
  } catch (error) {
    const reason = error.name === "AbortError" ? "timeout" : "network_error";
    logger.warn("[SafeBrowsing] Lookup failed, failing open", { reason, error: error.message });
    return { ...CLEAN, skipped: reason };
  } finally {
    clearTimeout(timer);
  }
};

const _resetCache = () => cache.flushAll();

module.exports = {
  checkUrl,
  isEnabled,
  THREAT_TYPES,
  _resetCache,
};
