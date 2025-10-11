/**
 * Error Handling Tests
 * Tests for global error handler and error responses
 */

require('./setup');
const request = require('supertest');
const { app, prisma } = require('./helpers');

describe('Error Handling', () => {
  describe('404 - Route Not Found', () => {
    it('should return 404 for non-existent route', async () => {
      const response = await request(app)
        .get('/nonexistent')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        code: 'ROUTE_NOT_FOUND',
        message: 'Route not found',
      });
    });

    it('should return 404 for non-existent POST route', async () => {
      const response = await request(app)
        .post('/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('ROUTE_NOT_FOUND');
    });
  });

  describe('Authentication Errors', () => {
    it('should return 401 when accessing protected route without token', async () => {
      const response = await request(app)
        .get('/link')
        .expect(401);

      expect(response.body).toEqual({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Unauthorized',
      });
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/link')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 for missing required fields', async () => {
      // First create a guest session
      const guestResponse = await request(app)
        .post('/auth/guest')
        .expect(201);

      const cookies = guestResponse.headers['set-cookie'];

      // Try to create link without longUrl
      const response = await request(app)
        .post('/link')
        .set('Cookie', cookies)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INVALID_DATA');
      expect(response.body.validation).toBeDefined();
      expect(Array.isArray(response.body.validation)).toBe(true);
      expect(response.body.validation[0].field).toBe('longUrl');
    });

    it('should return 400 for invalid URL format', async () => {
      const guestResponse = await request(app)
        .post('/auth/guest')
        .expect(201);

      const cookies = guestResponse.headers['set-cookie'];

      const response = await request(app)
        .post('/link')
        .set('Cookie', cookies)
        .send({ longUrl: 'not-a-url' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INVALID_DATA');
      expect(response.body.validation).toBeDefined();
    });
  });

  describe('Business Logic Errors', () => {
    it('should return 400 when guest link limit is exceeded', async () => {
      const guestResponse = await request(app)
        .post('/auth/guest')
        .expect(201);

      const cookies = guestResponse.headers['set-cookie'];

      // Create 10 links (guest limit)
      for (let i = 0; i < 10; i++) {
        await request(app)
          .post('/link')
          .set('Cookie', cookies)
          .send({ longUrl: `https://errlimitest${i}.com` })
          .expect(201);
      }

      // Try to create 11th link
      const response = await request(app)
        .post('/link')
        .set('Cookie', cookies)
        .send({ longUrl: 'https://errlimitest11.com' })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        code: 'LINK_LIMIT_EXCEEDED',
        message: 'Link limit exceeded',
      });
    });

    it('should return 404 for non-existent link', async () => {
      const guestResponse = await request(app)
        .post('/auth/guest')
        .expect(201);

      const cookies = guestResponse.headers['set-cookie'];

      const response = await request(app)
        .get('/link/nonexistent')
        .set('Cookie', cookies)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('LINK_NOT_FOUND');
    });
  });

  describe('Error Response Format', () => {
    it('should have consistent error response structure', async () => {
      const response = await request(app)
        .get('/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('code');
      expect(response.body).toHaveProperty('message');
      expect(response.body.success).toBe(false);
      expect(typeof response.body.code).toBe('string');
      expect(typeof response.body.message).toBe('string');
    });

    it('should include validation array for validation errors', async () => {
      const guestResponse = await request(app)
        .post('/auth/guest');

      const cookies = guestResponse.headers['set-cookie'];

      const response = await request(app)
        .post('/link')
        .set('Cookie', cookies)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('validation');
      expect(Array.isArray(response.body.validation)).toBe(true);
      expect(response.body.validation[0]).toHaveProperty('field');
      expect(response.body.validation[0]).toHaveProperty('message');
    });
  });
});
