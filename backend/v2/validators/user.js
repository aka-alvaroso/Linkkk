const z = require("zod");

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(3).max(25).optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/,
      "Password must contain at least one letter, one number, and one special character"
    )
    .optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

module.exports = {
  updateUserSchema,
};
