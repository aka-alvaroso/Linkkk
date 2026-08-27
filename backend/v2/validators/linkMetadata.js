const z = require("zod");
const { isValidLogoUrl } = require("./qr");

// Treat cleared/empty text inputs as "unset" rather than failing validation
const emptyToNull = (val) => (val === "" ? null : val);

const linkMetadataSchema = z.object({
  ogTitle: z.preprocess(
    emptyToNull,
    z.string().trim().max(300, "Title must be at most 300 characters").optional().nullable()
  ),
  ogDescription: z.preprocess(
    emptyToNull,
    z.string().trim().max(500, "Description must be at most 500 characters").optional().nullable()
  ),
  ogImageUrl: z.preprocess(
    emptyToNull,
    z
      .string()
      .url("Invalid URL format")
      .max(500, "Image URL too long")
      .refine((url) => url.startsWith("https://"), {
        message: "Image URL must use HTTPS",
      })
      .refine((url) => isValidLogoUrl(url), {
        message: "Image URL must be a valid HTTPS URL and cannot point to private/internal addresses",
      })
      .optional()
      .nullable()
  ),
  enabled: z.boolean().optional(),
});

module.exports = {
  linkMetadataSchema,
};
