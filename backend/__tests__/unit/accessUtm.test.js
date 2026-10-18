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
const { extractUtm, sanitizeQueryParams } = require("../../v2/utils/queryParamsSanitizer");

const BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120 Safari/537.36";

describe("extractUtm", () => {
  it("returns all five columns as null when there are no params", () => {
    expect(extractUtm({})).toEqual({
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmTerm: null,
      utmContent: null,
    });
    expect(extractUtm(undefined).utmSource).toBeNull();
  });

  it("maps utm_* params to columns and lowercases them", () => {
    const utm = extractUtm({
      utm_source: "Newsletter",
      utm_medium: "EMAIL",
      utm_campaign: "Black-Friday",
      utm_term: "shoes",
      utm_content: "Blue-Button",
      other: "ignored",
    });
    expect(utm).toEqual({
      utmSource: "newsletter",
      utmMedium: "email",
      utmCampaign: "black-friday",
      utmTerm: "shoes",
      utmContent: "blue-button",
    });
  });

  it("caps values at 255 characters", () => {
    expect(extractUtm({ utm_source: "a".repeat(400) }).utmSource).toHaveLength(255);
  });

  it("composes with the sanitizer, dropping unsafe values", () => {
    const { params } = sanitizeQueryParams({ utm_source: "{{evil}}", utm_medium: "social" });
    const utm = extractUtm(params);
    expect(utm.utmSource).toBeNull();
    expect(utm.utmMedium).toBe("social");
  });
});

describe("redirectLink UTM tracking", () => {
  const makeLink = () => ({
    id: 1,
    userId: null,
    shortUrl: "abc123",
    longUrl: "https://example.com",
    status: true,
    accessCount: 0,
    scanCount: 0,
    rules: [],
    customDomain: null,
    metadata: null,
    user: null,
  });

  const run = async (query) => {
    const create = jest.fn();
    prisma.link.findUnique.mockResolvedValue(makeLink());
    prisma.$transaction.mockImplementation(async (fn) =>
      fn({
        access: { create },
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
    return { create, res };
  };

  it("stores the utm_* params on the Access row", async () => {
    const { create, res } = await run({ utm_source: "Instagram", utm_campaign: "summer", foo: "bar" });

    expect(res.redirect).toHaveBeenCalledWith(302, "https://example.com");
    expect(create).toHaveBeenCalledTimes(1);
    expect(create.mock.calls[0][0].data).toMatchObject({
      linkId: 1,
      source: "direct",
      utmSource: "instagram",
      utmMedium: null,
      utmCampaign: "summer",
    });
  });

  it("stores nulls when the visit has no UTM", async () => {
    const { create } = await run({});
    expect(create.mock.calls[0][0].data).toMatchObject({ utmSource: null, utmCampaign: null });
  });
});
