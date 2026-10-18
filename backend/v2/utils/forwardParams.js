/**
 * Forwarding of the visitor's query params to the destination URL.
 *
 * Opt-in per link (Link.forwardParams). Callers pass the output of
 * sanitizeQueryParams, so reserved/unsafe keys never reach this point.
 */

/**
 * Appends params to a URL without touching what it already carries: a param
 * the destination already defines wins, the existing query string and hash are
 * left byte-for-byte as they were, and an unparseable URL is returned as-is.
 *
 * @param {string} url
 * @param {object} params - Sanitized key→string map
 * @returns {string}
 */
const appendParams = (url, params) => {
  if (!url || !params) return url;

  let existing;
  try {
    existing = new URL(url).searchParams;
  } catch {
    return url;
  }

  const extra = Object.entries(params)
    .filter(([key]) => !existing.has(key))
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  if (extra.length === 0) return url;

  const hashIndex = url.indexOf("#");
  const base = hashIndex >= 0 ? url.slice(0, hashIndex) : url;
  const hash = hashIndex >= 0 ? url.slice(hashIndex) : "";
  const separator = !base.includes("?") ? "?" : base.endsWith("?") || base.endsWith("&") ? "" : "&";

  return `${base}${separator}${extra.join("&")}${hash}`;
};

/**
 * Forwards params only when the link has the option enabled.
 */
const forwardedUrl = (link, url, params) =>
  link.forwardParams ? appendParams(url, params) : url;

module.exports = { appendParams, forwardedUrl };
