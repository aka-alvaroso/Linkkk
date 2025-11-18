/**
 * Test Helpers
 * Utility functions for tests
 */

const request = require('supertest');
const app = require('../v2.js');
const prisma = require('../v2/prisma/client');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Create a test user
 */
async function createTestUser(username = 'test_user', email = 'test@example.com', password = 'Test123!') {
  const hashedPassword = await bcryptjs.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
    },
  });

  const token = jwt.sign({ id: user.id }, process.env.V2_AUTH_SECRET_KEY, {
    expiresIn: '7d',
    algorithm: 'HS256',
    issuer: 'linkkk-api',
    audience: 'linkkk-users',
  });

  return { user, token, password };
}

/**
 * Create a guest session
 */
async function createGuestSession() {
  const response = await request(app)
    .post('/auth/guest');

  return {
    guestSession: response.body.data.guestSession,
    cookies: response.headers['set-cookie'],
  };
}

/**
 * Create a test link
 */
async function createTestLink(userId = null, guestSessionId = null, longUrl = 'https://example.com') {
  const link = await prisma.link.create({
    data: {
      userId,
      guestSessionId,
      longUrl,
      shortUrl: Math.random().toString(36).substring(7),
      status: true,
    },
  });

  return link;
}

/**
 * Extract cookie value from set-cookie header
 */
function extractCookie(cookies, cookieName) {
  if (!cookies) return null;

  const cookie = cookies.find(c => c.startsWith(cookieName));
  if (!cookie) return null;

  const match = cookie.match(new RegExp(`${cookieName}=([^;]+)`));
  return match ? match[1] : null;
}

/**
 * Get CSRF token from the server
 */
async function getCsrfToken() {
  const response = await request(app).get('/csrf-token');
  const csrfToken = response.body.csrfToken;
  const cookies = response.headers['set-cookie'];
  return { csrfToken, cookies };
}

module.exports = {
  createTestUser,
  createGuestSession,
  createTestLink,
  extractCookie,
  getCsrfToken,
  app,
  prisma,
};
