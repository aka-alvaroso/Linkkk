/**
 * Password recovery and password change
 * - POST /auth/forgot-password
 * - POST /auth/reset-password
 * - PUT /user (current password required)
 */

jest.mock("../v2/services/emailService", () => ({
  sendRuleNotificationEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
}));

require("./setup");
const crypto = require("crypto");
const request = require("supertest");
const { app, createTestUser } = require("./helpers");
const prisma = require("../v2/prisma/client");
const { sendPasswordResetEmail } = require("../v2/services/emailService");

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// The token is issued after the response is sent, so wait for the email call
const waitForResetEmail = async (timeoutMs = 3000) => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (sendPasswordResetEmail.mock.calls.length > 0) {
      return sendPasswordResetEmail.mock.calls[0][0];
    }
    await sleep(25);
  }
  return null;
};

const tokenFromUrl = (resetUrl) => new URL(resetUrl).searchParams.get("token");

const uniqueUser = async () => {
  const stamp = `${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
  return createTestUser(`test_reset_${stamp}`, `reset_${stamp}@example.com`);
};

// Issues a real token through the public endpoint and returns it
const requestToken = async (email) => {
  await request(app).post("/auth/forgot-password").send({ email }).expect(200);
  const call = await waitForResetEmail();
  expect(call).not.toBeNull();
  return tokenFromUrl(call.resetUrl);
};

describe("Password recovery", () => {
  describe("POST /auth/forgot-password", () => {
    it("answers the same for an unknown address and sends nothing", async () => {
      const response = await request(app)
        .post("/auth/forgot-password")
        .send({ email: `nobody_${Date.now()}@example.com` })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({ requested: true });

      await sleep(300);
      expect(sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it("rejects a malformed address", async () => {
      const response = await request(app)
        .post("/auth/forgot-password")
        .send({ email: "not-an-email" })
        .expect(400);

      expect(response.body.code).toBe("INVALID_DATA");
    });

    it("emails a single-use link and stores only the token hash", async () => {
      const { user } = await uniqueUser();

      const response = await request(app)
        .post("/auth/forgot-password")
        .send({ email: user.email.toUpperCase(), locale: "en" })
        .expect(200);
      expect(response.body.data).toEqual({ requested: true });

      const call = await waitForResetEmail();
      expect(call).not.toBeNull();
      expect(call.toEmail).toBe(user.email);
      expect(call.locale).toBe("en");

      const token = tokenFromUrl(call.resetUrl);
      expect(token).toMatch(/^[a-f0-9]{64}$/);

      const stored = await prisma.passwordResetToken.findMany({
        where: { userId: user.id },
      });
      expect(stored).toHaveLength(1);
      expect(stored[0].tokenHash).toBe(sha256(token));
      expect(stored[0].tokenHash).not.toBe(token);
      expect(stored[0].usedAt).toBeNull();
      expect(stored[0].expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it("does not send a second email inside the cooldown", async () => {
      const { user } = await uniqueUser();

      await requestToken(user.email);
      await request(app)
        .post("/auth/forgot-password")
        .send({ email: user.email })
        .expect(200);
      await sleep(300);

      expect(sendPasswordResetEmail).toHaveBeenCalledTimes(1);
      const stored = await prisma.passwordResetToken.count({
        where: { userId: user.id },
      });
      expect(stored).toBe(1);
    });
  });

  describe("POST /auth/reset-password", () => {
    it("sets the new password, signs old sessions out and burns the token", async () => {
      const { user, token: oldSession, password: oldPassword } = await uniqueUser();
      const newPassword = "Brand-New-Pass1!";

      // The existing session works before the reset
      await request(app)
        .get("/auth/validate")
        .set("Cookie", `token=${oldSession}`)
        .expect(200);

      const token = await requestToken(user.email);

      const response = await request(app)
        .post("/auth/reset-password")
        .send({ token, password: newPassword })
        .expect(200);
      expect(response.body.data).toEqual({ reset: true });

      // Old session no longer valid
      await request(app)
        .get("/auth/validate")
        .set("Cookie", `token=${oldSession}`)
        .expect(401);

      // Old password no longer valid
      await request(app)
        .post("/auth/login")
        .send({ usernameOrEmail: user.email, password: oldPassword })
        .expect(401);

      // Token is single-use
      const reuse = await request(app)
        .post("/auth/reset-password")
        .send({ token, password: "Another-Pass2!" })
        .expect(400);
      expect(reuse.body.code).toBe("INVALID_RESET_TOKEN");
      expect(
        await prisma.passwordResetToken.count({ where: { userId: user.id } })
      ).toBe(0);

      // Sessions are cut off at the next full second (JWT iat resolution)
      await sleep(1100);
      const login = await request(app)
        .post("/auth/login")
        .send({ usernameOrEmail: user.email, password: newPassword })
        .expect(200);

      const cookie = login.headers["set-cookie"].find((c) => c.startsWith("token="));
      await request(app)
        .get("/auth/validate")
        .set("Cookie", cookie.split(";")[0])
        .expect(200);
    });

    it("rejects an expired token", async () => {
      const { user } = await uniqueUser();
      const token = await requestToken(user.email);

      await prisma.passwordResetToken.updateMany({
        where: { userId: user.id },
        data: { expiresAt: new Date(Date.now() - 1000) },
      });

      const response = await request(app)
        .post("/auth/reset-password")
        .send({ token, password: "Brand-New-Pass1!" })
        .expect(400);
      expect(response.body.code).toBe("INVALID_RESET_TOKEN");
    });

    it("rejects unknown and malformed tokens the same way", async () => {
      const unknown = await request(app)
        .post("/auth/reset-password")
        .send({ token: crypto.randomBytes(32).toString("hex"), password: "Brand-New-Pass1!" })
        .expect(400);
      expect(unknown.body.code).toBe("INVALID_RESET_TOKEN");

      const malformed = await request(app)
        .post("/auth/reset-password")
        .send({ token: "nope", password: "Brand-New-Pass1!" })
        .expect(400);
      expect(malformed.body.code).toBe("INVALID_RESET_TOKEN");
    });

    it("rejects a weak password without consuming the token", async () => {
      const { user } = await uniqueUser();
      const token = await requestToken(user.email);

      const weak = await request(app)
        .post("/auth/reset-password")
        .send({ token, password: "short" })
        .expect(400);
      expect(weak.body.code).toBe("INVALID_DATA");

      await request(app)
        .post("/auth/reset-password")
        .send({ token, password: "Brand-New-Pass1!" })
        .expect(200);
    });

    it("lets only one of two simultaneous requests use the token", async () => {
      const { user } = await uniqueUser();
      const token = await requestToken(user.email);

      const results = await Promise.all([
        request(app).post("/auth/reset-password").send({ token, password: "First-Pass-1!" }),
        request(app).post("/auth/reset-password").send({ token, password: "Second-Pass-2!" }),
      ]);

      const statuses = results.map((r) => r.status).sort();
      expect(statuses).toEqual([200, 400]);
    });
  });
});

describe("PUT /user password change", () => {
  it("requires the current password", async () => {
    const { token } = await uniqueUser();

    const response = await request(app)
      .put("/user")
      .set("Cookie", `token=${token}`)
      .send({ password: "Brand-New-Pass1!" })
      .expect(400);

    expect(response.body.code).toBe("CURRENT_PASSWORD_REQUIRED");
  });

  it("rejects a wrong current password and leaves the password unchanged", async () => {
    const { user, token, password } = await uniqueUser();

    const response = await request(app)
      .put("/user")
      .set("Cookie", `token=${token}`)
      .send({ password: "Brand-New-Pass1!", currentPassword: "Wrong-Pass-9!" })
      .expect(400);
    expect(response.body.code).toBe("CURRENT_PASSWORD_INVALID");

    await request(app)
      .post("/auth/login")
      .send({ usernameOrEmail: user.email, password })
      .expect(200);
  });

  it("changes it, keeps this session and signs the others out", async () => {
    const { token: oldSession, password } = await uniqueUser();

    const response = await request(app)
      .put("/user")
      .set("Cookie", `token=${oldSession}`)
      .send({ password: "Brand-New-Pass1!", currentPassword: password })
      .expect(200);

    expect(response.body.data).not.toHaveProperty("password");
    expect(response.body.data).not.toHaveProperty("passwordChangedAt");

    // This browser gets a fresh session cookie
    const cookie = response.headers["set-cookie"].find((c) => c.startsWith("token="));
    expect(cookie).toBeDefined();
    await request(app)
      .get("/auth/validate")
      .set("Cookie", cookie.split(";")[0])
      .expect(200);

    // Any other session, which still holds the old token, is out
    await request(app)
      .get("/auth/validate")
      .set("Cookie", `token=${oldSession}`)
      .expect(401);
  });

  it("lets an OAuth account without a password set one", async () => {
    const stamp = `${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
    const { user, token } = await createTestUser(
      `test_oauth_${stamp}`,
      `oauth_${stamp}@example.com`
    );
    await prisma.user.update({ where: { id: user.id }, data: { password: null } });

    await request(app)
      .put("/user")
      .set("Cookie", `token=${token}`)
      .send({ password: "Brand-New-Pass1!" })
      .expect(200);
  });

  it("does not ask for the password to change other fields", async () => {
    const { token } = await uniqueUser();
    const stamp = `${Date.now()}_${Math.floor(Math.random() * 1e6)}`;

    await request(app)
      .put("/user")
      .set("Cookie", `token=${token}`)
      .send({ username: `test_renamed_${stamp}`.slice(0, 25) })
      .expect(200);
  });
});
