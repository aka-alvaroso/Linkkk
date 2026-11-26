/**
 * Banned accounts (User.blockedAt)
 * A banned account cannot sign in by any method, cannot recover its password,
 * loses every existing session, and its links stop redirecting.
 */

jest.mock("../v2/services/emailService", () => ({
  sendRuleNotificationEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
}));

jest.mock("../v2/services/googleOAuth", () => ({
  getAuthorizationUrl: jest.fn(() => "https://accounts.google.test/auth"),
  exchangeCodeForToken: jest.fn(),
  getUserInfo: jest.fn(),
}));

jest.mock("../v2/services/githubOAuth", () => ({
  getAuthorizationUrl: jest.fn(() => "https://github.test/login/oauth"),
  exchangeCodeForToken: jest.fn(),
  getUserInfo: jest.fn(),
}));

require("./setup");
const crypto = require("crypto");
const request = require("supertest");
const { app, createTestUser, createTestLink } = require("./helpers");
const prisma = require("../v2/prisma/client");
const { sendPasswordResetEmail } = require("../v2/services/emailService");
const googleOAuthService = require("../v2/services/googleOAuth");
const githubOAuthService = require("../v2/services/githubOAuth");

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const uniqueUser = async (password) => {
  const stamp = `${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
  return createTestUser(
    `test_ban_${stamp}`,
    `ban_${stamp}@example.com`,
    password
  );
};

const ban = (userId) =>
  prisma.user.update({
    where: { id: userId },
    data: { blockedAt: new Date(), blockedReason: "test: phishing" },
  });

const tokenCookie = (response) =>
  (response.headers["set-cookie"] || []).find((c) => c.startsWith("token="));

// Runs an OAuth callback with a valid state and the mocked provider profile
const oauthCallback = (provider, profile) => {
  const service = provider === "google" ? googleOAuthService : githubOAuthService;
  service.exchangeCodeForToken.mockResolvedValue({ access_token: "at" });
  service.getUserInfo.mockResolvedValue(profile);
  const state = crypto.randomBytes(32).toString("hex");
  return request(app)
    .get(`/auth/callback/${provider}`)
    .query({ code: "code", state })
    .set("Cookie", [`oauth_state=${state}`]);
};

describe("Account ban", () => {
  describe("password login", () => {
    it("rejects a banned account with the same answer as a wrong password", async () => {
      const { user, password } = await uniqueUser();
      await ban(user.id);

      const banned = await request(app)
        .post("/auth/login")
        .send({ usernameOrEmail: user.email, password })
        .expect(401);

      const wrong = await request(app)
        .post("/auth/login")
        .send({ usernameOrEmail: user.email, password: "Wrong123!" })
        .expect(401);

      expect(banned.body.code).toBe("INVALID_CREDENTIALS");
      expect(banned.body).toEqual(wrong.body);
      expect(tokenCookie(banned)).toBeUndefined();
    });

    it("still lets an account that is not banned sign in", async () => {
      const { user, password } = await uniqueUser();

      const response = await request(app)
        .post("/auth/login")
        .send({ usernameOrEmail: user.email, password })
        .expect(200);

      expect(tokenCookie(response)).toBeDefined();
    });
  });

  describe("existing sessions", () => {
    it("stop working as soon as the account is banned", async () => {
      const { user, token } = await uniqueUser();

      await request(app)
        .get("/link")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      await ban(user.id);

      await request(app)
        .get("/link")
        .set("Authorization", `Bearer ${token}`)
        .expect(401);

      const validate = await request(app)
        .get("/auth/validate")
        .set("Authorization", `Bearer ${token}`);
      expect(validate.body.data?.user).toBeUndefined();
    });
  });

  describe("password recovery", () => {
    it("forgot-password answers as usual but issues nothing for a banned account", async () => {
      const { user } = await uniqueUser();
      await ban(user.id);

      const response = await request(app)
        .post("/auth/forgot-password")
        .send({ email: user.email })
        .expect(200);

      expect(response.body.data).toEqual({ requested: true });

      await sleep(300);
      expect(sendPasswordResetEmail).not.toHaveBeenCalled();
      expect(
        await prisma.passwordResetToken.count({ where: { userId: user.id } })
      ).toBe(0);
    });

    it("reset-password refuses a link issued before the ban", async () => {
      const { user, password } = await uniqueUser();
      const token = crypto.randomBytes(32).toString("hex");
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: sha256(token),
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      });
      await ban(user.id);

      const response = await request(app)
        .post("/auth/reset-password")
        .send({ token, password: "BrandNew123!" })
        .expect(400);

      expect(response.body.code).toBe("INVALID_RESET_TOKEN");

      // The password did not change and the link is gone
      await request(app)
        .post("/auth/login")
        .send({ usernameOrEmail: user.email, password: "BrandNew123!" })
        .expect(401);
      const stored = await prisma.user.findUnique({ where: { id: user.id } });
      expect(stored.password).toBe(user.password);
      expect(
        await prisma.passwordResetToken.count({ where: { userId: user.id } })
      ).toBe(0);
      // Original password still fails too (account is banned)
      await request(app)
        .post("/auth/login")
        .send({ usernameOrEmail: user.email, password })
        .expect(401);
    });
  });

  describe.each(["google", "github"])("%s OAuth callback", (provider) => {
    it("does not sign in a banned account linked to the provider", async () => {
      const { user } = await uniqueUser();
      const oauthId = `oid_${Date.now()}_${Math.random()}`;
      await prisma.user.update({
        where: { id: user.id },
        data: { oauthProvider: provider, oauthId },
      });
      await ban(user.id);

      const response = await oauthCallback(provider, {
        id: oauthId,
        email: user.email,
        name: user.username,
      }).expect(302);

      expect(response.headers.location).toMatch(
        /\/auth\/login\?error=oauth_failed$/
      );
      expect(tokenCookie(response)).toBeUndefined();
    });

    it("does not offer account linking for a banned account's email", async () => {
      const { user } = await uniqueUser();
      await ban(user.id);

      const response = await oauthCallback(provider, {
        id: `new_${Date.now()}_${Math.random()}`,
        email: user.email,
        name: user.username,
      }).expect(302);

      expect(response.headers.location).toMatch(
        /\/auth\/login\?error=oauth_failed$/
      );
      const cookies = response.headers["set-cookie"] || [];
      expect(cookies.some((c) => c.startsWith("oauth_link_token="))).toBe(false);
      expect(tokenCookie(response)).toBeUndefined();
    });
  });

  describe("OAuth account linking", () => {
    it("rejects linking into a banned account even with the right password", async () => {
      const { user, password } = await uniqueUser();
      await ban(user.id);

      const jwt = require("jsonwebtoken");
      const config = require("../v2/config/environment");
      const linkingToken = jwt.sign(
        {
          provider: "google",
          oauthId: `oid_${Date.now()}`,
          email: user.email,
          name: user.username,
          type: "oauth_link",
        },
        config.security.jwt.authSecret,
        { expiresIn: "10m" }
      );

      const response = await request(app)
        .post("/auth/link-oauth")
        .set("Cookie", [`oauth_link_token=${linkingToken}`])
        .send({ password })
        .expect(401);

      expect(response.body.code).toBe("INVALID_CREDENTIALS");
      expect(tokenCookie(response)).toBeUndefined();
      const stored = await prisma.user.findUnique({ where: { id: user.id } });
      expect(stored.oauthProvider).toBeNull();
    });
  });

  describe("redirects", () => {
    it("sends links of a banned account to /disabled", async () => {
      const { user } = await uniqueUser();
      const link = await createTestLink(user.id, null, "https://phish.example");
      await ban(user.id);

      const response = await request(app).get(`/r/${link.shortUrl}`).expect(302);

      expect(response.headers.location).toMatch(/\/disabled$/);
      expect(await prisma.access.count({ where: { linkId: link.id } })).toBe(0);
    });

    it("keeps redirecting links of an account that is not banned", async () => {
      const { user } = await uniqueUser();
      const link = await createTestLink(user.id, null, "https://ok.example");

      const response = await request(app).get(`/r/${link.shortUrl}`).expect(302);

      expect(response.headers.location).toBe("https://ok.example");
    });

    it("refuses the password gate of a banned account's link", async () => {
      const { user, token } = await uniqueUser();
      const link = await createTestLink(user.id, null, "https://phish.example");
      await request(app)
        .post(`/link/${link.shortUrl}/rules`)
        .set("Cookie", `token=${token}`)
        .send({
          priority: 1,
          conditions: [],
          action: {
            type: "password_gate",
            settings: { passwordHash: "secret123" },
          },
        })
        .expect(201);

      // The right password opens the gate before the ban...
      await request(app)
        .post(`/link/${link.shortUrl}/verify-password`)
        .send({ password: "secret123" })
        .expect(200);

      await ban(user.id);

      // ...and not after it
      const response = await request(app)
        .post(`/link/${link.shortUrl}/verify-password`)
        .send({ password: "secret123" })
        .expect(403);

      expect(response.body.code).toBe("ACCESS_DENIED");
      expect(response.body.data?.url).toBeUndefined();
    });
  });
});
