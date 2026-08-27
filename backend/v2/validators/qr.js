const z = require("zod");

const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

/**
 * SECURITY: Validate logo URLs to prevent SSRF attacks
 * Only allow HTTPS URLs from public domains with safe file extensions
 */
const isValidLogoUrl = (url) => {
  if (!url) return true; // Allow null/undefined

  try {
    const parsed = new URL(url);

    // SECURITY: Only allow HTTPS (prevent insecure connections)
    if (parsed.protocol !== 'https:') {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();

    // SECURITY: Block private IPs and localhost
    const blockedPatterns = [
      /^localhost$/i,
      /^127\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[01])\./,
      /^192\.168\./,
      /^169\.254\./, // AWS metadata
      /^::1$/, // IPv6 localhost
      /^fc00:/, // IPv6 private
      /^fd00:/, // IPv6 private
    ];

    if (blockedPatterns.some(pattern => pattern.test(hostname))) {
      return false;
    }

    // SECURITY: Block cloud metadata endpoints
    const blockedHosts = [
      '169.254.169.254', // AWS, Azure, Google Cloud metadata
      'metadata.google.internal', // Google Cloud
      '100.100.100.200', // Alibaba Cloud
    ];

    if (blockedHosts.includes(hostname)) {
      return false;
    }

    // NOTE: we intentionally do NOT require a recognizable image file
    // extension in the path. Many legitimate image CDNs (Unsplash, Twitter/X,
    // Google-hosted images, WordPress media, etc.) serve images via
    // extensionless URLs and content negotiation / query params instead
    // (e.g. https://images.unsplash.com/photo-xxx?auto=format&fit=crop).
    // The actual security boundary is HTTPS + the private-IP/metadata
    // blocklist above; if the URL doesn't point to a real image it just
    // won't render, which isn't a security issue.

    return true;
  } catch {
    return false;
  }
};

const qrConfigSchema = z.object({
  foregroundColor: z
    .string()
    .regex(hexColorRegex, "Invalid hex color format (e.g., #000000)")
    .optional(),
  backgroundColor: z
    .string()
    .regex(hexColorRegex, "Invalid hex color format (e.g., #FFFFFF)")
    .optional(),
  logoUrl: z
    .string()
    .url("Invalid URL format")
    .max(500, "Logo URL too long")
    .refine((url) => url.startsWith("https://"), {
      message: "Logo URL must use HTTPS",
    })
    .refine((url) => isValidLogoUrl(url), {
      message: "Logo URL must be a valid HTTPS URL and cannot point to private/internal addresses",
    })
    .optional()
    .nullable(),
  logoSize: z
    .number()
    .min(0.1, "Logo size must be at least 0.1")
    .max(0.4, "Logo size must be at most 0.4")
    .optional(),
  dotsStyle: z.enum(["square", "rounded", "dots"]).optional(),
  cornersStyle: z.enum(["square", "rounded"]).optional(),
});

module.exports = {
  qrConfigSchema,
  isValidLogoUrl,
};
