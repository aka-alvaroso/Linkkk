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

// Same rule as registration, shared by the reset flow
const passwordRule = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(128, "Password must be at most 128 characters long")
  .regex(
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/,
    "Password must contain at least one letter, one number, and one special character"
  );

const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email").max(254),
  locale: z.enum(["es", "en"]).optional(),
});

const resetPasswordSchema = z.object({
  // 32 random bytes, hex-encoded
  token: z.string().regex(/^[a-f0-9]{64}$/, "Invalid token"),
  password: passwordRule,
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
