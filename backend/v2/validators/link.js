const z = require("zod");

// Simplified schema for beta - only essential fields
const createLinkSchema = z.object({
  longUrl: z
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
    }),
  status: z.boolean().default(true),
});

const updateLinkSchema = z.object({
  longUrl: z
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
    .optional(),
  status: z.boolean().optional(),
});

module.exports = {
  createLinkSchema,
  updateLinkSchema,
};
