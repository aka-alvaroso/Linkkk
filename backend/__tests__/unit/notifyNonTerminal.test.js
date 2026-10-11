/**
 * @jest-environment node
 */

const { evaluateLinkRules } = require("../../v2/utils/linkRulesEngine");

const link = {
  shortUrl: "abc123",
  longUrl: "https://example.com/destination",
  rules: [],
};

const notifyRule = (id, priority, extra = {}) => ({
  id,
  priority,
  enabled: true,
  match: "AND",
  conditions: [],
  actionType: "notify",
  actionSettings: { webhookUrl: `https://hooks.example.com/${id}`, sendEmail: true },
  ...extra,
});

const blockBotRule = (id, priority) => ({
  id,
  priority,
  enabled: true,
  match: "AND",
  conditions: [{ field: "is_bot", operator: "equals", value: true }],
  actionType: "block_access",
  actionSettings: { reason: "No bots" },
});

const withRules = (rules) => ({ ...link, rules });

describe("notify is a non-terminal action", () => {
  it("notifies and blocks a bot when notify (0) precedes block (1)", async () => {
    const result = await evaluateLinkRules(
      withRules([notifyRule("n1", 0), blockBotRule("b1", 1)]),
      { isBot: true }
    );

    expect(result.notifications).toHaveLength(1);
    expect(result.notifications[0]).toMatchObject({ type: "notify", ruleId: "n1" });
    expect(result.action.type).toBe("block");
    expect(result.allowed).toBe(false);
  });

  it("notifies and redirects to longUrl for a normal visit", async () => {
    const result = await evaluateLinkRules(
      withRules([notifyRule("n1", 0), blockBotRule("b1", 1)]),
      { isBot: false }
    );

    expect(result.notifications).toHaveLength(1);
    expect(result.notifications[0].ruleId).toBe("n1");
    expect(result.action).toEqual({ type: "redirect", url: link.longUrl });
    expect(result.allowed).toBe(true);
  });

  it("does not evaluate a notify placed after the terminal action", async () => {
    const result = await evaluateLinkRules(
      withRules([blockBotRule("b1", 0), notifyRule("n1", 1)]),
      { isBot: true }
    );

    expect(result.notifications).toEqual([]);
    expect(result.action.type).toBe("block");
  });

  it("returns every notify in priority order with its ruleId", async () => {
    const result = await evaluateLinkRules(
      withRules([
        notifyRule("n3", 5),
        notifyRule("n1", 0),
        notifyRule("n2", 2),
      ]),
      {}
    );

    expect(result.notifications.map((n) => n.ruleId)).toEqual(["n1", "n2", "n3"]);
    expect(result.notifications[1].webhookUrl).toBe("https://hooks.example.com/n2");
    expect(result.notifications[1].sendEmail).toBe(true);
    expect(result.action).toEqual({ type: "redirect", url: link.longUrl });
  });

  it("only collects notify rules whose conditions match", async () => {
    const result = await evaluateLinkRules(
      withRules([
        notifyRule("n1", 0, {
          conditions: [{ field: "is_bot", operator: "equals", value: true }],
        }),
        notifyRule("n2", 1),
      ]),
      { isBot: false }
    );

    expect(result.notifications.map((n) => n.ruleId)).toEqual(["n2"]);
  });

  it("treats an elseAction of type notify as non-terminal", async () => {
    const rule = {
      id: "e1",
      priority: 0,
      enabled: true,
      match: "AND",
      conditions: [{ field: "is_bot", operator: "equals", value: true }],
      actionType: "block_access",
      actionSettings: {},
      elseActionType: "notify",
      elseActionSettings: { message: "human visit" },
    };
    const redirect = {
      id: "r1",
      priority: 1,
      enabled: true,
      match: "AND",
      conditions: [],
      actionType: "redirect",
      actionSettings: { url: "https://example.com/other" },
    };

    const result = await evaluateLinkRules(withRules([rule, redirect]), { isBot: false });

    expect(result.notifications).toHaveLength(1);
    expect(result.notifications[0]).toMatchObject({
      type: "notify",
      ruleId: "e1",
      message: "human visit",
    });
    expect(result.action).toEqual({ type: "redirect", url: "https://example.com/other" });
  });

  it("keeps evaluating later rules when password_gate is skipped", async () => {
    const gate = {
      id: "g1",
      priority: 1,
      enabled: true,
      match: "AND",
      conditions: [],
      actionType: "password_gate",
      actionSettings: { passwordHash: "hash" },
    };
    const rules = [notifyRule("n1", 0), gate, notifyRule("n2", 2), blockBotRule("b1", 3)];

    const gated = await evaluateLinkRules(withRules(rules), { isBot: true });
    expect(gated.action.type).toBe("password_gate");
    expect(gated.notifications.map((n) => n.ruleId)).toEqual(["n1"]);

    const resumed = await evaluateLinkRules(withRules(rules), { isBot: true }, {
      skipActionTypes: ["password_gate"],
    });
    expect(resumed.notifications.map((n) => n.ruleId)).toEqual(["n1", "n2"]);
    expect(resumed.action.type).toBe("block");
  });

  it("returns an empty notifications list when there are no rules", async () => {
    const result = await evaluateLinkRules(link, {});

    expect(result.notifications).toEqual([]);
    expect(result.action).toEqual({ type: "redirect", url: link.longUrl });
  });
});
