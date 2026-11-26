/**
 * @jest-environment node
 */

const { matchAbusedFreeHost, freeHostWarning, accountAgeDays } = require("../../v2/utils/linkAbuse");
const { recordLinkHit, _reset } = require("../../v2/utils/linkBurstAlert");

const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;
const NOW = Date.parse("2026-11-26T12:00:00Z");

describe("matchAbusedFreeHost", () => {
  it.each([
    ["https://letreco.wasmer.app/", "wasmer.app"],
    ["https://letreco-app.wasmer.app/login?x=1", "wasmer.app"],
    ["https://foo.pages.dev", "pages.dev"],
    ["https://a.b.workers.dev/x", "workers.dev"],
    ["https://my-site.web.app", "web.app"],
    ["https://x.netlify.app", "netlify.app"],
    ["https://x.vercel.app.", "vercel.app"],
    ["https://X.Vercel.App", "vercel.app"],
  ])("%s → %s", (url, suffix) => {
    expect(matchAbusedFreeHost(url)).toBe(suffix);
  });

  it.each([
    "https://example.com",
    "https://notwasmer.app",
    "https://wasmer.app.evil.com",
    "https://vercel.com",
    "not a url",
  ])("%s → null", (url) => {
    expect(matchAbusedFreeHost(url)).toBeNull();
  });
});

describe("freeHostWarning", () => {
  beforeEach(() => delete process.env.ABUSE_NEW_ACCOUNT_DAYS);

  it("warns for a 1-day-old account on a free host", () => {
    const createdAt = new Date(NOW - 1 * DAY - HOUR);
    expect(freeHostWarning("https://letreco.wasmer.app/", createdAt, NOW)).toEqual({
      suffix: "wasmer.app",
      accountAgeDays: 1,
    });
  });

  it("warns for guests (no account date)", () => {
    expect(freeHostWarning("https://x.pages.dev", null, NOW)).toEqual({
      suffix: "pages.dev",
      accountAgeDays: 0,
    });
  });

  it("does not warn for established accounts", () => {
    const createdAt = new Date(NOW - 30 * DAY);
    expect(freeHostWarning("https://x.pages.dev", createdAt, NOW)).toBeNull();
  });

  it("respects ABUSE_NEW_ACCOUNT_DAYS", () => {
    process.env.ABUSE_NEW_ACCOUNT_DAYS = "60";
    const createdAt = new Date(NOW - 30 * DAY);
    expect(freeHostWarning("https://x.pages.dev", createdAt, NOW)).not.toBeNull();
  });

  it("does not warn for other hosts, even for brand-new accounts", () => {
    expect(freeHostWarning("https://example.com", new Date(NOW), NOW)).toBeNull();
  });
});

describe("accountAgeDays", () => {
  it("floors to whole days and handles missing dates", () => {
    expect(accountAgeDays(new Date(NOW - 2.9 * DAY), NOW)).toBe(2);
    expect(accountAgeDays(null, NOW)).toBe(0);
    expect(accountAgeDays("garbage", NOW)).toBe(0);
  });
});

describe("recordLinkHit (burst alert)", () => {
  const youngOwner = new Date(NOW - 1 * DAY);
  const link = { id: 42 };

  beforeEach(() => {
    _reset();
    delete process.env.ABUSE_BURST_THRESHOLD;
    delete process.env.ABUSE_BURST_ACCOUNT_DAYS;
    delete process.env.ABUSE_BURST_COOLDOWN_HOURS;
  });

  const hit = (at, extra = {}) =>
    recordLinkHit(link, { ownerCreatedAt: youngOwner, country: "FR", isBot: false, ...extra }, at);

  it("alerts once when a young account's link reaches 30 hits in an hour", () => {
    const results = [];
    for (let i = 0; i < 35; i++) results.push(hit(NOW + i * 1000));

    const alerts = results.filter(Boolean);
    expect(alerts).toHaveLength(1);
    expect(results[28]).toBeNull();
    expect(results[29]).toMatchObject({ count: 30 });
  });

  it("reports bot count and top countries", () => {
    let alert = null;
    for (let i = 0; i < 30; i++) {
      const country = i < 18 ? "FR" : i < 27 ? "US" : "IE";
      alert = hit(NOW + i, { country, isBot: i % 3 === 0 }) || alert;
    }
    expect(alert.botCount).toBe(10);
    expect(alert.topCountries).toEqual([
      { country: "FR", count: 18 },
      { country: "US", count: 9 },
      { country: "IE", count: 3 },
    ]);
  });

  it("only counts hits within the last hour", () => {
    for (let i = 0; i < 29; i++) hit(NOW + i);
    // An hour later the old hits have aged out
    expect(hit(NOW + HOUR + 1000)).toBeNull();
  });

  it("alerts again after the cooldown", () => {
    process.env.ABUSE_BURST_COOLDOWN_HOURS = "2";
    for (let i = 0; i < 30; i++) hit(NOW + i);
    for (let i = 0; i < 30; i++) expect(hit(NOW + HOUR + i)).toBeNull();

    const later = NOW + 2 * HOUR + 10;
    let alert = null;
    for (let i = 0; i < 30; i++) alert = hit(later + i) || alert;
    expect(alert).not.toBeNull();
  });

  it("ignores links of accounts older than 7 days", () => {
    const oldOwner = new Date(NOW - 8 * DAY);
    for (let i = 0; i < 100; i++) {
      expect(recordLinkHit(link, { ownerCreatedAt: oldOwner, country: "FR" }, NOW + i)).toBeNull();
    }
  });

  it("watches guest links (no owner date)", () => {
    let alert = null;
    for (let i = 0; i < 30; i++) alert = recordLinkHit(link, { ownerCreatedAt: null }, NOW + i) || alert;
    expect(alert).toMatchObject({ count: 30, topCountries: [{ country: "??", count: 30 }] });
  });

  it("respects ABUSE_BURST_THRESHOLD", () => {
    process.env.ABUSE_BURST_THRESHOLD = "5";
    const results = [];
    for (let i = 0; i < 5; i++) results.push(hit(NOW + i));
    expect(results[4]).toMatchObject({ count: 5 });
  });

  it("tracks links independently", () => {
    for (let i = 0; i < 29; i++) hit(NOW + i);
    const other = recordLinkHit({ id: 43 }, { ownerCreatedAt: youngOwner }, NOW + 100);
    expect(other).toBeNull();
    expect(hit(NOW + 200)).toMatchObject({ count: 30 });
  });
});
