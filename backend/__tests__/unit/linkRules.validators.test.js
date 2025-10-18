/**
 * @jest-environment node
 */

const {
  // Condition schemas
  countryConditionSchema,
  deviceConditionSchema,
  ipConditionSchema,
  botConditionSchema,
  vpnConditionSchema,
  dateConditionSchema,
  accessCountConditionSchema,
  ruleConditionSchema,

  // Action schemas
  redirectActionSchema,
  blockAccessActionSchema,
  notifyActionSchema,
  passwordGateActionSchema,
  actionSchema,

  // Link Rule schemas
  createLinkRuleSchema,
  updateLinkRuleSchema,
} = require("../../v2/validators/linkRules");

describe("Link Rules Validators", () => {
  // ============================================
  // CONDITION TESTS
  // ============================================

  describe("Country Condition", () => {
    it("should validate valid country condition with 'in' operator", () => {
      const valid = {
        field: "country",
        operator: "in",
        value: ["ES", "US", "AR"],
      };

      const result = countryConditionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should validate valid country condition with 'not_in' operator", () => {
      const valid = {
        field: "country",
        operator: "not_in",
        value: ["CN", "RU"],
      };

      const result = countryConditionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should reject country codes with wrong length", () => {
      const invalid = {
        field: "country",
        operator: "in",
        value: ["ESP", "USA"], // 3 letters instead of 2
      };

      const result = countryConditionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject invalid operator for country", () => {
      const invalid = {
        field: "country",
        operator: "equals", // Wrong operator
        value: ["ES"],
      };

      const result = countryConditionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("Device Condition", () => {
    it("should validate valid device condition", () => {
      const valid = {
        field: "device",
        operator: "equals",
        value: "mobile",
      };

      const result = deviceConditionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should validate all device types", () => {
      const devices = ["mobile", "tablet", "desktop"];

      devices.forEach((device) => {
        const valid = {
          field: "device",
          operator: "equals",
          value: device,
        };

        const result = deviceConditionSchema.safeParse(valid);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid device type", () => {
      const invalid = {
        field: "device",
        operator: "equals",
        value: "smartphone", // Not valid
      };

      const result = deviceConditionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("IP Condition", () => {
    it("should validate valid IPv4 address", () => {
      const valid = {
        field: "ip",
        operator: "equals",
        value: "192.168.1.1",
      };

      const result = ipConditionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should validate localhost", () => {
      const valid = {
        field: "ip",
        operator: "equals",
        value: "127.0.0.1",
      };

      const result = ipConditionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should reject invalid IP address", () => {
      const invalid = {
        field: "ip",
        operator: "equals",
        value: "256.256.256.256", // Invalid IP
      };

      const result = ipConditionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("Bot Condition", () => {
    it("should validate bot detection true", () => {
      const valid = {
        field: "is_bot",
        operator: "equals",
        value: true,
      };

      const result = botConditionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should validate bot detection false", () => {
      const valid = {
        field: "is_bot",
        operator: "equals",
        value: false,
      };

      const result = botConditionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });

  describe("VPN Condition", () => {
    it("should validate VPN detection true", () => {
      const valid = {
        field: "is_vpn",
        operator: "equals",
        value: true,
      };

      const result = vpnConditionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should validate VPN detection false", () => {
      const valid = {
        field: "is_vpn",
        operator: "equals",
        value: false,
      };

      const result = vpnConditionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });

  describe("Date Condition", () => {
    it("should validate date condition with 'before' operator", () => {
      const valid = {
        field: "date",
        operator: "before",
        value: "2025-12-31T23:59:59Z",
      };

      const result = dateConditionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should validate date condition with 'after' operator", () => {
      const valid = {
        field: "date",
        operator: "after",
        value: "2025-01-01T00:00:00Z",
      };

      const result = dateConditionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should reject invalid date format", () => {
      const invalid = {
        field: "date",
        operator: "before",
        value: "2025-12-31", // Missing time
      };

      const result = dateConditionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("Access Count Condition", () => {
    it("should validate access count with 'greater_than' operator", () => {
      const valid = {
        field: "access_count",
        operator: "greater_than",
        value: 100,
      };

      const result = accessCountConditionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should validate access count with 'less_than' operator", () => {
      const valid = {
        field: "access_count",
        operator: "less_than",
        value: 50,
      };

      const result = accessCountConditionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should reject negative access count", () => {
      const invalid = {
        field: "access_count",
        operator: "greater_than",
        value: -1,
      };

      const result = accessCountConditionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  // ============================================
  // ACTION TESTS
  // ============================================

  describe("Redirect Action", () => {
    it("should validate redirect to https URL", () => {
      const valid = {
        type: "redirect",
        settings: {
          url: "https://example.com",
        },
      };

      const result = redirectActionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should validate redirect to http URL", () => {
      const valid = {
        type: "redirect",
        settings: {
          url: "http://example.com",
        },
      };

      const result = redirectActionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should validate redirect with {{longUrl}} variable", () => {
      const valid = {
        type: "redirect",
        settings: {
          url: "{{longUrl}}",
        },
      };

      const result = redirectActionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should reject javascript: URLs", () => {
      const invalid = {
        type: "redirect",
        settings: {
          url: "javascript:alert(1)",
        },
      };

      const result = redirectActionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject data: URLs", () => {
      const invalid = {
        type: "redirect",
        settings: {
          url: "data:text/html,<script>alert(1)</script>",
        },
      };

      const result = redirectActionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("Block Access Action", () => {
    it("should validate block action with reason and message", () => {
      const valid = {
        type: "block_access",
        settings: {
          reason: "GEO_BLOCKED",
          message: "Access from your country is not allowed",
        },
      };

      const result = blockAccessActionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should validate block action without settings", () => {
      const valid = {
        type: "block_access",
      };

      const result = blockAccessActionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should reject message longer than 500 chars", () => {
      const invalid = {
        type: "block_access",
        settings: {
          message: "a".repeat(501),
        },
      };

      const result = blockAccessActionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("Password Gate Action", () => {
    it("should validate password gate with hash", () => {
      const valid = {
        type: "password_gate",
        settings: {
          passwordHash: "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
        },
      };

      const result = passwordGateActionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should validate password gate with hash and hint", () => {
      const valid = {
        type: "password_gate",
        settings: {
          passwordHash: "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
          hint: "Your DNI number",
        },
      };

      const result = passwordGateActionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should reject password gate without hash", () => {
      const invalid = {
        type: "password_gate",
        settings: {},
      };

      const result = passwordGateActionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("Notify Action", () => {
    it("should validate notify action with webhook", () => {
      const valid = {
        type: "notify",
        settings: {
          webhookUrl: "https://api.example.com/webhook",
          message: "Access detected from Spain",
        },
      };

      const result = notifyActionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should validate notify action without settings", () => {
      const valid = {
        type: "notify",
      };

      const result = notifyActionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });

  // ============================================
  // LINK RULE TESTS
  // ============================================

  describe("Create Link Rule", () => {
    it("should validate complete link rule with condition and action", () => {
      const valid = {
        priority: 1,
        enabled: true,
        match: "AND",
        conditions: [
          {
            field: "country",
            operator: "in",
            value: ["ES", "US"],
          },
        ],
        action: {
          type: "redirect",
          settings: {
            url: "https://example.com",
          },
        },
      };

      const result = createLinkRuleSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should validate rule with multiple conditions (AND)", () => {
      const valid = {
        priority: 1,
        match: "AND",
        conditions: [
          {
            field: "country",
            operator: "in",
            value: ["ES"],
          },
          {
            field: "device",
            operator: "equals",
            value: "mobile",
          },
          {
            field: "is_vpn",
            operator: "equals",
            value: false,
          },
        ],
        action: {
          type: "redirect",
          settings: {
            url: "https://mobile.es.example.com",
          },
        },
      };

      const result = createLinkRuleSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should validate rule with else action", () => {
      const valid = {
        priority: 1,
        match: "AND",
        conditions: [
          {
            field: "country",
            operator: "in",
            value: ["ES"],
          },
        ],
        action: {
          type: "redirect",
          settings: {
            url: "https://es.example.com",
          },
        },
        elseAction: {
          type: "redirect",
          settings: {
            url: "{{longUrl}}",
          },
        },
      };

      const result = createLinkRuleSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should validate rule with no conditions (always true)", () => {
      const valid = {
        priority: 999,
        conditions: [],
        action: {
          type: "redirect",
          settings: {
            url: "{{longUrl}}",
          },
        },
      };

      const result = createLinkRuleSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should apply default values", () => {
      const minimal = {
        conditions: [],
        action: {
          type: "redirect",
          settings: {
            url: "https://example.com",
          },
        },
      };

      const result = createLinkRuleSchema.safeParse(minimal);
      expect(result.success).toBe(true);
      expect(result.data.priority).toBe(0);
      expect(result.data.enabled).toBe(true);
      expect(result.data.match).toBe("AND");
    });

    it("should reject rule with more than 5 conditions", () => {
      const invalid = {
        conditions: [
          { field: "country", operator: "in", value: ["ES"] },
          { field: "device", operator: "equals", value: "mobile" },
          { field: "is_vpn", operator: "equals", value: false },
          { field: "is_bot", operator: "equals", value: false },
          { field: "ip", operator: "equals", value: "127.0.0.1" },
          { field: "access_count", operator: "less_than", value: 100 }, // 6th condition
        ],
        action: {
          type: "redirect",
          settings: { url: "https://example.com" },
        },
      };

      const result = createLinkRuleSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject priority greater than 999", () => {
      const invalid = {
        priority: 1000,
        conditions: [],
        action: {
          type: "redirect",
          settings: { url: "https://example.com" },
        },
      };

      const result = createLinkRuleSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject negative priority", () => {
      const invalid = {
        priority: -1,
        conditions: [],
        action: {
          type: "redirect",
          settings: { url: "https://example.com" },
        },
      };

      const result = createLinkRuleSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("Update Link Rule", () => {
    it("should validate partial update (only priority)", () => {
      const valid = {
        priority: 5,
      };

      const result = updateLinkRuleSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should validate partial update (only enabled)", () => {
      const valid = {
        enabled: false,
      };

      const result = updateLinkRuleSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should validate full update", () => {
      const valid = {
        priority: 10,
        enabled: true,
        match: "OR",
        conditions: [
          {
            field: "device",
            operator: "equals",
            value: "tablet",
          },
        ],
        action: {
          type: "block_access",
          settings: {
            reason: "DEVICE_BLOCKED",
          },
        },
      };

      const result = updateLinkRuleSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });

  // ============================================
  // INTEGRATION TESTS
  // ============================================

  describe("Real-world Scenarios", () => {
    it("should validate: redirect mobile users from Spain to specific URL", () => {
      const rule = {
        priority: 1,
        match: "AND",
        conditions: [
          {
            field: "country",
            operator: "in",
            value: ["ES"],
          },
          {
            field: "device",
            operator: "equals",
            value: "mobile",
          },
        ],
        action: {
          type: "redirect",
          settings: {
            url: "https://mobile.es.example.com",
          },
        },
        elseAction: {
          type: "redirect",
          settings: {
            url: "{{longUrl}}",
          },
        },
      };

      const result = createLinkRuleSchema.safeParse(rule);
      expect(result.success).toBe(true);
    });

    it("should validate: block VPN users with custom message", () => {
      const rule = {
        priority: 1,
        conditions: [
          {
            field: "is_vpn",
            operator: "equals",
            value: true,
          },
        ],
        action: {
          type: "block_access",
          settings: {
            reason: "VPN_BLOCKED",
            message: "VPN connections are not allowed for this link",
          },
        },
      };

      const result = createLinkRuleSchema.safeParse(rule);
      expect(result.success).toBe(true);
    });

    it("should validate: password gate for mobile devices only", () => {
      const rule = {
        priority: 1,
        conditions: [
          {
            field: "device",
            operator: "equals",
            value: "mobile",
          },
        ],
        action: {
          type: "password_gate",
          settings: {
            passwordHash: "$2b$10$hashed...",
            hint: "Enter your mobile PIN",
          },
        },
        elseAction: {
          type: "redirect",
          settings: {
            url: "{{longUrl}}",
          },
        },
      };

      const result = createLinkRuleSchema.safeParse(rule);
      expect(result.success).toBe(true);
    });

    it("should validate: access limit reached", () => {
      const rule = {
        priority: 1,
        conditions: [
          {
            field: "access_count",
            operator: "greater_than",
            value: 1000,
          },
        ],
        action: {
          type: "block_access",
          settings: {
            reason: "ACCESS_LIMIT_EXCEEDED",
            message: "This link has reached its access limit",
          },
        },
      };

      const result = createLinkRuleSchema.safeParse(rule);
      expect(result.success).toBe(true);
    });

    it("should validate: time-based expiration", () => {
      const rule = {
        priority: 1,
        conditions: [
          {
            field: "date",
            operator: "after",
            value: "2025-12-31T23:59:59Z",
          },
        ],
        action: {
          type: "block_access",
          settings: {
            reason: "LINK_EXPIRED",
            message: "This link expired on December 31, 2025",
          },
        },
      };

      const result = createLinkRuleSchema.safeParse(rule);
      expect(result.success).toBe(true);
    });
  });
});
