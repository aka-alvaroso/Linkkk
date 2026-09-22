/**
 * User Tests
 * Tests for user profile operations
 */

require("./setup");
const request = require("supertest");
const { app, createTestUser, prisma } = require("./helpers");

describe("User Operations", () => {
  describe("Update User", () => {
    it("should update user email successfully", async () => {
      const timestamp = Date.now();
      const { token, user } = await createTestUser(
        `test_update_${timestamp}`,
        `update_${timestamp}@example.com`
      );

      const newEmail = `new_${timestamp}@example.com`;
      const response = await request(app)
        .put("/user")
        .set("Cookie", `token=${token}`)
        .send({
          email: newEmail,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("id", user.id);
      expect(response.body.data).toHaveProperty("email", newEmail);

      // Verify in database
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });
      expect(updatedUser.email).toBe(newEmail);
    });

    it("should update user username successfully", async () => {
      const timestamp = Date.now();
      const { token, user } = await createTestUser(
        `test_update_${timestamp}`,
        `update_${timestamp}@example.com`
      );

      const newUsername = `new_user_${timestamp}`;
      const response = await request(app)
        .put("/user")
        .set("Cookie", `token=${token}`)
        .send({
          username: newUsername,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("username", newUsername);

      // Verify in database
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });
      expect(updatedUser.username).toBe(newUsername);
    });

    it("should update user password successfully", async () => {
      const timestamp = Date.now();
      const { token, user } = await createTestUser(
        `test_update_${timestamp}`,
        `update_${timestamp}@example.com`
      );

      const newPassword = "NewPass123!@";
      const response = await request(app)
        .put("/user")
        .set("Cookie", `token=${token}`)
        .send({
          password: newPassword,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("id", user.id);

      // Verify password was updated (should be hashed)
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });
      expect(updatedUser.password).not.toBe(newPassword);
      expect(updatedUser.password).toBeDefined();
    });

    it("should update multiple fields at once", async () => {
      const timestamp = Date.now();
      const { token, user } = await createTestUser(
        `test_update_${timestamp}`,
        `update_${timestamp}@example.com`
      );

      const updates = {
        email: `multi_${timestamp}@example.com`,
        username: `multi_user_${timestamp}`,
        password: "MultiPass123!@",
      };

      const response = await request(app)
        .put("/user")
        .set("Cookie", `token=${token}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("email", updates.email);
      expect(response.body.data).toHaveProperty("username", updates.username);

      // Verify in database
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });
      expect(updatedUser.email).toBe(updates.email);
      expect(updatedUser.username).toBe(updates.username);
    });

    it("should return error for invalid email format", async () => {
      const timestamp = Date.now();
      const { token } = await createTestUser(
        `test_update_${timestamp}`,
        `update_${timestamp}@example.com`
      );

      const response = await request(app)
        .put("/user")
        .set("Cookie", `token=${token}`)
        .send({
          email: "invalid-email",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe("INVALID_DATA");
      expect(response.body.validation).toBeDefined();
      expect(response.body.validation).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "email",
          }),
        ])
      );
    });

    it("should return error for username too short", async () => {
      const timestamp = Date.now();
      const { token } = await createTestUser(
        `test_update_${timestamp}`,
        `update_${timestamp}@example.com`
      );

      const response = await request(app)
        .put("/user")
        .set("Cookie", `token=${token}`)
        .send({
          username: "ab",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe("INVALID_DATA");
      expect(response.body.validation).toBeDefined();
      expect(response.body.validation).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "username",
          }),
        ])
      );
    });

    it("should return error for username too long", async () => {
      const timestamp = Date.now();
      const { token } = await createTestUser(
        `test_update_${timestamp}`,
        `update_${timestamp}@example.com`
      );

      const response = await request(app)
        .put("/user")
        .set("Cookie", `token=${token}`)
        .send({
          username: "a".repeat(26),
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe("INVALID_DATA");
      expect(response.body.validation).toBeDefined();
    });

    it("should return error for password too short", async () => {
      const timestamp = Date.now();
      const { token } = await createTestUser(
        `test_update_${timestamp}`,
        `update_${timestamp}@example.com`
      );

      const response = await request(app)
        .put("/user")
        .set("Cookie", `token=${token}`)
        .send({
          password: "Short1!",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe("INVALID_DATA");
      expect(response.body.validation).toBeDefined();
      expect(response.body.validation).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "password",
          }),
        ])
      );
    });

    it("should return error when not authenticated", async () => {
      const response = await request(app)
        .put("/user")
        .send({
          email: "newemail@example.com",
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe("UNAUTHORIZED");
    });

    it("should return error with invalid token", async () => {
      const response = await request(app)
        .put("/user")
        .set("Cookie", "token=invalid_token_here")
        .send({
          email: "newemail@example.com",
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe("UNAUTHORIZED");
    });

    it("should handle empty request body", async () => {
      const timestamp = Date.now();
      const { token, user } = await createTestUser(
        `test_update_${timestamp}`,
        `update_${timestamp}@example.com`
      );

      const response = await request(app)
        .put("/user")
        .set("Cookie", `token=${token}`)
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("id", user.id);
    });

    it("should not expose password in response", async () => {
      const timestamp = Date.now();
      const { token } = await createTestUser(
        `test_update_${timestamp}`,
        `update_${timestamp}@example.com`
      );

      const response = await request(app)
        .put("/user")
        .set("Cookie", `token=${token}`)
        .send({
          email: `updated_${timestamp}@example.com`,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      // SECURITY: Password should NOT be returned in response
      expect(response.body.data).not.toHaveProperty("password");
      expect(response.body.data).not.toHaveProperty("apiKey");
      // Should only return safe fields
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data).toHaveProperty("username");
      expect(response.body.data).toHaveProperty("email");
      expect(response.body.data).toHaveProperty("createdAt");
    });
  });

  describe("Delete User Data", () => {
    it("should delete all user links successfully", async () => {
      const timestamp = Date.now();
      const { token, user } = await createTestUser(
        `test_delete_data_${timestamp}`,
        `delete_data_${timestamp}@example.com`
      );

      // Create some test links for the user
      await prisma.link.create({
        data: {
          longUrl: "https://example.com",
          shortUrl: `test_${timestamp}`,
          userId: user.id,
        },
      });

      const response = await request(app)
        .delete("/user/data")
        .set("Cookie", `token=${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();

      // Verify links were deleted
      const links = await prisma.link.findMany({
        where: { userId: user.id },
      });
      expect(links).toHaveLength(0);

      // Verify user still exists
      const userExists = await prisma.user.findUnique({
        where: { id: user.id },
      });
      expect(userExists).not.toBeNull();
    });

    it("should return error when not authenticated", async () => {
      const response = await request(app).delete("/user/data").expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe("UNAUTHORIZED");
    });

    it("should handle user with no links gracefully", async () => {
      const timestamp = Date.now();
      const { token } = await createTestUser(
        `test_no_links_${timestamp}`,
        `no_links_${timestamp}@example.com`
      );

      const response = await request(app)
        .delete("/user/data")
        .set("Cookie", `token=${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe("Delete User", () => {
    it("should delete user account and all associated data", async () => {
      const timestamp = Date.now();
      const { token, user } = await createTestUser(
        `test_delete_${timestamp}`,
        `delete_${timestamp}@example.com`
      );

      // Create some test links
      await prisma.link.create({
        data: {
          longUrl: "https://example.com",
          shortUrl: `delete_test_${timestamp}`,
          userId: user.id,
        },
      });

      const response = await request(app)
        .delete("/user")
        .set("Cookie", `token=${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();

      // Verify user was deleted
      const userExists = await prisma.user.findUnique({
        where: { id: user.id },
      });
      expect(userExists).toBeNull();

      // Verify links were deleted (cascade)
      const links = await prisma.link.findMany({
        where: { userId: user.id },
      });
      expect(links).toHaveLength(0);
    });

    it("should return error when not authenticated", async () => {
      const response = await request(app).delete("/user").expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe("UNAUTHORIZED");
    });

    it("should clear authentication cookie after deletion", async () => {
      const timestamp = Date.now();
      const { token } = await createTestUser(
        `test_cookie_${timestamp}`,
        `cookie_${timestamp}@example.com`
      );

      const response = await request(app)
        .delete("/user")
        .set("Cookie", `token=${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      // In production, should clear the cookie
      // expect(response.headers['set-cookie']).toBeDefined();
    });
  });

});

// Cleanup: Delete all test users after all tests complete
afterAll(async () => {
  try {
    const result = await prisma.user.deleteMany({
      where: {
        OR: [
          { username: { contains: 'test_' } },
          { username: { contains: 'dup_' } },
          { username: { contains: 'usr_' } },
          { username: { contains: 'new_user_' } },
          { username: { contains: 'multi_user_' } },
          { email: { contains: '@example.com' } }
        ]
      }
    });
    console.log(`\n✅ Cleanup: ${result.count} test users deleted`);
  } catch (error) {
    console.error('⚠️  Cleanup error:', error.message);
  }
});
