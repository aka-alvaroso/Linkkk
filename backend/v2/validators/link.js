const z = require("zod");

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
  status: z.boolean().optional(),
  password: z.string().optional(),
  accessLimit: z
    .number()
    .optional()
    .refine((limit) => limit === undefined || limit >= 0, {
      message: "Access limit must be a positive number",
    }),
  blockedCountries: z
    .array(z.string())
    .optional()
    .refine(
      (countries) => !countries || countries.every((code) => code.length === 2),
      {
        message:
          "Blocked countries must be an array of two letter country codes",
      }
    ),
  mobileUrl: z
    .string()
    .url()
    .max(2048, "Mobile URL too long")
    .refine(
      (url) => !url || url.startsWith("http://") || url.startsWith("https://"),
      {
        message: "Mobile URL must start with 'http://' or 'https://'",
      }
    )
    .refine((url) => !url || !url.toLowerCase().startsWith("javascript:"), {
      message: "JavaScript URLs are not allowed",
    })
    .refine((url) => !url || !url.toLowerCase().startsWith("data:"), {
      message: "Data URLs are not allowed",
    })
    .optional(),
  desktopUrl: z
    .string()
    .url()
    .max(2048, "Desktop URL too long")
    .refine(
      (url) => !url || url.startsWith("http://") || url.startsWith("https://"),
      {
        message: "Desktop URL must start with 'http://' or 'https://'",
      }
    )
    .refine((url) => !url || !url.toLowerCase().startsWith("javascript:"), {
      message: "JavaScript URLs are not allowed",
    })
    .refine((url) => !url || !url.toLowerCase().startsWith("data:"), {
      message: "Data URLs are not allowed",
    })
    .optional(),
  sufix: z
    .string()
    .optional()
    .refine((sufix) => !sufix || /^[a-zA-Z0-9-_]+$/.test(sufix), {
      message:
        "Custom URL can only contain letters, numbers, hyphens and underscores",
    })
    .refine((sufix) => !sufix || (sufix.length >= 3 && sufix.length <= 25), {
      message: "Custom URL must be between 3 and 25 characters long",
    }),
  expirationDate: z
    .date()
    .optional()
    .refine((date) => date === undefined || date > new Date(), {
      message: "Expiration date must be a valid future date",
    }),
  metadataTitle: z.string().max(200, "Title too long").optional(),
  metadataDescription: z.string().max(500, "Description too long").optional(),
  metadataImage: z
    .string()
    .url()
    .max(2048, "Metadata image URL too long")
    .optional()
    .refine(
      (url) => !url || url.startsWith("http://") || url.startsWith("https://"),
      {
        message: "Metadata image must be a valid HTTP/HTTPS URL",
      }
    )
    .refine((url) => !url || !url.toLowerCase().includes("javascript:"), {
      message: "JavaScript URLs are not allowed",
    })
    .refine((url) => !url || !url.toLowerCase().includes("data:"), {
      message: "Data URLs are not allowed",
    }),
});

const updateLinkSchema = createLinkSchema.omit({
  longUrl: true,
});

module.exports = {
  createLinkSchema,
  updateLinkSchema,
};
