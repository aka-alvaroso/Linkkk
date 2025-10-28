/**
 * Link Rules Integration Tests (E2E)
 *
 * These tests verify that the entire Link Rules flow works correctly:
 * 1. Create a link with rules
 * 2. Access the link (trigger redirectLink controller)
 * 3. Verify that rules are evaluated and correct action is taken
 */

const request = require('supertest');
const { app, createTestUser, createTestLink, prisma } = require('./helpers');
const { hashPassword } = require('../v2/utils/password');

describe('Link Rules Integration (E2E)', () => {

  describe('Redirect Action', () => {
    it('should redirect to longUrl when no rules exist', async () => {
      const { user } = await createTestUser('test_redirect_norules', 'redirect_norules@test.com');
      const link = await createTestLink(user.id, null, 'https://example.com');

      const response = await request(app)
        .get(`/r/${link.shortUrl}`)
        .expect(302);

      expect(response.headers.location).toBe('https://example.com');
    });

    it('should redirect to custom URL when country rule matches', async () => {
      const { user, token } = await createTestUser('test_redirect_country', 'redirect_country@test.com');
      const link = await createTestLink(user.id, null, 'https://example.com');

      // Create rule: if country = US, redirect to https://us.example.com
      await request(app)
        .post(`/link/${link.shortUrl}/rules`)
        .set('Cookie', `token=${token}`)
        .send({
          priority: 1,
          match: 'AND',
          conditions: [
            {
              field: 'country',
              operator: 'in',
              value: ['US'],
            },
          ],
          action: {
            type: 'redirect',
            settings: {
              url: 'https://us.example.com',
            },
          },
        })
        .expect(201);

      // Access link (mock will return country = US)
      const response = await request(app)
        .get(`/r/${link.shortUrl}`)
        .expect(302);

      expect(response.headers.location).toBe('https://us.example.com');

      // Verify access was tracked
      const accessCount = await prisma.access.count({
        where: { linkId: link.id },
      });
      expect(accessCount).toBe(1);
    });

    it('should use template variables in redirect URL', async () => {
      const { user, token } = await createTestUser('test_redirect_template', 'redirect_template@test.com');
      const link = await createTestLink(user.id, null, 'https://original.com');

      // Create rule: redirect to {{longUrl}}
      await request(app)
        .post(`/link/${link.shortUrl}/rules`)
        .set('Cookie', `token=${token}`)
        .send({
          priority: 1,
          conditions: [],
          action: {
            type: 'redirect',
            settings: {
              url: '{{longUrl}}',
            },
          },
        })
        .expect(201);

      const response = await request(app)
        .get(`/r/${link.shortUrl}`)
        .expect(302);

      expect(response.headers.location).toBe('https://original.com');
    });
  });

  describe('Block Access Action', () => {
    it('should block access when always-true condition exists', async () => {
      const { user, token } = await createTestUser('test_block_always', 'block_always@test.com');
      const link = await createTestLink(user.id, null, 'https://example.com');

      // Create rule: always block (no conditions = always true)
      await request(app)
        .post(`/link/${link.shortUrl}/rules`)
        .set('Cookie', `token=${token}`)
        .send({
          priority: 1,
          conditions: [], // No conditions = always matches
          action: {
            type: 'block_access',
            settings: {
              reason: 'BLOCKED',
              message: 'Access is blocked',
            },
          },
        })
        .expect(201);

      const response = await request(app)
        .get(`/r/${link.shortUrl}`)
        .expect(302);

      expect(response.headers.location).toContain('/blocked');
      expect(response.headers.location).toContain('reason=BLOCKED');

      // Verify access was NOT tracked for blocked request
      const accessCount = await prisma.access.count({
        where: { linkId: link.id },
      });
      expect(accessCount).toBe(0);

      // Verify accessCount was still incremented
      const updatedLink = await prisma.link.findUnique({
        where: { shortUrl: link.shortUrl },
      });
      expect(updatedLink.accessCount).toBe(1);
    });
  });

  describe('Password Gate Action', () => {
    it('should redirect to password page when password gate rule applies', async () => {
      const { user, token } = await createTestUser('test_password_gate', 'password_gate@test.com');
      const link = await createTestLink(user.id, null, 'https://secret.com');

      const passwordHash = await hashPassword('secret123');

      // Create rule: require password for mobile devices
      await request(app)
        .post(`/link/${link.shortUrl}/rules`)
        .set('Cookie', `token=${token}`)
        .send({
          priority: 1,
          conditions: [
            {
              field: 'device',
              operator: 'equals',
              value: 'mobile',
            },
          ],
          action: {
            type: 'password_gate',
            settings: {
              passwordHash,
              hint: 'Your secret code',
            },
          },
        })
        .expect(201);

      // Access from mobile device
      const response = await request(app)
        .get(`/r/${link.shortUrl}`)
        .set('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)')
        .expect(302);

      expect(response.headers.location).toContain('/password');
      expect(response.headers.location).toContain(`shortUrl=${link.shortUrl}`);
      expect(response.headers.location).toContain('hint=Your%20secret%20code');

      // Verify access was NOT tracked yet
      const accessCount = await prisma.access.count({
        where: { linkId: link.id },
      });
      expect(accessCount).toBe(0);
    });

    it('should verify password correctly and track access', async () => {
      const { user, token } = await createTestUser('test_password_verify', 'password_verify@test.com');
      const link = await createTestLink(user.id, null, 'https://secret.com');

      // Create password gate rule (send plain text password, backend will hash it)
      await request(app)
        .post(`/link/${link.shortUrl}/rules`)
        .set('Cookie', `token=${token}`)
        .send({
          priority: 1,
          conditions: [],
          action: {
            type: 'password_gate',
            settings: {
              passwordHash: 'secret123', // Plain text, will be hashed by backend
            },
          },
        })
        .expect(201);

      // Verify correct password
      const response = await request(app)
        .post(`/link/${link.shortUrl}/verify-password`)
        .send({ password: 'secret123' })
        .expect(200);

      expect(response.body.data.success).toBe(true);
      expect(response.body.data.url).toBe('https://secret.com');

      // Verify access was tracked
      const accessCount = await prisma.access.count({
        where: { linkId: link.id },
      });
      expect(accessCount).toBe(1);
    });

    it('should reject incorrect password', async () => {
      const { user, token } = await createTestUser('test_password_wrong', 'password_wrong@test.com');
      const link = await createTestLink(user.id, null, 'https://secret.com');

      const passwordHash = await hashPassword('secret123');

      await request(app)
        .post(`/link/${link.shortUrl}/rules`)
        .set('Cookie', `token=${token}`)
        .send({
          priority: 1,
          conditions: [],
          action: {
            type: 'password_gate',
            settings: {
              passwordHash,
            },
          },
        })
        .expect(201);

      // Try wrong password
      const response = await request(app)
        .post(`/link/${link.shortUrl}/verify-password`)
        .send({ password: 'wrongpassword' })
        .expect(401);

      expect(response.body.code).toBe('INVALID_CREDENTIALS');

      // Verify access was NOT tracked
      const accessCount = await prisma.access.count({
        where: { linkId: link.id },
      });
      expect(accessCount).toBe(0);
    });
  });

  describe('Rule Priority', () => {
    it('should evaluate rules in priority order (lower first)', async () => {
      const { user, token } = await createTestUser('test_priority', 'priority@test.com');
      const link = await createTestLink(user.id, null, 'https://example.com');

      // Create high priority rule (priority 1)
      await request(app)
        .post(`/link/${link.shortUrl}/rules`)
        .set('Cookie', `token=${token}`)
        .send({
          priority: 1,
          conditions: [],
          action: {
            type: 'redirect',
            settings: {
              url: 'https://priority-1.com',
            },
          },
        })
        .expect(201);

      // Create lower priority rule (priority 2)
      await request(app)
        .post(`/link/${link.shortUrl}/rules`)
        .set('Cookie', `token=${token}`)
        .send({
          priority: 2,
          conditions: [],
          action: {
            type: 'redirect',
            settings: {
              url: 'https://priority-2.com',
            },
          },
        })
        .expect(201);

      // Should execute priority 1 rule first
      const response = await request(app)
        .get(`/r/${link.shortUrl}`)
        .expect(302);

      expect(response.headers.location).toBe('https://priority-1.com');
    });
  });

  describe('Else Actions', () => {
    it('should execute else action when conditions do not match', async () => {
      const { user, token } = await createTestUser('test_else_action', 'else_action@test.com');
      const link = await createTestLink(user.id, null, 'https://example.com');

      // Create rule with else action
      await request(app)
        .post(`/link/${link.shortUrl}/rules`)
        .set('Cookie', `token=${token}`)
        .send({
          priority: 1,
          conditions: [
            {
              field: 'country',
              operator: 'in',
              value: ['FR'], // Will not match (mock returns US)
            },
          ],
          action: {
            type: 'redirect',
            settings: {
              url: 'https://fr.example.com',
            },
          },
          elseAction: {
            type: 'redirect',
            settings: {
              url: 'https://other.example.com',
            },
          },
        })
        .expect(201);

      const response = await request(app)
        .get(`/r/${link.shortUrl}`)
        .expect(302);

      expect(response.headers.location).toBe('https://other.example.com');
    });
  });

  describe('Disabled Link', () => {
    it('should redirect to disabled page when link is disabled', async () => {
      const { user } = await createTestUser('test_disabled', 'disabled@test.com');
      const link = await createTestLink(user.id, null, 'https://example.com');

      // Disable link
      await prisma.link.update({
        where: { shortUrl: link.shortUrl },
        data: { status: false },
      });

      const response = await request(app)
        .get(`/r/${link.shortUrl}`)
        .expect(302);

      expect(response.headers.location).toContain('/disabled');
    });
  });
});
