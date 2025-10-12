/**
 * Link CRUD Tests
 * Tests for creating, reading, updating, and deleting links
 */

require('./setup');
const request = require('supertest');
const { app, createTestUser, createGuestSession, createTestLink, prisma } = require('./helpers');

describe('Link CRUD Operations', () => {
  describe('Create Link', () => {
    beforeEach(async () => {
      // Clean up before each test in this describe block
      await prisma.access.deleteMany({});
      await prisma.link.deleteMany({});
    });

    it('should create a link as guest', async () => {
      const { cookies } = await createGuestSession();

      const response = await request(app)
        .post('/link')
        .set('Cookie', cookies)
        .send({ longUrl: 'https://google.com' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('shortUrl');
      expect(response.body.data).toHaveProperty('longUrl', 'https://google.com');
      expect(response.body.data).toHaveProperty('status', true);
      expect(response.body.data.guestSessionId).toBeDefined();
    });

    it('should create a link as authenticated user', async () => {
      const { token } = await createTestUser('test_linkuser', 'linkuser@example.com');

      const response = await request(app)
        .post('/link')
        .set('Cookie', `token=${token}`)
        .send({ longUrl: 'https://example.com', status: false })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.longUrl).toBe('https://example.com');
      expect(response.body.data.status).toBe(false);
      expect(response.body.data.userId).toBeDefined();
    });

    it('should respect guest link limit', async () => {
      const { cookies, guestSession } = await createGuestSession();

      // Create 10 links (limit for guests)
      for (let i = 0; i < 10; i++) {
        await request(app)
          .post('/link')
          .set('Cookie', cookies)
          .send({ longUrl: `https://limitest${i}.com` })
          .expect(201);
      }

      // 11th link should fail
      const response = await request(app)
        .post('/link')
        .set('Cookie', cookies)
        .send({ longUrl: 'https://limitest11.com' })
        .expect(400);

      expect(response.body.code).toBe('LINK_LIMIT_EXCEEDED');
    });
  });

  describe('Get Link', () => {
    it('should get a specific link as owner', async () => {
      const { cookies, guestSession } = await createGuestSession();
      const link = await createTestLink(null, guestSession.id, 'https://test.com');

      const response = await request(app)
        .get(`/link/${link.shortUrl}`)
        .set('Cookie', cookies)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.shortUrl).toBe(link.shortUrl);
      expect(response.body.data.longUrl).toBe('https://test.com');
    });

    it('should not allow access to other users links', async () => {
      const { user } = await createTestUser('test_owner', 'owner@example.com');
      const link = await createTestLink(user.id, null, 'https://private.com');

      const { cookies } = await createGuestSession();

      const response = await request(app)
        .get(`/link/${link.shortUrl}`)
        .set('Cookie', cookies)
        .expect(403);

      expect(response.body.code).toBe('LINK_ACCESS_DENIED');
    });

    it('should return 404 for non-existent link', async () => {
      const { cookies } = await createGuestSession();

      const response = await request(app)
        .get('/link/nonexistent')
        .set('Cookie', cookies)
        .expect(404);

      expect(response.body.code).toBe('LINK_NOT_FOUND');
    });
  });

  describe('Get All Links', () => {
    it('should get all links for guest', async () => {
      const { cookies, guestSession } = await createGuestSession();

      // Create 2 links
      await createTestLink(null, guestSession.id, 'https://test1.com');
      await createTestLink(null, guestSession.id, 'https://test2.com');

      const response = await request(app)
        .get('/link')
        .set('Cookie', cookies)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.links).toHaveLength(2);
      expect(response.body.data.stats).toHaveProperty('totalClicks');
    });

    it('should get all links for authenticated user', async () => {
      const { token, user } = await createTestUser('test_getall', 'getall@example.com');

      await createTestLink(user.id, null, 'https://user1.com');
      await createTestLink(user.id, null, 'https://user2.com');

      const response = await request(app)
        .get('/link')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.links).toHaveLength(2);
    });

    it('should only return user\'s own links', async () => {
      const timestamp = Date.now();
      const { token: token1, user: user1 } = await createTestUser(`test_user1_${timestamp}`, `user1_${timestamp}@example.com`);
      const { user: user2 } = await createTestUser(`test_user2_${timestamp}`, `user2_${timestamp}@example.com`);

      await createTestLink(user1.id, null, 'https://user1link.com');
      await createTestLink(user2.id, null, 'https://user2link.com');

      const response = await request(app)
        .get('/link')
        .set('Cookie', `token=${token1}`)
        .expect(200);

      expect(response.body.data.links).toHaveLength(1);
      expect(response.body.data.links[0].longUrl).toBe('https://user1link.com');
    });
  });

  describe('Update Link', () => {
    it('should update own link', async () => {
      const { cookies, guestSession } = await createGuestSession();
      const link = await createTestLink(null, guestSession.id, 'https://old.com');

      const response = await request(app)
        .put(`/link/${link.shortUrl}`)
        .set('Cookie', cookies)
        .send({ longUrl: 'https://new.com', status: false })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.longUrl).toBe('https://new.com');
      expect(response.body.data.status).toBe(false);
    });

    it('should not update other users link', async () => {
      const { user } = await createTestUser('test_update_owner', 'updateowner@example.com');
      const link = await createTestLink(user.id, null, 'https://protected.com');

      const { cookies } = await createGuestSession();

      const response = await request(app)
        .put(`/link/${link.shortUrl}`)
        .set('Cookie', cookies)
        .send({ longUrl: 'https://hacked.com' })
        .expect(403);

      expect(response.body.code).toBe('LINK_ACCESS_DENIED');
    });

    it('should validate update data', async () => {
      const { cookies, guestSession } = await createGuestSession();
      const link = await createTestLink(null, guestSession.id, 'https://valid.com');

      const response = await request(app)
        .put(`/link/${link.shortUrl}`)
        .set('Cookie', cookies)
        .send({ longUrl: 'invalid-url' })
        .expect(400);

      expect(response.body.code).toBe('INVALID_DATA');
    });
  });

  describe('Delete Link', () => {
    it('should delete own link', async () => {
      const { cookies, guestSession } = await createGuestSession();
      const link = await createTestLink(null, guestSession.id, 'https://delete.com');

      const response = await request(app)
        .delete(`/link/${link.shortUrl}`)
        .set('Cookie', cookies)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify link is deleted
      await request(app)
        .get(`/link/${link.shortUrl}`)
        .set('Cookie', cookies)
        .expect(404);
    });

    it('should not delete other users link', async () => {
      const { user } = await createTestUser('test_delete_owner', 'deleteowner@example.com');
      const link = await createTestLink(user.id, null, 'https://nodelete.com');

      const { cookies } = await createGuestSession();

      const response = await request(app)
        .delete(`/link/${link.shortUrl}`)
        .set('Cookie', cookies)
        .expect(403);

      expect(response.body.code).toBe('LINK_ACCESS_DENIED');
    });

    it('should return 404 when deleting non-existent link', async () => {
      const { cookies } = await createGuestSession();

      const response = await request(app)
        .delete('/link/nonexistent')
        .set('Cookie', cookies)
        .expect(404);

      expect(response.body.code).toBe('LINK_NOT_FOUND');
    });
  });

  describe('Link Redirect', () => {
    it('should redirect to long URL', async () => {
      const link = await createTestLink(null, null, 'https://redirect-test.com');

      const response = await request(app)
        .get(`/r/${link.shortUrl}`)
        .expect(302);

      expect(response.headers.location).toBe('https://redirect-test.com');
    });

    it('should redirect to 404 page for non-existent link', async () => {
      const response = await request(app)
        .get('/r/nonexistent')
        .expect(302);

      expect(response.headers.location).toContain('/404');
    });

    it('should redirect to disabled page for inactive link', async () => {
      const { guestSession } = await createGuestSession();
      const link = await createTestLink(null, guestSession.id, 'https://disabled.com');

      // Disable the link
      const prisma = require('../v2/prisma/client');
      await prisma.link.update({
        where: { id: link.id },
        data: { status: false }
      });

      const response = await request(app)
        .get(`/r/${link.shortUrl}`)
        .expect(302);

      expect(response.headers.location).toContain('/disabled');
    });
  });
});
