const z = require("zod");

// Register Validator
const registerSchema = z.object({
  username: z.string().min(3).max(25),
  email: z.string().email(),
  password: z
    .string()
    .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/),
});

// Login Validator
const loginSchema = z.object({
  usernameOrEmail: z.string().min(3).max(25).or(z.string().email()),
  password: z.string().min(8),
});

module.exports = {
  registerSchema,
  loginSchema,
};
