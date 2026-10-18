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
const { redirectLink } = require("../../v2/controllers/link");
const { appendParams } = require("../../v2/utils/forwardParams");

const BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120 Safari/537.36";
const BOT_UA = "Googlebot/2.1 (+http://www.google.com/bot.html)";

describe("appendParams", () => {
  it("adds a query string to a URL that has none", () => {
    expect(appendParams("https://example.com/page", { utm_source: "email" })).toBe(
      "https://example.com/page?utm_source=email"
    );
  });

  it("appends to an existing query without rewriting it", () => {
    expect(appendParams("https://example.com/?q=a%20b", { utm_source: "email" })).toBe(
      "https://example.com/?q=a%20b&utm_source=email"
    );
  });

  it("lets the destination's own param win", () => {
    expect(
      appendParams("https://example.com/?utm_source=site", { utm_source: "email", utm_medium: "mail" })
    ).toBe("https://example.com/?utm_source=site&utm_medium=mail");
  });

  it("keeps the hash after the query", () => {
    expect(appendParams("https://example.com/page#top", { a: "1" })).toBe(
      "https://example.com/page?a=1#top"
    );
  });

  it("handles a trailing ? or &", () => {
    expect(appendParams("https://example.com/?", { a: "1" })).toBe("https://example.com/?a=1");
    expect(appendParams("https://example.com/?x=1&", { a: "1" })).toBe("https://example.com/?x=1&a=1");
  });

  it("encodes keys and values", () => {
    expect(appendParams("https://example.com", { note: "a b&c=d" })).toBe(
      "https://example.com?note=a%20b%26c%3Dd"
    );
  });

  it("returns the URL untouched when there is nothing to add or it is invalid", () => {
    expect(appendParams("https://example.com", {})).toBe("https://example.com");
    expect(appendParams("https://example.com/?a=1", { a: "2" })).toBe("https://example.com/?a=1");
    expect(appendParams("not a url", { a: "1" })).toBe("not a url");
  });
});

describe("redirectLink forwardParams", () => {
  const makeLink = (overrides = {}) => ({
    id: 1,
    userId: null,
    shortUrl: "abc123",
    longUrl: "https://example.com/landing?ref=1",
    status: true,
    forwardParams: false,
    accessCount: 0,
    scanCount: 0,
    rules: [],
    customDomain: null,
    metadata: null,
    user: null,
    ...overrides,
  });

  const run = async (linkOverrides, query, userAgent = BROWSER_UA) => {
    prisma.link.findUnique.mockResolvedValue(makeLink(linkOverrides));
    prisma.$transaction.mockImplementation(async (fn) =>
      fn({
        access: { create: jest.fn() },
        link: { update: jest.fn().mockResolvedValue({ accessCount: 1, scanCount: 0 }) },
      })
    );
    const req = {
      params: { shortUrl: "abc123" },
      headers: { "user-agent": userAgent, host: "localhost:3000" },
      query,
      ip: "8.8.8.8",
      socket: { remoteAddress: "8.8.8.8" },
    };
    const res = { redirect: jest.fn(), set: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };
    await redirectLink(req, res);
    return res;
  };

  it("does not forward params by default", async () => {
    const res = await run({}, { utm_source: "email" });
    expect(res.redirect).toHaveBeenCalledWith(302, "https://example.com/landing?ref=1");
  });

  it("forwards the sanitized params when enabled", async () => {
    const res = await run({ forwardParams: true }, { utm_source: "email", src: "qr", "bad[key]": "x" });
    expect(res.redirect).toHaveBeenCalledWith(
      302,
      "https://example.com/landing?ref=1&utm_source=email"
    );
  });

  it("never forwards the reserved src param", async () => {
    const res = await run({ forwardParams: true }, { src: "qr" });
    expect(res.redirect).toHaveBeenCalledWith(302, "https://example.com/landing?ref=1");
  });

  it("forwards params in the continue link of the bot preview page", async () => {
    const res = await run({ forwardParams: true }, { utm_source: "email" }, BOT_UA);
    const html = res.send.mock.calls[0][0];
    expect(html).toContain("https://example.com/landing?ref=1&amp;utm_source=email");
  });
});
