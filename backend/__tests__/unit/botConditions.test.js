/**
 * @jest-environment node
 */

const { evaluateCondition } = require("../../v2/utils/linkRulesEngine");
const { ruleConditionSchema } = require("../../v2/validators/linkRules");
const burstTracker = require("../../v2/utils/burstTracker");

describe("ip condition with lists", () => {
  const list = ["45.138.12.0/24", "5.102.169.29", "185.218.*.*"];

  it("matches an IP against exact, CIDR and wildcard entries", async () => {
    for (const ip of ["45.138.12.16", "5.102.169.29", "185.218.86.24"]) {
      expect(
        await evaluateCondition({ field: "ip", operator: "in", value: list }, { ip })
      ).toBe(true);
    }
  });

  it("does not match IPs outside the list", async () => {
    const ctx = { ip: "8.8.8.8" };
    expect(await evaluateCondition({ field: "ip", operator: "in", value: list }, ctx)).toBe(false);
    expect(await evaluateCondition({ field: "ip", operator: "not_in", value: list }, ctx)).toBe(true);
  });

  it("fails closed when 'in' is given a single string", async () => {
    expect(
      await evaluateCondition({ field: "ip", operator: "in", value: "5.102.169.29" }, { ip: "5.102.169.29" })
    ).toBe(false);
  });
});

describe("is_datacenter condition", () => {
  it("matches the context flag", async () => {
    const cond = { field: "is_datacenter", operator: "equals", value: true };
    expect(await evaluateCondition(cond, { isDatacenter: true })).toBe(true);
    expect(await evaluateCondition(cond, { isDatacenter: false })).toBe(false);
  });
});

describe("burst condition", () => {
  const cond = { field: "burst", operator: "equals", value: { links: 3, seconds: 10 } };
  const link = (id) => ({ id, userId: 1 });

  beforeEach(() => burstTracker._reset());

  it("fires on the third distinct link inside the window", async () => {
    const now = Date.now();
    burstTracker.recordHit(link(1), "1.2.3.4", now);
    const second = burstTracker.recordHit(link(2), "1.2.3.4", now + 1000);
    expect(await evaluateCondition(cond, { recentHits: second })).toBe(false);
    const third = burstTracker.recordHit(link(3), "1.2.3.4", Date.now());
    // Window is relative to real time in the evaluator, so use fresh timestamps
    const fresh = [
      { linkId: 1, ts: Date.now() - 2000 },
      { linkId: 2, ts: Date.now() - 1000 },
      { linkId: 3, ts: Date.now() },
    ];
    expect(third.length).toBeGreaterThan(0);
    expect(await evaluateCondition(cond, { recentHits: fresh })).toBe(true);
  });

  it("does not count the same link repeatedly", async () => {
    const hits = Array.from({ length: 5 }, () => ({ linkId: 1, ts: Date.now() }));
    expect(await evaluateCondition(cond, { recentHits: hits })).toBe(false);
  });

  it("ignores hits outside the window", async () => {
    const hits = [
      { linkId: 1, ts: Date.now() - 60000 },
      { linkId: 2, ts: Date.now() - 30000 },
      { linkId: 3, ts: Date.now() },
    ];
    expect(await evaluateCondition(cond, { recentHits: hits })).toBe(false);
  });

  it("is false without hit data and rejects malformed values", async () => {
    expect(await evaluateCondition(cond, {})).toBe(false);
    expect(
      await evaluateCondition({ ...cond, value: { links: 1, seconds: 10 } }, { recentHits: [{ linkId: 1, ts: Date.now() }] })
    ).toBe(false);
  });
});

describe("burstTracker", () => {
  beforeEach(() => burstTracker._reset());

  it("separates owners and IPs", () => {
    const now = Date.now();
    burstTracker.recordHit({ id: 1, userId: 1 }, "1.1.1.1", now);
    expect(burstTracker.recordHit({ id: 2, userId: 2 }, "1.1.1.1", now)).toHaveLength(1);
    expect(burstTracker.recordHit({ id: 3, userId: 1 }, "2.2.2.2", now)).toHaveLength(1);
    expect(burstTracker.recordHit({ id: 4, userId: 1 }, "1.1.1.1", now)).toHaveLength(2);
  });

  it("drops hits older than the max window", () => {
    const now = Date.now();
    burstTracker.recordHit({ id: 1, userId: 1 }, "1.1.1.1", now - 400000);
    expect(burstTracker.recordHit({ id: 2, userId: 1 }, "1.1.1.1", now)).toHaveLength(1);
  });
});

describe("validators for the new conditions", () => {
  const ok = (c) => ruleConditionSchema.safeParse(c).success;

  it("accepts IP lists, CIDR and wildcards", () => {
    expect(ok({ field: "ip", operator: "in", value: ["1.2.3.4", "10.0.0.0/8", "1.2.*.*"] })).toBe(true);
    expect(ok({ field: "ip", operator: "equals", value: "45.138.12.0/24" })).toBe(true);
  });

  it("rejects bad patterns and operator/value mismatches", () => {
    expect(ok({ field: "ip", operator: "equals", value: "1.2.3.0/40" })).toBe(false);
    expect(ok({ field: "ip", operator: "equals", value: "not-an-ip" })).toBe(false);
    expect(ok({ field: "ip", operator: "in", value: "1.2.3.4" })).toBe(false);
    expect(ok({ field: "ip", operator: "equals", value: ["1.2.3.4"] })).toBe(false);
    expect(ok({ field: "ip", operator: "in", value: [] })).toBe(false);
  });

  it("validates datacenter and burst", () => {
    expect(ok({ field: "is_datacenter", operator: "equals", value: true })).toBe(true);
    expect(ok({ field: "burst", operator: "equals", value: { links: 3, seconds: 10 } })).toBe(true);
    expect(ok({ field: "burst", operator: "equals", value: { links: 1, seconds: 10 } })).toBe(false);
    expect(ok({ field: "burst", operator: "equals", value: { links: 3, seconds: 999 } })).toBe(false);
    expect(ok({ field: "burst", operator: "equals", value: true })).toBe(false);
  });
});
