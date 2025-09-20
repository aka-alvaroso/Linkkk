const z = require("zod");

const createLinkSchema = z.object({
  longUrl: z.string().url("URL no válida"),
  groupId: z.number().optional(),
  tags: z.array(z.number()).optional(),
  d_expire: z.string().optional(),
  password: z.string().optional(),
  accessLimit: z.number().optional(),
  blockedCountries: z.array(z.number()).optional(),
  mobileUrl: z.string().url().optional(),
  desktopUrl: z.string().url().optional(),
  sufix: z.string().optional(),
  metadataTitle: z.string().optional(),
  metadataDescription: z.string().optional(),
  metadataImage: z.string().optional(),
  useMetadata: z.boolean().optional(),
});

const shortCodeParamSchema = z.object({
  shortCode: z.string().min(1, "shortCode requerido"),
});

const postLinkPassword = z.object({
  shortCode: z.string().min(1, "shortCode requerido"),
  password: z.string().min(1, "password requerido"),
  userData: z.string(),
});

const updateLinkSchema = z.object({
  id: z.string().min(1, "ID requerido"), // desde req.params
  longUrl: z.string().url().optional(),
  status: z.boolean().optional(),
  groupId: z.number().optional(),
  tags: z.array(z.number()).optional(),
  d_expire: z.string().optional(),
  password: z.string().optional(),
  accessLimit: z.number().optional(),
  blockedCountries: z.array(z.number()).optional(),
  mobileUrl: z.string().url().optional(),
  desktopUrl: z.string().url().optional(),
  sufix: z.string().optional(),
  metadataTitle: z.string().optional(),
  metadataDescription: z.string().optional(),
  metadataImage: z.string().optional(),
  useMetadata: z.boolean(),
});

const deleteLinkSchema = z.object({
  id: z.number().int().positive({ message: "ID inválido" }),
});

module.exports = {
  createLinkSchema,
  shortCodeParamSchema,
  postLinkPassword,
  updateLinkSchema,
  deleteLinkSchema,
};
