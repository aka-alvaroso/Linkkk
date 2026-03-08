const z = require("zod");

// Auto-prepend https:// if no protocol is provided
const normalizeUrl = (val) => {
  if (typeof val === "string" && val.length > 0 && !/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(val)) {
    return `https://${val}`;
  }
  return val;
};

const longUrlSchema = z.preprocess(
  normalizeUrl,
  z
    .string()
    .url()
    .max(2048, "URL too long")
    .refine((url) => url.startsWith("http://") || url.startsWith("https://"), {
      message: "URL must start with 'http://' or 'https://'",
    })
    .refine((url) => !url.toLowerCase().startsWith("javascript:"), {
      message: "JavaScript URLs are not allowed",
    })
    .refine((url) => !url.toLowerCase().startsWith("data:"), {
      message: "Data URLs are not allowed",
    })
);

const customSuffixSchema = z
  .string()
  .min(3, "Suffix must be at least 3 characters")
  .max(30, "Suffix must be at most 30 characters")
  .regex(/^[a-zA-Z0-9_-]+$/, "Suffix can only contain letters, numbers, hyphens and underscores");

// Simplified schema for beta - only essential fields
const createLinkSchema = z.object({
  longUrl: longUrlSchema,
  status: z.boolean().default(true),
  customSuffix: customSuffixSchema.optional(),
});

const updateLinkSchema = z.object({
  longUrl: longUrlSchema.optional(),
  status: z.boolean().optional(),
  newShortUrl: customSuffixSchema.optional(),
});

module.exports = {
  createLinkSchema,
  updateLinkSchema,
};
