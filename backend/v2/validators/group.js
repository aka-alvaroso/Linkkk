const { z } = require("zod");

const hexColor = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color (e.g. #FF5733)")
  .optional();

const createGroupSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be 50 characters or less")
    .trim(),
  description: z
    .string()
    .max(200, "Description must be 200 characters or less")
    .trim()
    .optional(),
  color: hexColor,
});

const updateGroupSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be 50 characters or less")
    .trim()
    .optional(),
  description: z
    .string()
    .max(200, "Description must be 200 characters or less")
    .trim()
    .nullable()
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color (e.g. #FF5733)")
    .nullable()
    .optional(),
  order: z.number().int().min(0).optional(),
});

module.exports = { createGroupSchema, updateGroupSchema };
