/**
 * @jest-environment node
 *
 * Abuse protections wired into the link controller: Safe Browsing on
 * create/update/redirect, free-host warnings and traffic-burst alerts.
 */

jest.mock("../../v2/config/environment", () => ({
  frontend: { url: "http://frontend.test" },
  nodeEnv: "test",
  env: { isTest: true, isDevelopment: false, isProduction: false },
  security: { trustedProxies: [] },
}));
jest.mock("../../v2/prisma/client", () => ({
  link: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() },
  user: { findUnique: jest.fn() },
  customDomain: { findFirst: jest.fn(), findUnique: jest.fn() },
  group: { findUnique: jest.fn() },
  $transaction: jest.fn(),
}));
jest.mock("../../v2/services/safeBrowsing", () => ({ checkUrl: jest.fn() }));
jest.mock("../../v2/services/telegramService", () => ({
  notifyLinkCreated: jest.fn(),
  notifyFirstClick: jest.fn(),
  notifyUnsafeUrl: jest.fn(),
  notifySuspiciousDestination: jest.fn(),
  notifyLinkBurst: jest.fn(),
}));
jest.mock("../../v2/services/emailService", () => ({ sendRuleNotificationEmail: jest.fn() }));
jest.mock("../../v2/realtime/broadcaster", () => ({ publish: jest.fn() }));
jest.mock("../../v2/utils/logger", () => ({
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
}));

const prisma = require("../../v2/prisma/client");
const safeBrowsing = require("../../v2/services/safeBrowsing");
const telegram = require("../../v2/services/telegramService");
const { _reset: resetBurst } = require("../../v2/utils/linkBurstAlert");
const { createLink, updateLink, redirectLink } = require("../../v2/controllers/link");

const DAY = 24 * 60 * 60 * 1000;
const PHISH = "https://letreco.wasmer.app/";
const BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120 Safari/537.36";

const newUser = () => ({
  id: 7,
  username: "fresh",
  email: "fresh@example.com",
  role: "USER",
  createdAt: new Date(Date.now() - 1 * DAY),
});
const oldUser = () => ({ ...newUser(), createdAt: new Date(Date.now() - 400 * DAY) });

const mockRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  res.redirect = jest.fn();
  res.set = jest.fn();
  res.send = jest.fn();
  return res;
};

const flush = () => new Promise((r) => setImmediate(r));

beforeEach(() => {
  resetBurst();
  safeBrowsing.checkUrl.mockResolvedValue({ flagged: false, threats: [] });
  for (const fn of Object.values(telegram)) fn.mockResolvedValue({ success: true });
  prisma.link.count.mockResolvedValue(0);
  prisma.link.findUnique.mockResolvedValue(null); // short code is free
  prisma.link.create.mockImplementation(async ({ data }) => ({ id: 1, ...data, tags: [] }));
});

describe("createLink", () => {
  const create = async (user, longUrl) => {
    const res = mockRes();
    await createLink({ user, guest: null, body: { longUrl } }, res);
    await flush();
    return res;
  };

  it("rejects a destination flagged by Safe Browsing", async () => {
    safeBrowsing.checkUrl.mockResolvedValue({ flagged: true, threats: ["SOCIAL_ENGINEERING"] });

    const res = await create(newUser(), PHISH);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0]).toMatchObject({ success: false, code: "UNSAFE_DESTINATION_URL" });
    expect(prisma.link.create).not.toHaveBeenCalled();
    expect(telegram.notifyUnsafeUrl).toHaveBeenCalledWith(
      expect.objectContaining({ id: 7 }),
      expect.objectContaining({ stage: "create", longUrl: PHISH, threats: ["SOCIAL_ENGINEERING"] })
    );
  });

  it("creates the link when the check fails open", async () => {
    safeBrowsing.checkUrl.mockResolvedValue({ flagged: false, threats: [], skipped: "timeout" });
    const res = await create(oldUser(), "https://example.com/");
    expect(res.status).toHaveBeenCalledWith(201);
    expect(prisma.link.create).toHaveBeenCalled();
  });

  it("warns (without blocking) when a new account links to a free host", async () => {
    const res = await create(newUser(), PHISH);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(telegram.notifySuspiciousDestination).toHaveBeenCalledWith(
      expect.objectContaining({ id: 7 }),
      expect.objectContaining({ longUrl: PHISH, suffix: "wasmer.app", accountAgeDays: 1, stage: "create" })
    );
  });

  it("does not warn for an established account", async () => {
    await create(oldUser(), PHISH);
    expect(telegram.notifySuspiciousDestination).not.toHaveBeenCalled();
  });

  it("warns for guest links on a free host", async () => {
    const res = mockRes();
    await createLink({ user: null, guest: { guestSessionId: 3 }, body: { longUrl: PHISH } }, res);
    await flush();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(telegram.notifySuspiciousDestination).toHaveBeenCalledWith(
      null,
      expect.objectContaining({ suffix: "wasmer.app" })
    );
  });
});

describe("updateLink", () => {
  const existing = { id: 1, userId: 7, shortUrl: "abc123", longUrl: "https://example.com/" };

  const update = async (user, body) => {
    prisma.link.findUnique.mockResolvedValue(existing);
    prisma.link.update.mockImplementation(async ({ data }) => ({
      ...existing,
      ...data,
      tags: [],
      group: null,
      customDomain: null,
    }));
    const res = mockRes();
    await updateLink({ params: { shortUrl: "abc123" }, user, guest: null, body }, res);
    await flush();
    return res;
  };

  it("rejects a new destination flagged by Safe Browsing", async () => {
    safeBrowsing.checkUrl.mockResolvedValue({ flagged: true, threats: ["MALWARE"] });

    const res = await update(newUser(), { longUrl: PHISH });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0]).toMatchObject({ code: "UNSAFE_DESTINATION_URL" });
    expect(prisma.link.update).not.toHaveBeenCalled();
    expect(telegram.notifyUnsafeUrl).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ stage: "update", shortUrl: "abc123" })
    );
  });

  it("does not re-check when the destination is unchanged", async () => {
    await update(newUser(), { status: false });
    expect(safeBrowsing.checkUrl).not.toHaveBeenCalled();
    expect(telegram.notifySuspiciousDestination).not.toHaveBeenCalled();
  });

  it("warns when a new account switches to a free host", async () => {
    const res = await update(newUser(), { longUrl: PHISH });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(telegram.notifySuspiciousDestination).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ stage: "update", suffix: "wasmer.app" })
    );
  });
});

describe("redirectLink", () => {
  const makeLink = (overrides = {}) => ({
    id: "link-1",
    userId: 7,
    shortUrl: "abc123",
    longUrl: PHISH,
    status: true,
    accessCount: 0,
    scanCount: 0,
    forwardParams: false,
    rules: [],
    customDomain: null,
    metadata: null,
    user: { email: "fresh@example.com", username: "fresh", createdAt: new Date(Date.now() - DAY) },
    guestSession: null,
    ...overrides,
  });

  const visit = async (link, ip = "8.8.8.8") => {
    prisma.link.findUnique.mockResolvedValue(link);
    prisma.$transaction.mockImplementation(async (fn) =>
      fn({
        access: { create: jest.fn() },
        link: { update: jest.fn().mockResolvedValue({ accessCount: 5, scanCount: 0 }) },
      })
    );
    const res = mockRes();
    await redirectLink(
      {
        params: { shortUrl: "abc123" },
        headers: { "user-agent": BROWSER_UA, host: "localhost:3000" },
        query: {},
        ip,
        socket: { remoteAddress: ip },
      },
      res
    );
    await flush();
    return res;
  };

  it("redirects normally to a clean destination", async () => {
    const res = await visit(makeLink({ longUrl: "https://example.com/" }));
    expect(res.redirect).toHaveBeenCalledWith(302, "https://example.com/");
  });

  it("blocks a destination flagged after creation and alerts once", async () => {
    safeBrowsing.checkUrl.mockResolvedValue({ flagged: true, threats: ["SOCIAL_ENGINEERING"] });

    const res = await visit(makeLink({ id: "flagged-1" }));
    await visit(makeLink({ id: "flagged-1" }));

    expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining("http://frontend.test/blocked?url=abc123"));
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(safeBrowsing.checkUrl).toHaveBeenCalledWith(PHISH, expect.objectContaining({ timeoutMs: expect.any(Number) }));
    expect(telegram.notifyUnsafeUrl).toHaveBeenCalledTimes(1);
    expect(telegram.notifyUnsafeUrl).toHaveBeenCalledWith(
      expect.objectContaining({ username: "fresh" }),
      expect.objectContaining({ stage: "redirect" })
    );
  });

  it("checks the URL of a redirect rule rather than the default destination", async () => {
    const ruleUrl = "https://other.example/";
    const link = makeLink({
      longUrl: "https://example.com/",
      rules: [
        {
          id: "r1",
          priority: 0,
          enabled: true,
          match: "AND",
          conditions: [],
          actionType: "redirect",
          actionSettings: { url: ruleUrl },
        },
      ],
    });
    await visit(link);
    expect(safeBrowsing.checkUrl).toHaveBeenCalledWith(ruleUrl, expect.anything());
  });

  it("sends one burst alert when a new account's link passes 30 hits/hour", async () => {
    for (let i = 0; i < 35; i++) await visit(makeLink({ id: "burst-1" }), `10.0.0.${i}`);

    expect(telegram.notifyLinkBurst).toHaveBeenCalledTimes(1);
    expect(telegram.notifyLinkBurst).toHaveBeenCalledWith(
      expect.objectContaining({ username: "fresh" }),
      expect.objectContaining({
        shortUrl: "abc123",
        longUrl: PHISH,
        count: 30,
        accountAgeDays: 1,
        topCountries: [{ country: "US", count: 30 }],
      })
    );
  });

  it("does not track bursts for established accounts", async () => {
    const link = makeLink({
      id: "old-1",
      user: { email: "o@example.com", username: "old", createdAt: new Date(Date.now() - 400 * DAY) },
    });
    for (let i = 0; i < 35; i++) await visit(link);
    expect(telegram.notifyLinkBurst).not.toHaveBeenCalled();
  });
});
