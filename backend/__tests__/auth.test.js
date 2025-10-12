/**
 * Authentication Tests
 * Tests for guest sessions, registration, login, and logout
 */

require('./setup');
const request = require('supertest');
const { app, createTestUser } = require('./helpers');

describe('Authentication', () => {
  describe('Guest Sessions', () => {
    it('should create a guest session', async () => {
      const response = await request(app)
        .post('/auth/guest')
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('guestSession');
      expect(response.body.data.guestSession).toHaveProperty('id');
      expect(response.body.data.guestSession).toHaveProperty('createdAt');

      // Should set guestToken cookie
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some(c => c.startsWith('guestToken='))).toBe(true);
    });

    it('should return error when guest session already exists', async () => {
      const firstResponse = await request(app)
        .post('/auth/guest')
        .expect(201);

      const cookies = firstResponse.headers['set-cookie'];

      const response = await request(app)
        .post('/auth/guest')
        .set('Cookie', cookies)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('GUEST_SESSION_EXISTS');
    });
  });

  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'test_newuser',
          email: 'newuser@example.com',
          password: 'Test123!',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('username', 'test_newuser');
      expect(response.body.data.user).toHaveProperty('email', 'newuser@example.com');
      expect(response.body.data.user).not.toHaveProperty('password');

      // Should set token cookie
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some(c => c.startsWith('token='))).toBe(true);
    });

    it('should return error for duplicate username', async () => {
      const timestamp = Date.now();
      const username = `dup_${timestamp}`.substring(0, 20);
      await createTestUser(username, `dup1_${timestamp}@example.com`);

      const response = await request(app)
        .post('/auth/register')
        .send({
          username: username,
          email: `different_${timestamp}@example.com`,
          password: 'Test123!@',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('USER_EXISTS');
    });

    it('should return error for duplicate email', async () => {
      const timestamp = Date.now();
      const email = `dup_${timestamp}@example.com`;
      await createTestUser(`usr_${timestamp}`.substring(0, 20), email);

      const response = await request(app)
        .post('/auth/register')
        .send({
          username: `dif_${timestamp}`.substring(0, 20),
          email: email,
          password: 'Test123!@',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('USER_EXISTS');
    });

    it('should validate registration data', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'test',
          // missing email and password
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INVALID_DATA');
      expect(response.body.validation).toBeDefined();
    });
  });

  describe('User Login', () => {
    it('should login with username', async () => {
      const timestamp = Date.now();
      const username = `test_loginuser_${timestamp}`;
      await createTestUser(username, `login_${timestamp}@example.com`, 'LoginPass123!');
      const response = await request(app)
        .post('/auth/login')
        .send({
          usernameOrEmail: username,
          password: 'LoginPass123!',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('username', username);

      const cookies = response.headers['set-cookie'];
      expect(cookies.some(c => c.startsWith('token='))).toBe(true);
    });

    it('should login with email', async () => {
      const timestamp = Date.now();
      const email = `login_email_${timestamp}@example.com`;
      await createTestUser(`test_loginuser_email_${timestamp}`, email, 'LoginPass123!');
      const response = await request(app)
        .post('/auth/login')
        .send({
          usernameOrEmail: email,
          password: 'LoginPass123!',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('email', email);
    });

    it('should return error for invalid credentials', async () => {
      const timestamp = Date.now();
      const username = `test_loginuser_invalid_${timestamp}`;
      await createTestUser(username, `login_invalid_${timestamp}@example.com`, 'LoginPass123!');
      const response = await request(app)
        .post('/auth/login')
        .send({
          usernameOrEmail: username,
          password: 'WrongPassword',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('should return error for non-existent user', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          usernameOrEmail: 'nonexistent',
          password: 'Test123!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('Session Validation', () => {
    it('should validate user session', async () => {
      const { token } = await createTestUser('test_validate', 'validate@example.com');

      const response = await request(app)
        .get('/auth/validate')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
    });

    it('should validate guest session', async () => {
      const guestResponse = await request(app)
        .post('/auth/guest')
        .expect(201);

      const cookies = guestResponse.headers['set-cookie'];

      const response = await request(app)
        .get('/auth/validate')
        .set('Cookie', cookies)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('guest');
    });

    it('should return error for invalid session', async () => {
      const response = await request(app)
        .get('/auth/validate')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Logout', () => {
    it('should logout user successfully', async () => {
      const { token } = await createTestUser('test_logout', 'logout@example.com');

      const response = await request(app)
        .post('/auth/logout')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Should clear cookies
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some(c => c.includes('token=;'))).toBe(true);
    });
  });
});
