const z = require("zod");
const validator = require("validator");

// ============================================
// ENUMS (matching Prisma schema)
// ============================================

const MatchTypeEnum = z.enum(["AND", "OR"]);

const FieldTypeEnum = z.enum([
  "country",
  "device",
  "ip",
  "is_bot",
  "is_vpn",
  "date",
  "access_count",
]);

const OperatorTypeEnum = z.enum([
  "equals",
  "not_equals",
  "in",
  "not_in",
  "greater_than",
  "less_than",
  "before",
  "after",
  "contains",
  "not_contains",
]);

const ActionTypeEnum = z.enum([
  "redirect",
  "block_access",
  "notify",
  "password_gate",
]);

// ============================================
// VALUE SCHEMAS (based on field type)
// ============================================

const countryValueSchema = z.array(z.string().length(2).toUpperCase());
const deviceValueSchema = z.enum(["mobile", "tablet", "desktop"]);
const ipValueSchema = z.string().ip();
const booleanValueSchema = z.boolean();
const dateValueSchema = z.string().datetime();
const numberValueSchema = z.number().int().min(0);

// ============================================
// CONDITION SCHEMAS
// ============================================

const baseConditionSchema = z.object({
  field: FieldTypeEnum,
  operator: OperatorTypeEnum,
});

// Country condition
const countryConditionSchema = baseConditionSchema.extend({
  field: z.literal("country"),
  operator: z.enum(["in", "not_in"]),
  value: countryValueSchema,
});

// Device condition
const deviceConditionSchema = baseConditionSchema.extend({
  field: z.literal("device"),
  operator: z.enum(["equals", "not_equals"]),
  value: deviceValueSchema,
});

// IP condition
const ipConditionSchema = baseConditionSchema.extend({
  field: z.literal("ip"),
  operator: z.enum(["equals", "not_equals"]),
  value: ipValueSchema,
});

// Bot condition
const botConditionSchema = baseConditionSchema.extend({
  field: z.literal("is_bot"),
  operator: z.enum(["equals"]),
  value: booleanValueSchema,
});

// VPN condition
const vpnConditionSchema = baseConditionSchema.extend({
  field: z.literal("is_vpn"),
  operator: z.enum(["equals"]),
  value: booleanValueSchema,
});

// Date condition
const dateConditionSchema = baseConditionSchema.extend({
  field: z.literal("date"),
  operator: z.enum(["before", "after", "equals"]),
  value: dateValueSchema,
});

// Access count condition
const accessCountConditionSchema = baseConditionSchema.extend({
  field: z.literal("access_count"),
  operator: z.enum(["equals", "greater_than", "less_than"]),
  value: numberValueSchema,
});

// Union of all condition types
const ruleConditionSchema = z.discriminatedUnion("field", [
  countryConditionSchema,
  deviceConditionSchema,
  ipConditionSchema,
  botConditionSchema,
  vpnConditionSchema,
  dateConditionSchema,
  accessCountConditionSchema,
]);

// ============================================
// ACTION SETTINGS SCHEMAS
// ============================================

// Redirect action settings
const redirectSettingsSchema = z.object({
  url: z
    .string()
    .refine((url) => {
      // Allow template variables
      if (url === "{{longUrl}}" || url === "{{shortUrl}}") {
        return true;
      }
      // Must be valid URL
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    }, { message: "Must be a valid URL or {{longUrl}}/{{shortUrl}}" })
    .refine((url) => {
      // Allow template variables
      if (url.startsWith("{{")) {
        return true;
      }
      // Must start with http or https
      return url.startsWith("http://") || url.startsWith("https://");
    }, { message: "URL must start with http:// or https://" })
    .refine((url) => !url.toLowerCase().startsWith("javascript:"), {
      message: "JavaScript URLs are not allowed",
    })
    .refine((url) => !url.toLowerCase().startsWith("data:"), {
      message: "Data URLs are not allowed",
    }),
});

// Block access action settings
const blockAccessSettingsSchema = z.object({
  reason: z
    .string()
    .min(1)
    .max(500)
    .transform((text) => validator.escape(text)) // SECURITY: Sanitize to prevent XSS
    .optional(),
});

// Notify action settings
const notifySettingsSchema = z.object({
  webhookUrl: z
    .string()
    .url()
    .refine((url) => {
      // Only allow HTTPS for webhook URLs (security)
      return url.startsWith("https://");
    }, { message: "Webhook URL must use HTTPS" })
    .refine((url) => {
      const { isValidWebhookUrl } = require("../utils/webhookValidator");
      return isValidWebhookUrl(url);
    }, { message: "Webhook URL is not allowed (blocked for security reasons)" })
    .optional(),
  message: z
    .string()
    .min(1)
    .max(1000)
    .transform((text) => validator.escape(text)) // SECURITY: Sanitize to prevent XSS
    .optional(),
});

// Password gate action settings
const passwordGateSettingsSchema = z.object({
  passwordHash: z.string().min(1),
  hint: z
    .string()
    .max(200)
    .transform((text) => validator.escape(text)) // SECURITY: Sanitize to prevent XSS
    .optional(),
});

// ============================================
// ACTION SCHEMAS
// ============================================

const redirectActionSchema = z.object({
  type: z.literal("redirect"),
  settings: redirectSettingsSchema,
});

const blockAccessActionSchema = z.object({
  type: z.literal("block_access"),
  settings: blockAccessSettingsSchema.optional(),
});

const notifyActionSchema = z.object({
  type: z.literal("notify"),
  settings: notifySettingsSchema.optional(),
});

const passwordGateActionSchema = z.object({
  type: z.literal("password_gate"),
  settings: passwordGateSettingsSchema,
});

// Union of all action types
const actionSchema = z.discriminatedUnion("type", [
  redirectActionSchema,
  blockAccessActionSchema,
  notifyActionSchema,
  passwordGateActionSchema,
]);

// ============================================
// LINK RULE SCHEMA (for creation)
// ============================================

const createLinkRuleSchema = z.object({
  priority: z.number().int().min(0).max(999).default(0),
  enabled: z.boolean().default(true),
  match: MatchTypeEnum.default("AND"),

  conditions: z.array(ruleConditionSchema).min(0).max(10),

  action: actionSchema,
  elseAction: actionSchema.optional(),
});

// ============================================
// UPDATE SCHEMA (all fields optional)
// ============================================

const updateLinkRuleSchema = z.object({
  priority: z.number().int().min(0).max(999).optional(),
  enabled: z.boolean().optional(),
  match: MatchTypeEnum.optional(),
  conditions: z.array(ruleConditionSchema).min(0).max(10).optional(),
  action: actionSchema.optional(),
  elseAction: actionSchema.nullable().optional(), // Allow null to remove elseAction
});

// ============================================
// BATCH OPERATIONS
// ============================================

const createMultipleLinkRulesSchema = z.object({
  rules: z.array(createLinkRuleSchema).min(1).max(20),
});

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // Enums
  MatchTypeEnum,
  FieldTypeEnum,
  OperatorTypeEnum,
  ActionTypeEnum,

  // Condition schemas
  ruleConditionSchema,
  countryConditionSchema,
  deviceConditionSchema,
  ipConditionSchema,
  botConditionSchema,
  vpnConditionSchema,
  dateConditionSchema,
  accessCountConditionSchema,

  // Action schemas
  actionSchema,
  redirectActionSchema,
  blockAccessActionSchema,
  notifyActionSchema,
  passwordGateActionSchema,

  // Settings schemas
  redirectSettingsSchema,
  blockAccessSettingsSchema,
  notifySettingsSchema,
  passwordGateSettingsSchema,

  // Link Rule schemas
  createLinkRuleSchema,
  updateLinkRuleSchema,
  createMultipleLinkRulesSchema,
};
