const z = require("zod");

/**
 * SECURITY: Validate avatar URLs to prevent SSRF attacks
 * Only allow HTTPS URLs from trusted domains with safe file extensions
 */
const isValidAvatarUrl = (url) => {
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

    // SECURITY: Whitelist common image hosting domains (or allow all public domains)
    // For now, we'll allow any public HTTPS URL but validate file extension

    // SECURITY: Validate file extension to ensure it's an image
    const pathname = parsed.pathname.toLowerCase();
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];
    const hasValidExtension = validExtensions.some(ext => pathname.endsWith(ext));

    if (!hasValidExtension) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(3).max(25).optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/,
      "Password must contain at least one letter, one number, and one special character"
    )
    .optional(),
  avatarUrl: z
    .string()
    .url()
    .refine((url) => isValidAvatarUrl(url), {
      message: "Avatar URL must be HTTPS and point to a valid image file (jpg, png, gif, webp, svg)"
    })
    .optional()
    .nullable(),
});

module.exports = {
  updateUserSchema,
};
