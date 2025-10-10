const z = require("zod");

const getLinkAccessesSchema = z.object({
  shortUrl: z.string().min(1).max(255),
});

module.exports = {
  getLinkAccessesSchema,
};
