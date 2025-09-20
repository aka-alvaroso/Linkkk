const z = require("zod");

const createGroupSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  color: z.string(),
});

const updateGroupSchema = z.object({
  groupId: z.number(),
  title: z.string().optional(),
  description: z.string().optional(),
  color: z.string().optional(),
});

const deleteGroupSchema = z.object({
  groupId: z.number(),
});

module.exports = {
  createGroupSchema,
  updateGroupSchema,
  deleteGroupSchema,
};
