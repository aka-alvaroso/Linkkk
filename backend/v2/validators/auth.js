const z = require("zod");

// Register Validator
const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(25, "Username must be at most 25 characters long"),
  email: z.string().email("Invalid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/,
      "Password must contain at least one letter, one number, and one special character"
    ),
});

// Login Validator
const loginSchema = z.object({
  usernameOrEmail: z.string().or(z.string().email("Invalid email")),
  password: z.string(),
});

module.exports = {
  registerSchema,
  loginSchema,
};
