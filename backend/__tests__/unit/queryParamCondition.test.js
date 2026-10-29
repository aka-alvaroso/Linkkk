/**
 * @jest-environment node
 */

jest.mock("../../v2/config/environment", () => ({
  frontend: { url: "http://frontend.test" },
  nodeEnv: "test",
  security: { trustedProxies: [] },
}));
jest.mock("../../v2/prisma/client", () => ({
  link: { findUnique: jest.fn() },
  customDomain: { findFirst: jest.fn() },
  $transaction: jest.fn(),
}));
jest.mock("../../v2/services/emailService", () => ({
  sendRuleNotificationEmail: jest.fn(),
}));
jest.mock("../../v2/realtime/broadcaster", () => ({ publish: jest.fn() }));

const prisma = require("../../v2/prisma/client");
const { evaluateCondition } = require("../../v2/utils/linkRulesEngine");
const { ruleConditionSchema } = require("../../v2/validators/linkRules");
const { redirectLink } = require("../../v2/controllers/link");

const BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120 Safari/537.36";

const cond = (operator, key, value) => ({ field: "query_param", operator, value: { key, value } });
const ctx = (queryParams) => ({ queryParams });

describe("query_param condition", () => {
  it("equals: matches the param, ignoring case", async () => {
    const c = cond("equals", "utm_source", "instagram");
    expect(await evaluateCondition(c, ctx({ utm_source: "instagram" }))).toBe(true);
    expect(await evaluateCondition(c, ctx({ utm_source: "Instagram" }))).toBe(true);
    expect(await evaluateCondition(c, ctx({ UTM_SOURCE: "instagram" }))).toBe(true);
    expect(await evaluateCondition(c, ctx({ utm_source: "facebook" }))).toBe(false);
  });

  it("positive operators fail when the param is missing", async () => {
    for (const op of ["equals", "contains"]) {
      expect(await evaluateCondition(cond(op, "utm_source", "x"), ctx({}))).toBe(false);
    }
    expect(await evaluateCondition(cond("in", "utm_source", ["x"]), ctx({}))).toBe(false);
    expect(await evaluateCondition(cond("equals", "utm_source", "x"), {})).toBe(false);
  });

  it("negative operators pass when the param is missing", async () => {
    expect(await evaluateCondition(cond("not_equals", "utm_source", "x"), ctx({}))).toBe(true);
    expect(await evaluateCondition(cond("not_contains", "utm_source", "x"), ctx({}))).toBe(true);
    expect(await evaluateCondition(cond("not_in", "utm_source", ["x"]), ctx({}))).toBe(true);
  });

  it("not_equals / not_in compare against present params", async () => {
    expect(await evaluateCondition(cond("not_equals", "utm_source", "x"), ctx({ utm_source: "x" }))).toBe(false);
    expect(await evaluateCondition(cond("not_equals", "utm_source", "x"), ctx({ utm_source: "y" }))).toBe(true);
    expect(await evaluateCondition(cond("not_in", "utm_source", ["x", "y"]), ctx({ utm_source: "y" }))).toBe(false);
  });

  it("in: matches any value of the list", async () => {
    const c = cond("in", "utm_medium", ["social", "cpc"]);
    expect(await evaluateCondition(c, ctx({ utm_medium: "CPC" }))).toBe(true);
    expect(await evaluateCondition(c, ctx({ utm_medium: "email" }))).toBe(false);
  });

  it("contains: substring match", async () => {
    const c = cond("contains", "utm_campaign", "friday");
    expect(await evaluateCondition(c, ctx({ utm_campaign: "Black-Friday-2026" }))).toBe(true);
    expect(await evaluateCondition(c, ctx({ utm_campaign: "launch" }))).toBe(false);
    expect(await evaluateCondition(cond("not_contains", "utm_campaign", "friday"), ctx({ utm_campaign: "launch" }))).toBe(true);
  });

  it("fails closed on malformed values", async () => {
    expect(await evaluateCondition({ field: "query_param", operator: "equals", value: "utm_source" }, ctx({}))).toBe(false);
    expect(await evaluateCondition(cond("in", "utm_source", "instagram"), ctx({ utm_source: "instagram" }))).toBe(false);
    expect(await evaluateCondition(cond("equals", "utm_source", ["a"]), ctx({ utm_source: "a" }))).toBe(false);
    expect(await evaluateCondition({ field: "query_param", operator: "greater_than", value: { key: "a", value: "1" } }, ctx({ a: "2" }))).toBe(false);
  });
});

describe("query_param validation", () => {
  const ok = (c) => ruleConditionSchema.safeParse(c).success;

  it("accepts a key with a single value or a list", () => {
    expect(ok(cond("equals", "utm_source", "instagram"))).toBe(true);
    expect(ok(cond("in", "utm_source", ["instagram", "facebook"]))).toBe(true);
    expect(ok(cond("contains", "utm-campaign", "friday"))).toBe(true);
  });

  it("requires a list for in/not_in and a single value otherwise", () => {
    expect(ok(cond("in", "utm_source", "instagram"))).toBe(false);
    expect(ok(cond("not_in", "utm_source", "instagram"))).toBe(false);
    expect(ok(cond("equals", "utm_source", ["instagram"]))).toBe(false);
  });

  it("rejects unsafe or reserved keys and empty values", () => {
    expect(ok(cond("equals", "utm source", "x"))).toBe(false);
    expect(ok(cond("equals", "a[b]", "x"))).toBe(false);
    expect(ok(cond("equals", "__proto__.x", "x"))).toBe(false);
    expect(ok(cond("equals", "src", "qr"))).toBe(false);
    expect(ok(cond("equals", "", "x"))).toBe(false);
    expect(ok(cond("equals", "utm_source", ""))).toBe(false);
    expect(ok(cond("in", "utm_source", []))).toBe(false);
  });

  it("rejects operators that make no sense for text", () => {
    expect(ok(cond("greater_than", "utm_source", "x"))).toBe(false);
    expect(ok(cond("before", "utm_source", "x"))).toBe(false);
  });
});

describe("redirectLink with a query_param rule", () => {
  const makeLink = () => ({
    id: 1,
    userId: null,
    shortUrl: "abc123",
    longUrl: "https://example.com/default",
    status: true,
    forwardParams: false,
    accessCount: 0,
    scanCount: 0,
    rules: [
      {
        id: 10,
        priority: 0,
        enabled: true,
        match: "AND",
        conditions: [{ field: "query_param", operator: "equals", value: { key: "utm_source", value: "instagram" } }],
        actionType: "redirect",
        actionSettings: { url: "https://example.com/instagram" },
      },
    ],
    customDomain: null,
    metadata: null,
    user: null,
  });

  const run = async (query) => {
    prisma.link.findUnique.mockResolvedValue(makeLink());
    prisma.$transaction.mockImplementation(async (fn) =>
      fn({
        access: { create: jest.fn() },
        link: { update: jest.fn().mockResolvedValue({ accessCount: 1, scanCount: 0 }) },
      })
    );
    const req = {
      params: { shortUrl: "abc123" },
      headers: { "user-agent": BROWSER_UA, host: "localhost:3000" },
      query,
      ip: "8.8.8.8",
      socket: { remoteAddress: "8.8.8.8" },
    };
    const res = { redirect: jest.fn(), set: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };
    await redirectLink(req, res);
    return res;
  };

  it("sends visitors with the matching UTM to the rule's destination", async () => {
    const res = await run({ utm_source: "Instagram" });
    expect(res.redirect).toHaveBeenCalledWith(302, "https://example.com/instagram");
  });

  it("falls back to the link's destination otherwise", async () => {
    expect((await run({ utm_source: "facebook" })).redirect).toHaveBeenCalledWith(302, "https://example.com/default");
    expect((await run({})).redirect).toHaveBeenCalledWith(302, "https://example.com/default");
  });
});
