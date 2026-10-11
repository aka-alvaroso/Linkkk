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
const { sendRuleNotificationEmail } = require("../../v2/services/emailService");
const { redirectLink } = require("../../v2/controllers/link");

const BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120 Safari/537.36";
const BOT_UA = "Googlebot/2.1 (+http://www.google.com/bot.html)";

const notifyRule = (id, priority) => ({
  id,
  priority,
  enabled: true,
  match: "AND",
  conditions: [],
  actionType: "notify",
  actionSettings: { sendEmail: true },
});

const blockBotRule = {
  id: "block",
  priority: 1,
  enabled: true,
  match: "AND",
  conditions: [{ field: "is_bot", operator: "equals", value: true }],
  actionType: "block_access",
  actionSettings: { reason: "bots" },
};

const makeLink = (rules) => ({
  id: "link-1",
  userId: "user-1",
  shortUrl: "abc123",
  longUrl: "https://example.com",
  status: true,
  accessCount: 4,
  scanCount: 0,
  rules,
  customDomain: null,
  metadata: null,
  user: { email: "owner@example.com" },
});

beforeEach(() => {
  sendRuleNotificationEmail.mockResolvedValue(undefined);
});

const run = async (rules, userAgent) => {
  prisma.link.findUnique.mockResolvedValue(makeLink(rules));
  prisma.$transaction.mockImplementation(async (fn) =>
    fn({
      access: { create: jest.fn() },
      link: { update: jest.fn().mockResolvedValue({ accessCount: 5, scanCount: 0 }) },
    })
  );
  const req = {
    params: { shortUrl: "abc123" },
    headers: { "user-agent": userAgent, host: "localhost:3000" },
    query: {},
    ip: "8.8.8.8",
    socket: { remoteAddress: "8.8.8.8" },
  };
  const res = { redirect: jest.fn(), set: jest.fn(), status: jest.fn().mockReturnThis(), send: jest.fn() };
  await redirectLink(req, res);
  return res;
};

describe("redirectLink with a non-terminal notify", () => {
  it("emails with the real ruleId of each notify and redirects a human", async () => {
    const res = await run([notifyRule("n1", 0), notifyRule("n2", 2), blockBotRule], BROWSER_UA);

    expect(sendRuleNotificationEmail.mock.calls.map(([a]) => a.ruleId)).toEqual(["n1", "n2"]);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith(302, "https://example.com");
  });

  it("serves the bot preview without notifying or tracking", async () => {
    const res = await run([notifyRule("n1", 0), blockBotRule], BOT_UA);

    expect(sendRuleNotificationEmail).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(res.send).toHaveBeenCalled();
  });
});
