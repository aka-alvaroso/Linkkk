const z = require("zod");

const createTagSchema = z.object({
  tagName: z.string(),
  color: z.string(),
});

const updateTagSchema = z.object({
  tagId: z.number(),
  name: z.string().optional(),
  color: z.string().optional(),
});

const deleteTagSchema = z.object({
  tagId: z.number(),
});

module.exports = {
  createTagSchema,
  updateTagSchema,
  deleteTagSchema,
};
