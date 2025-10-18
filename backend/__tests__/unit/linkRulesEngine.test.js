/**
 * @jest-environment node
 */

const {
  evaluateLinkRules,
  evaluateCondition,
  evaluateAction,
  detectDevice,
} = require("../../v2/utils/linkRulesEngine");

describe("Link Rules Engine", () => {
  // ============================================
  // DEVICE DETECTION
  // ============================================

  describe("detectDevice", () => {
    it("should detect mobile device from user agent", () => {
      const mobileUA = "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)";
      expect(detectDevice(mobileUA)).toBe("mobile");
    });

    it("should detect tablet device from user agent", () => {
      const tabletUA = "Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)";
      expect(detectDevice(tabletUA)).toBe("tablet");
    });

    it("should detect desktop device from user agent", () => {
      const desktopUA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";
      expect(detectDevice(desktopUA)).toBe("desktop");
    });

    it("should default to desktop for unknown user agent", () => {
      const unknownUA = "UnknownBot/1.0";
      expect(detectDevice(unknownUA)).toBe("desktop");
    });
  });

  // ============================================
  // CONDITION EVALUATION
  // ============================================

  describe("evaluateCondition", () => {
    describe("Country conditions", () => {
      it("should match country in list", async () => {
        const condition = {
          field: "country",
          operator: "in",
          value: ["ES", "US", "AR"],
        };
        const context = { country: "ES" };

        const result = await evaluateCondition(condition, context);
        expect(result).toBe(true);
      });

      it("should not match country not in list", async () => {
        const condition = {
          field: "country",
          operator: "in",
          value: ["ES", "US"],
        };
        const context = { country: "FR" };

        const result = await evaluateCondition(condition, context);
        expect(result).toBe(false);
      });

      it("should handle not_in operator", async () => {
        const condition = {
          field: "country",
          operator: "not_in",
          value: ["CN", "RU"],
        };
        const context = { country: "ES" };

        const result = await evaluateCondition(condition, context);
        expect(result).toBe(true);
      });
    });

    describe("Device conditions", () => {
      it("should match device type", async () => {
        const condition = {
          field: "device",
          operator: "equals",
          value: "mobile",
        };
        const context = { device: "mobile" };

        const result = await evaluateCondition(condition, context);
        expect(result).toBe(true);
      });

      it("should not match different device type", async () => {
        const condition = {
          field: "device",
          operator: "equals",
          value: "mobile",
        };
        const context = { device: "desktop" };

        const result = await evaluateCondition(condition, context);
        expect(result).toBe(false);
      });

      it("should handle not_equals operator", async () => {
        const condition = {
          field: "device",
          operator: "not_equals",
          value: "mobile",
        };
        const context = { device: "desktop" };

        const result = await evaluateCondition(condition, context);
        expect(result).toBe(true);
      });
    });

    describe("IP conditions", () => {
      it("should match exact IP", async () => {
        const condition = {
          field: "ip",
          operator: "equals",
          value: "127.0.0.1",
        };
        const context = { ip: "127.0.0.1" };

        const result = await evaluateCondition(condition, context);
        expect(result).toBe(true);
      });

      it("should not match different IP", async () => {
        const condition = {
          field: "ip",
          operator: "equals",
          value: "127.0.0.1",
        };
        const context = { ip: "192.168.1.1" };

        const result = await evaluateCondition(condition, context);
        expect(result).toBe(false);
      });
    });

    describe("VPN conditions", () => {
      it("should match VPN detected", async () => {
        const condition = {
          field: "is_vpn",
          operator: "equals",
          value: true,
        };
        const context = { isVPN: true };

        const result = await evaluateCondition(condition, context);
        expect(result).toBe(true);
      });

      it("should match VPN not detected", async () => {
        const condition = {
          field: "is_vpn",
          operator: "equals",
          value: false,
        };
        const context = { isVPN: false };

        const result = await evaluateCondition(condition, context);
        expect(result).toBe(true);
      });
    });

    describe("Bot conditions", () => {
      it("should match bot detected", async () => {
        const condition = {
          field: "is_bot",
          operator: "equals",
          value: true,
        };
        const context = { isBot: true };

        const result = await evaluateCondition(condition, context);
        expect(result).toBe(true);
      });

      it("should match bot not detected", async () => {
        const condition = {
          field: "is_bot",
          operator: "equals",
          value: false,
        };
        const context = { isBot: false };

        const result = await evaluateCondition(condition, context);
        expect(result).toBe(true);
      });
    });

    describe("Date conditions", () => {
      it("should match date before", async () => {
        const futureDate = new Date(Date.now() + 86400000).toISOString(); // Tomorrow
        const condition = {
          field: "date",
          operator: "before",
          value: futureDate,
        };
        const context = { currentDate: new Date() };

        const result = await evaluateCondition(condition, context);
        expect(result).toBe(true);
      });

      it("should not match date before if after", async () => {
        const pastDate = new Date(Date.now() - 86400000).toISOString(); // Yesterday
        const condition = {
          field: "date",
          operator: "before",
          value: pastDate,
        };
        const context = { currentDate: new Date() };

        const result = await evaluateCondition(condition, context);
        expect(result).toBe(false);
      });

      it("should match date after", async () => {
        const pastDate = new Date(Date.now() - 86400000).toISOString(); // Yesterday
        const condition = {
          field: "date",
          operator: "after",
          value: pastDate,
        };
        const context = { currentDate: new Date() };

        const result = await evaluateCondition(condition, context);
        expect(result).toBe(true);
      });
    });

    describe("Access count conditions", () => {
      it("should match greater_than", async () => {
        const condition = {
          field: "access_count",
          operator: "greater_than",
          value: 100,
        };
        const context = { accessCount: 150 };

        const result = await evaluateCondition(condition, context);
        expect(result).toBe(true);
      });

      it("should not match greater_than if less", async () => {
        const condition = {
          field: "access_count",
          operator: "greater_than",
          value: 100,
        };
        const context = { accessCount: 50 };

        const result = await evaluateCondition(condition, context);
        expect(result).toBe(false);
      });

      it("should match less_than", async () => {
        const condition = {
          field: "access_count",
          operator: "less_than",
          value: 100,
        };
        const context = { accessCount: 50 };

        const result = await evaluateCondition(condition, context);
        expect(result).toBe(true);
      });

      it("should match equals", async () => {
        const condition = {
          field: "access_count",
          operator: "equals",
          value: 100,
        };
        const context = { accessCount: 100 };

        const result = await evaluateCondition(condition, context);
        expect(result).toBe(true);
      });
    });
  });

  // ============================================
  // ACTION EVALUATION
  // ============================================

  describe("evaluateAction", () => {
    const mockLink = {
      id: 1,
      shortUrl: "abc123",
      longUrl: "https://example.com",
    };

    it("should evaluate redirect action", async () => {
      const action = {
        type: "redirect",
        settings: {
          url: "https://redirect.com",
        },
      };

      const result = await evaluateAction(action, mockLink);
      expect(result).toEqual({
        type: "redirect",
        url: "https://redirect.com",
      });
    });

    it("should replace {{longUrl}} variable", async () => {
      const action = {
        type: "redirect",
        settings: {
          url: "{{longUrl}}",
        },
      };

      const result = await evaluateAction(action, mockLink);
      expect(result).toEqual({
        type: "redirect",
        url: "https://example.com",
      });
    });

    it("should replace {{shortUrl}} variable", async () => {
      const action = {
        type: "redirect",
        settings: {
          url: "https://stats.example.com/{{shortUrl}}",
        },
      };

      const result = await evaluateAction(action, mockLink);
      expect(result).toEqual({
        type: "redirect",
        url: "https://stats.example.com/abc123",
      });
    });

    it("should evaluate block action", async () => {
      const action = {
        type: "block_access",
        settings: {
          reason: "GEO_BLOCKED",
          message: "Access denied",
        },
      };

      const result = await evaluateAction(action, mockLink);
      expect(result).toEqual({
        type: "block",
        reason: "GEO_BLOCKED",
        message: "Access denied",
      });
    });

    it("should evaluate password gate action", async () => {
      const action = {
        type: "password_gate",
        settings: {
          passwordHash: "$2b$10$hash...",
          hint: "Your DNI",
        },
      };

      const result = await evaluateAction(action, mockLink);
      expect(result).toEqual({
        type: "password_gate",
        shortUrl: "abc123",
        passwordHash: "$2b$10$hash...",
        hint: "Your DNI",
      });
    });

    it("should evaluate notify action", async () => {
      const action = {
        type: "notify",
        settings: {
          webhookUrl: "https://api.example.com/webhook",
          message: "Access from Spain",
        },
      };

      const result = await evaluateAction(action, mockLink);
      expect(result).toEqual({
        type: "notify",
        webhookUrl: "https://api.example.com/webhook",
        message: "Access from Spain",
      });
    });
  });

  // ============================================
  // FULL RULE EVALUATION
  // ============================================

  describe("evaluateLinkRules", () => {
    const mockLink = {
      id: 1,
      shortUrl: "abc123",
      longUrl: "https://example.com",
      accessCount: 50,
    };

    describe("No rules", () => {
      it("should redirect to longUrl if no rules", async () => {
        const linkWithNoRules = { ...mockLink, rules: [] };
        const context = { country: "ES", device: "mobile" };

        const result = await evaluateLinkRules(linkWithNoRules, context);
        expect(result).toEqual({
          allowed: true,
          action: {
            type: "redirect",
            url: "https://example.com",
          },
        });
      });
    });

    describe("Single rule evaluation", () => {
      it("should execute action if condition matches", async () => {
        const linkWithRule = {
          ...mockLink,
          rules: [
            {
              priority: 1,
              enabled: true,
              match: "AND",
              conditions: [
                {
                  field: "country",
                  operator: "in",
                  value: ["ES"],
                },
              ],
              actionType: "redirect",
              actionSettings: {
                url: "https://es.example.com",
              },
            },
          ],
        };

        const context = { country: "ES", device: "mobile" };
        const result = await evaluateLinkRules(linkWithRule, context);

        expect(result).toEqual({
          allowed: true,
          action: {
            type: "redirect",
            url: "https://es.example.com",
          },
        });
      });

      it("should skip to next rule if condition does not match", async () => {
        const linkWithRules = {
          ...mockLink,
          rules: [
            {
              priority: 1,
              enabled: true,
              match: "AND",
              conditions: [
                {
                  field: "country",
                  operator: "in",
                  value: ["US"],
                },
              ],
              actionType: "redirect",
              actionSettings: {
                url: "https://us.example.com",
              },
            },
            {
              priority: 2,
              enabled: true,
              match: "AND",
              conditions: [],
              actionType: "redirect",
              actionSettings: {
                url: "{{longUrl}}",
              },
            },
          ],
        };

        const context = { country: "ES", device: "mobile" };
        const result = await evaluateLinkRules(linkWithRules, context);

        expect(result).toEqual({
          allowed: true,
          action: {
            type: "redirect",
            url: "https://example.com",
          },
        });
      });
    });

    describe("Multiple conditions with AND", () => {
      it("should match if all conditions are true (AND)", async () => {
        const linkWithRule = {
          ...mockLink,
          rules: [
            {
              priority: 1,
              enabled: true,
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
              actionType: "redirect",
              actionSettings: {
                url: "https://mobile.es.example.com",
              },
            },
          ],
        };

        const context = { country: "ES", device: "mobile" };
        const result = await evaluateLinkRules(linkWithRule, context);

        expect(result.action.url).toBe("https://mobile.es.example.com");
      });

      it("should not match if any condition is false (AND)", async () => {
        const linkWithRule = {
          ...mockLink,
          rules: [
            {
              priority: 1,
              enabled: true,
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
              actionType: "redirect",
              actionSettings: {
                url: "https://mobile.es.example.com",
              },
            },
            {
              priority: 2,
              enabled: true,
              match: "AND",
              conditions: [],
              actionType: "redirect",
              actionSettings: {
                url: "{{longUrl}}",
              },
            },
          ],
        };

        const context = { country: "ES", device: "desktop" }; // Different device
        const result = await evaluateLinkRules(linkWithRule, context);

        expect(result.action.url).toBe("https://example.com"); // Falls to second rule
      });
    });

    describe("Multiple conditions with OR", () => {
      it("should match if at least one condition is true (OR)", async () => {
        const linkWithRule = {
          ...mockLink,
          rules: [
            {
              priority: 1,
              enabled: true,
              match: "OR",
              conditions: [
                {
                  field: "country",
                  operator: "in",
                  value: ["ES"],
                },
                {
                  field: "country",
                  operator: "in",
                  value: ["US"],
                },
              ],
              actionType: "redirect",
              actionSettings: {
                url: "https://international.example.com",
              },
            },
          ],
        };

        const context = { country: "ES", device: "mobile" };
        const result = await evaluateLinkRules(linkWithRule, context);

        expect(result.action.url).toBe("https://international.example.com");
      });

      it("should not match if all conditions are false (OR)", async () => {
        const linkWithRule = {
          ...mockLink,
          rules: [
            {
              priority: 1,
              enabled: true,
              match: "OR",
              conditions: [
                {
                  field: "country",
                  operator: "in",
                  value: ["US"],
                },
                {
                  field: "country",
                  operator: "in",
                  value: ["FR"],
                },
              ],
              actionType: "redirect",
              actionSettings: {
                url: "https://international.example.com",
              },
            },
            {
              priority: 2,
              enabled: true,
              match: "AND",
              conditions: [],
              actionType: "redirect",
              actionSettings: {
                url: "{{longUrl}}",
              },
            },
          ],
        };

        const context = { country: "ES", device: "mobile" };
        const result = await evaluateLinkRules(linkWithRule, context);

        expect(result.action.url).toBe("https://example.com");
      });
    });

    describe("Else actions", () => {
      it("should execute else action if condition does not match", async () => {
        const linkWithRule = {
          ...mockLink,
          rules: [
            {
              priority: 1,
              enabled: true,
              match: "AND",
              conditions: [
                {
                  field: "country",
                  operator: "in",
                  value: ["US"],
                },
              ],
              actionType: "redirect",
              actionSettings: {
                url: "https://us.example.com",
              },
              elseActionType: "redirect",
              elseActionSettings: {
                url: "https://other.example.com",
              },
            },
          ],
        };

        const context = { country: "ES", device: "mobile" };
        const result = await evaluateLinkRules(linkWithRule, context);

        expect(result.action.url).toBe("https://other.example.com");
      });
    });

    describe("Block actions", () => {
      it("should block access if action is block_access", async () => {
        const linkWithRule = {
          ...mockLink,
          rules: [
            {
              priority: 1,
              enabled: true,
              match: "AND",
              conditions: [
                {
                  field: "is_vpn",
                  operator: "equals",
                  value: true,
                },
              ],
              actionType: "block_access",
              actionSettings: {
                reason: "VPN_BLOCKED",
                message: "VPN connections are not allowed",
              },
            },
          ],
        };

        const context = { country: "ES", isVPN: true, device: "mobile" };
        const result = await evaluateLinkRules(linkWithRule, context);

        expect(result.allowed).toBe(false);
        expect(result.action.type).toBe("block");
        expect(result.action.reason).toBe("VPN_BLOCKED");
      });
    });

    describe("Priority ordering", () => {
      it("should evaluate rules in priority order (lower first)", async () => {
        const linkWithRules = {
          ...mockLink,
          rules: [
            {
              priority: 2,
              enabled: true,
              match: "AND",
              conditions: [],
              actionType: "redirect",
              actionSettings: {
                url: "https://fallback.example.com",
              },
            },
            {
              priority: 1,
              enabled: true,
              match: "AND",
              conditions: [
                {
                  field: "country",
                  operator: "in",
                  value: ["ES"],
                },
              ],
              actionType: "redirect",
              actionSettings: {
                url: "https://es.example.com",
              },
            },
          ],
        };

        const context = { country: "ES", device: "mobile" };
        const result = await evaluateLinkRules(linkWithRules, context);

        // Should match priority 1 rule first
        expect(result.action.url).toBe("https://es.example.com");
      });
    });

    describe("Disabled rules", () => {
      it("should skip disabled rules", async () => {
        const linkWithRules = {
          ...mockLink,
          rules: [
            {
              priority: 1,
              enabled: false, // Disabled
              match: "AND",
              conditions: [
                {
                  field: "country",
                  operator: "in",
                  value: ["ES"],
                },
              ],
              actionType: "redirect",
              actionSettings: {
                url: "https://es.example.com",
              },
            },
            {
              priority: 2,
              enabled: true,
              match: "AND",
              conditions: [],
              actionType: "redirect",
              actionSettings: {
                url: "{{longUrl}}",
              },
            },
          ],
        };

        const context = { country: "ES", device: "mobile" };
        const result = await evaluateLinkRules(linkWithRules, context);

        // Should skip disabled rule and go to second one
        expect(result.action.url).toBe("https://example.com");
      });
    });

    describe("Password gate", () => {
      it("should require password gate", async () => {
        const linkWithRule = {
          ...mockLink,
          rules: [
            {
              priority: 1,
              enabled: true,
              match: "AND",
              conditions: [
                {
                  field: "device",
                  operator: "equals",
                  value: "mobile",
                },
              ],
              actionType: "password_gate",
              actionSettings: {
                passwordHash: "$2b$10$hash...",
                hint: "Your mobile PIN",
              },
            },
          ],
        };

        const context = { country: "ES", device: "mobile" };
        const result = await evaluateLinkRules(linkWithRule, context);

        expect(result.allowed).toBe(true);
        expect(result.action.type).toBe("password_gate");
        expect(result.action.passwordHash).toBe("$2b$10$hash...");
      });
    });
  });
});
