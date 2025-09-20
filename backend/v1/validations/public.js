const z = require("zod");

const createLinkSchema = z.object({
  apiKey: z.string().min(1, "apiKey requerido"),
  longUrl: z.string().url("URL no válida"),
});

const deleteLinkSchema = z.object({
  apiKey: z.string().min(1, "apiKey requerido"),
  shortUrl: z.string().min(1, "shortUrl requerido"),
});

module.exports = {
  createLinkSchema,
  deleteLinkSchema,
};
