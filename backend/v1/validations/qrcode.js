const z = require("zod");

const createQrCodeSchema = z.object({
  linkId: z.number(),
});

module.exports = {
  createQrCodeSchema,
};
