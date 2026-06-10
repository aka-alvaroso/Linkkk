/**
 * Query Parameters Sanitizer
 *
 * Safely extracts and sanitizes URL query parameters before including them
 * in rule evaluation context and outbound notification payloads (webhooks, emails).
 *
 * Security goals:
 *  - Prevent template injection into redirect URL templates ({{...}})
 *  - Prevent log injection via control characters / null bytes
 *  - Prevent DoS via oversized or excessive parameters
 *  - Reject ambiguous Express array/object parsing (e.g. ?a[]=1)
 *  - Keep values as plain text; callers must escape for their output context
 *    (e.g. HTML-escape before rendering in an email template)
 */

// ============================================
// LIMITS
// ============================================

const MAX_PARAMS = 10;
const MAX_KEY_LENGTH = 50;
const MAX_VALUE_LENGTH = 500;
const MAX_TOTAL_CHARS = 2000; // combined keys + values

// ============================================
// PATTERNS
// ============================================

// Only allow keys composed of letters, digits, underscore, and hyphen.
// This blocks prototype-pollution keys (__proto__, constructor, etc.),
// bracket notation (?a[b]=1), dot notation (?a.b=1), and other surprises.
const SAFE_KEY_RE = /^[a-zA-Z0-9_-]+$/;

// Keys reserved by the platform — never forwarded to callers.
const RESERVED_KEYS = new Set(["src"]);

// Keys that could shadow prototype properties (defense-in-depth).
const PROTOTYPE_KEYS = new Set([
  "__proto__",
  "constructor",
  "prototype",
  "hasOwnProperty",
  "toString",
  "valueOf",
  "toLocaleString",
  "isPrototypeOf",
]);

// Control characters including null byte (\x00), tab (\x09 allowed below), CR/LF.
// We strip everything in C0/C1 control ranges and DEL.
const CONTROL_CHARS_RE = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f\x80-\x9f]/g;

// Template injection: reject values that contain {{ or }} to prevent
// interpolation if a value ever reaches a template engine or replaceVariables().
const TEMPLATE_INJECT_RE = /\{\{|\}\}/;

// Null byte specifically (defence-in-depth, belt-and-suspenders).
const NULL_BYTE_RE = /\0/g;

// ============================================
// MAIN FUNCTION
// ============================================

/**
 * Sanitizes raw query parameters from an Express req.query object.
 *
 * @param {object} rawQuery - The req.query object from Express
 * @returns {{ params: object, droppedCount: number }}
 *   params        - Safe key→string map ready for use in context / payloads
 *   droppedCount  - Number of params silently dropped (for logging/debugging)
 */
const sanitizeQueryParams = (rawQuery) => {
  if (!rawQuery || typeof rawQuery !== "object" || Array.isArray(rawQuery)) {
    return { params: {}, droppedCount: 0 };
  }

  const params = Object.create(null); // No prototype chain on the result object
  let accepted = 0;
  let dropped = 0;
  let totalChars = 0;

  for (const [rawKey, rawValue] of Object.entries(rawQuery)) {
    // ---- Key validation ----

    if (typeof rawKey !== "string") {
      dropped++;
      continue;
    }

    // Skip reserved platform keys silently (not a security event)
    if (RESERVED_KEYS.has(rawKey)) {
      continue;
    }

    // Prototype pollution guard
    if (PROTOTYPE_KEYS.has(rawKey)) {
      dropped++;
      continue;
    }

    // Key format: only [a-zA-Z0-9_-]
    if (!SAFE_KEY_RE.test(rawKey)) {
      dropped++;
      continue;
    }

    // Key length
    if (rawKey.length === 0 || rawKey.length > MAX_KEY_LENGTH) {
      dropped++;
      continue;
    }

    // ---- Value validation ----

    // Express may parse ?a[]=1&a[]=2 as { a: ['1','2'] } or
    // ?a[b]=1 as { a: { b: '1' } }.  Reject anything that isn't a plain string.
    if (typeof rawValue !== "string") {
      dropped++;
      continue;
    }

    // Value length (before sanitization — avoids processing huge strings)
    if (rawValue.length > MAX_VALUE_LENGTH) {
      dropped++;
      continue;
    }

    // ---- Value sanitization ----

    let value = rawValue;

    // Remove null bytes first (defence-in-depth before regex-based strip)
    value = value.replace(NULL_BYTE_RE, "");

    // Strip C0/C1 control characters and DEL; preserve \x09 (tab) and \x0a/\x0d
    // (newline/CR) only if still within a printable context — actually strip those
    // too to prevent log injection.
    value = value.replace(CONTROL_CHARS_RE, "");
    // Also strip CR and LF explicitly to prevent log-injection / header-injection.
    value = value.replace(/[\r\n]/g, "");

    // Trim surrounding whitespace
    value = value.trim();

    // Reject empty values after sanitization
    if (value.length === 0) {
      dropped++;
      continue;
    }

    // Block template injection patterns
    if (TEMPLATE_INJECT_RE.test(value)) {
      dropped++;
      continue;
    }

    // ---- Global limits ----

    if (accepted >= MAX_PARAMS) {
      dropped++;
      continue;
    }

    totalChars += rawKey.length + value.length;
    if (totalChars > MAX_TOTAL_CHARS) {
      dropped++;
      continue;
    }

    params[rawKey] = value;
    accepted++;
  }

  return { params, droppedCount: dropped };
};

// ============================================
// HTML ESCAPE HELPER (for callers rendering params into HTML, e.g. email templates)
// ============================================

/**
 * HTML-escapes a single query param value for safe embedding in HTML.
 * Must be called by callers that render params in an HTML context (email templates, etc.).
 * Do NOT apply this before storing in JSON payloads — that would double-encode.
 *
 * @param {string} value - A sanitized param value from sanitizeQueryParams
 * @returns {string} - HTML-safe string
 */
const escapeParamForHtml = (value) => {
  if (typeof value !== "string") return "";
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
};

/**
 * HTML-escapes all values in a params object.
 * Convenience wrapper around escapeParamForHtml for use in email templates.
 *
 * @param {object} params - Output of sanitizeQueryParams().params
 * @returns {object} - New object with all values HTML-escaped
 */
const escapeParamsForHtml = (params) => {
  if (!params || typeof params !== "object") return {};
  const result = Object.create(null);
  for (const [key, value] of Object.entries(params)) {
    result[key] = escapeParamForHtml(value);
  }
  return result;
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
  sanitizeQueryParams,
  escapeParamForHtml,
  escapeParamsForHtml,
};
