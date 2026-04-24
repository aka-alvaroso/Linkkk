const { z } = require("zod");

const hexColor = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color (e.g. #FF5733)")
  .optional();

const createTagSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(30, "Name must be 30 characters or less")
    .trim(),
  color: hexColor,
});

const updateTagSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(30, "Name must be 30 characters or less")
    .trim()
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color (e.g. #FF5733)")
    .nullable()
    .optional(),
});

module.exports = { createTagSchema, updateTagSchema };
