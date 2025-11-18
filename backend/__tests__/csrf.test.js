/**
 * CSRF Protection Tests
 * Tests for CSRF token generation and validation
 */

require("./setup");
const request = require("supertest");
const { app, createTestUser, getCsrfToken } = require("./helpers");

describe("CSRF Protection", () => {
  // Save original NODE_ENV
  const originalEnv = process.env.NODE_ENV;

  afterAll(() => {
    // Restore NODE_ENV
    process.env.NODE_ENV = originalEnv;
  });

  describe("CSRF Token Generation", () => {
    it("should generate CSRF token on /csrf-token endpoint", async () => {
      const response = await request(app).get("/csrf-token").expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.csrfToken).toBeDefined();
      expect(response.body.csrfToken).toMatch(/^[a-f0-9]{64}$/); // 32 bytes hex = 64 chars
    });

    it("should set csrfToken cookie", async () => {
      const response = await request(app).get("/csrf-token");

      const cookies = response.headers["set-cookie"];
      expect(cookies).toBeDefined();

      const csrfCookie = cookies.find((c) => c.startsWith("csrfToken="));
      expect(csrfCookie).toBeDefined();
      expect(csrfCookie).toContain("HttpOnly");
      expect(csrfCookie).toContain("SameSite=Strict");
    });
  });

  describe("CSRF Protection in Production Mode", () => {
    beforeAll(() => {
      // Temporarily set to production mode
      process.env.NODE_ENV = "production";
    });

    afterAll(() => {
      // Restore test mode
      process.env.NODE_ENV = "test";
    });

    it("should reject POST request without CSRF token", async () => {
      const timestamp = Date.now();
      const { token } = await createTestUser(
        `csrf_test_${timestamp}`,
        `csrf_${timestamp}@example.com`
      );

      const response = await request(app)
        .post("/link")
        .set("Cookie", `token=${token}`)
        .send({
          longUrl: "https://example.com",
        })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe("CSRF_TOKEN_MISSING");
    });

    it("should reject request with mismatched CSRF tokens", async () => {
      const timestamp = Date.now();
      const { token } = await createTestUser(
        `csrf_test_${timestamp}`,
        `csrf_${timestamp}@example.com`
      );

      const { csrfToken, cookies } = await getCsrfToken();

      const response = await request(app)
        .post("/link")
        .set("Cookie", [
          `token=${token}`,
          cookies[0], // csrfToken cookie
        ])
        .set("X-CSRF-Token", "wrong-token-value") // Wrong token in header
        .send({
          longUrl: "https://example.com",
        })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe("CSRF_TOKEN_INVALID");
    });

    it("should accept request with valid CSRF token", async () => {
      const timestamp = Date.now();
      const { token } = await createTestUser(
        `csrf_test_${timestamp}`,
        `csrf_${timestamp}@example.com`
      );

      const { csrfToken, cookies } = await getCsrfToken();

      const response = await request(app)
        .post("/link")
        .set("Cookie", [
          `token=${token}`,
          cookies[0], // csrfToken cookie
        ])
        .set("X-CSRF-Token", csrfToken) // Correct token in header
        .send({
          longUrl: "https://example.com",
        })
        .expect(201); // POST /link returns 201 Created

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("shortUrl");
    });

    it("should allow GET requests without CSRF token", async () => {
      const timestamp = Date.now();
      const { token } = await createTestUser(
        `csrf_test_${timestamp}`,
        `csrf_${timestamp}@example.com`
      );

      // GET requests should work without CSRF
      const response = await request(app)
        .get("/link")
        .set("Cookie", `token=${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe("CSRF Bypass in Test Mode", () => {
    it("should bypass CSRF in test environment", async () => {
      // In test mode, CSRF is bypassed
      expect(process.env.NODE_ENV).toBe("test");

      const timestamp = Date.now();
      const { token } = await createTestUser(
        `csrf_test_${timestamp}`,
        `csrf_${timestamp}@example.com`
      );

      // Should work without CSRF token in test mode
      const response = await request(app)
        .post("/link")
        .set("Cookie", `token=${token}`)
        .send({
          longUrl: "https://example.com",
        })
        .expect(201); // POST /link returns 201 Created

      expect(response.body.success).toBe(true);
    });
  });
});
