/**
 * Link Rules CRUD Tests
 * Tests for creating, reading, updating, and deleting link rules
 */

require('./setup');
const request = require('supertest');
const { app, createTestUser, createTestLink, prisma } = require('./helpers');

describe('Link Rules CRUD Operations', () => {
  describe('Create Link Rule', () => {
    beforeEach(async () => {
      await prisma.linkRule.deleteMany({});
      await prisma.link.deleteMany({});
    });

    it('should create a rule for own link', async () => {
      const { token, user } = await createTestUser('test_ruleuser', 'ruleuser@example.com');
      const link = await createTestLink(user.id, null, 'https://example.com');

      const ruleData = {
        priority: 1,
        enabled: true,
        match: 'AND',
        conditions: [
          {
            field: 'country',
            operator: 'in',
            value: ['ES', 'US'],
          },
        ],
        action: {
          type: 'redirect',
          settings: {
            url: 'https://es.example.com',
          },
        },
      };

      const response = await request(app)
        .post(`/link/${link.shortUrl}/rules`)
        .set('Cookie', `token=${token}`)
        .send(ruleData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.priority).toBe(1);
      expect(response.body.data.actionType).toBe('redirect');
      expect(response.body.data.conditions).toHaveLength(1);
    });

    it('should create rule with multiple conditions', async () => {
      const { token, user } = await createTestUser('test_multicond', 'multicond@example.com');
      const link = await createTestLink(user.id, null, 'https://example.com');

      const ruleData = {
        priority: 1,
        match: 'AND',
        conditions: [
          {
            field: 'country',
            operator: 'in',
            value: ['ES'],
          },
          {
            field: 'device',
            operator: 'equals',
            value: 'mobile',
          },
        ],
        action: {
          type: 'redirect',
          settings: {
            url: 'https://mobile.es.example.com',
          },
        },
      };

      const response = await request(app)
        .post(`/link/${link.shortUrl}/rules`)
        .set('Cookie', `token=${token}`)
        .send(ruleData)
        .expect(201);

      expect(response.body.data.conditions).toHaveLength(2);
    });

    it('should create rule with else action', async () => {
      const { token, user } = await createTestUser('test_elseaction', 'elseaction@example.com');
      const link = await createTestLink(user.id, null, 'https://example.com');

      const ruleData = {
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
        elseAction: {
          type: 'redirect',
          settings: {
            url: '{{longUrl}}',
          },
        },
      };

      const response = await request(app)
        .post(`/link/${link.shortUrl}/rules`)
        .set('Cookie', `token=${token}`)
        .send(ruleData)
        .expect(201);

      expect(response.body.data.elseActionType).toBe('redirect');
    });

    it('should not create rule for non-existent link', async () => {
      const { token } = await createTestUser('test_nolink', 'nolink@example.com');

      const ruleData = {
        conditions: [],
        action: {
          type: 'redirect',
          settings: { url: 'https://example.com' },
        },
      };

      const response = await request(app)
        .post('/link/nonexistent/rules')
        .set('Cookie', `token=${token}`)
        .send(ruleData)
        .expect(404);

      expect(response.body.code).toBe('LINK_NOT_FOUND');
    });

    it('should not create rule for other users link', async () => {
      const { user: owner } = await createTestUser('test_owner2', 'owner2@example.com');
      const link = await createTestLink(owner.id, null, 'https://protected.com');

      const { token: otherToken } = await createTestUser('test_other', 'other@example.com');

      const ruleData = {
        conditions: [],
        action: {
          type: 'redirect',
          settings: { url: 'https://hack.com' },
        },
      };

      const response = await request(app)
        .post(`/link/${link.shortUrl}/rules`)
        .set('Cookie', `token=${otherToken}`)
        .send(ruleData)
        .expect(403);

      expect(response.body.code).toBe('LINK_ACCESS_DENIED');
    });

    it('should validate rule data', async () => {
      const { token, user } = await createTestUser('test_validation', 'validation@example.com');
      const link = await createTestLink(user.id, null, 'https://example.com');

      const invalidRule = {
        priority: -1, // Invalid
        conditions: [],
        action: {
          type: 'redirect',
          settings: { url: 'invalid-url' }, // Invalid URL
        },
      };

      const response = await request(app)
        .post(`/link/${link.shortUrl}/rules`)
        .set('Cookie', `token=${token}`)
        .send(invalidRule)
        .expect(400);

      expect(response.body.code).toBe('INVALID_DATA');
    });

    it('should reject more than 5 conditions', async () => {
      const { token, user } = await createTestUser('test_maxcond', 'maxcond@example.com');
      const link = await createTestLink(user.id, null, 'https://example.com');

      const ruleData = {
        conditions: [
          { field: 'country', operator: 'in', value: ['ES'] },
          { field: 'device', operator: 'equals', value: 'mobile' },
          { field: 'is_vpn', operator: 'equals', value: false },
          { field: 'is_bot', operator: 'equals', value: false },
          { field: 'ip', operator: 'equals', value: '127.0.0.1' },
          { field: 'access_count', operator: 'less_than', value: 100 }, // 6th
        ],
        action: {
          type: 'redirect',
          settings: { url: 'https://example.com' },
        },
      };

      const response = await request(app)
        .post(`/link/${link.shortUrl}/rules`)
        .set('Cookie', `token=${token}`)
        .send(ruleData)
        .expect(400);

      expect(response.body.code).toBe('INVALID_DATA');
    });
  });

  describe('Get Link Rules', () => {
    it('should get all rules for a link', async () => {
      const { token, user } = await createTestUser('test_getrules', 'getrules@example.com');
      const link = await createTestLink(user.id, null, 'https://example.com');

      // Create 2 rules
      await prisma.linkRule.createMany({
        data: [
          {
            linkId: link.id,
            priority: 1,
            enabled: true,
            match: 'AND',
            actionType: 'redirect',
            actionSettings: { url: 'https://rule1.com' },
          },
          {
            linkId: link.id,
            priority: 2,
            enabled: true,
            match: 'AND',
            actionType: 'redirect',
            actionSettings: { url: 'https://rule2.com' },
          },
        ],
      });

      const response = await request(app)
        .get(`/link/${link.shortUrl}/rules`)
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should get rules ordered by priority', async () => {
      const { token, user } = await createTestUser('test_order', 'order@example.com');
      const link = await createTestLink(user.id, null, 'https://example.com');

      await prisma.linkRule.createMany({
        data: [
          {
            linkId: link.id,
            priority: 10,
            enabled: true,
            match: 'AND',
            actionType: 'redirect',
            actionSettings: { url: 'https://low.com' },
          },
          {
            linkId: link.id,
            priority: 1,
            enabled: true,
            match: 'AND',
            actionType: 'redirect',
            actionSettings: { url: 'https://high.com' },
          },
        ],
      });

      const response = await request(app)
        .get(`/link/${link.shortUrl}/rules`)
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body.data[0].priority).toBe(1);
      expect(response.body.data[1].priority).toBe(10);
    });

    it('should not get rules for other users link', async () => {
      const { user: owner } = await createTestUser('test_owner3', 'owner3@example.com');
      const link = await createTestLink(owner.id, null, 'https://protected.com');

      const { token: otherToken } = await createTestUser('test_other2', 'other2@example.com');

      const response = await request(app)
        .get(`/link/${link.shortUrl}/rules`)
        .set('Cookie', `token=${otherToken}`)
        .expect(403);

      expect(response.body.code).toBe('LINK_ACCESS_DENIED');
    });
  });

  describe('Get Single Rule', () => {
    it('should get a specific rule', async () => {
      const { token, user } = await createTestUser('test_singlerule', 'singlerule@example.com');
      const link = await createTestLink(user.id, null, 'https://example.com');

      const rule = await prisma.linkRule.create({
        data: {
          linkId: link.id,
          priority: 1,
          enabled: true,
          match: 'AND',
          actionType: 'redirect',
          actionSettings: { url: 'https://test.com' },
        },
      });

      const response = await request(app)
        .get(`/link/${link.shortUrl}/rules/${rule.id}`)
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(rule.id);
      expect(response.body.data.priority).toBe(1);
    });

    it('should return 404 for non-existent rule', async () => {
      const { token, user } = await createTestUser('test_norule', 'norule@example.com');
      const link = await createTestLink(user.id, null, 'https://example.com');

      const response = await request(app)
        .get(`/link/${link.shortUrl}/rules/999999`)
        .set('Cookie', `token=${token}`)
        .expect(404);

      expect(response.body.code).toBe('RULE_NOT_FOUND');
    });
  });

  describe('Update Link Rule', () => {
    it('should update own rule', async () => {
      const { token, user } = await createTestUser('test_update', 'update@example.com');
      const link = await createTestLink(user.id, null, 'https://example.com');

      const rule = await prisma.linkRule.create({
        data: {
          linkId: link.id,
          priority: 1,
          enabled: true,
          match: 'AND',
          actionType: 'redirect',
          actionSettings: { url: 'https://old.com' },
        },
      });

      const response = await request(app)
        .put(`/link/${link.shortUrl}/rules/${rule.id}`)
        .set('Cookie', `token=${token}`)
        .send({
          priority: 5,
          enabled: false,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.priority).toBe(5);
      expect(response.body.data.enabled).toBe(false);
    });

    it('should update rule conditions', async () => {
      const { token, user } = await createTestUser('test_updatecond', 'updatecond@example.com');
      const link = await createTestLink(user.id, null, 'https://example.com');

      const rule = await prisma.linkRule.create({
        data: {
          linkId: link.id,
          priority: 1,
          enabled: true,
          match: 'AND',
          actionType: 'redirect',
          actionSettings: { url: 'https://test.com' },
        },
      });

      const response = await request(app)
        .put(`/link/${link.shortUrl}/rules/${rule.id}`)
        .set('Cookie', `token=${token}`)
        .send({
          conditions: [
            {
              field: 'device',
              operator: 'equals',
              value: 'tablet',
            },
          ],
        })
        .expect(200);

      expect(response.body.data.conditions).toHaveLength(1);
      expect(response.body.data.conditions[0].field).toBe('device');
    });

    it('should not update other users rule', async () => {
      const { user: owner } = await createTestUser('test_owner4', 'owner4@example.com');
      const link = await createTestLink(owner.id, null, 'https://protected.com');

      const rule = await prisma.linkRule.create({
        data: {
          linkId: link.id,
          priority: 1,
          enabled: true,
          match: 'AND',
          actionType: 'redirect',
          actionSettings: { url: 'https://test.com' },
        },
      });

      const { token: otherToken } = await createTestUser('test_other3', 'other3@example.com');

      const response = await request(app)
        .put(`/link/${link.shortUrl}/rules/${rule.id}`)
        .set('Cookie', `token=${otherToken}`)
        .send({ priority: 10 })
        .expect(403);

      expect(response.body.code).toBe('LINK_ACCESS_DENIED');
    });
  });

  describe('Delete Link Rule', () => {
    it('should delete own rule', async () => {
      const { token, user } = await createTestUser('test_delete', 'delete@example.com');
      const link = await createTestLink(user.id, null, 'https://example.com');

      const rule = await prisma.linkRule.create({
        data: {
          linkId: link.id,
          priority: 1,
          enabled: true,
          match: 'AND',
          actionType: 'redirect',
          actionSettings: { url: 'https://test.com' },
        },
      });

      const response = await request(app)
        .delete(`/link/${link.shortUrl}/rules/${rule.id}`)
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify rule is deleted
      const checkRule = await prisma.linkRule.findUnique({
        where: { id: rule.id },
      });
      expect(checkRule).toBeNull();
    });

    it('should not delete other users rule', async () => {
      const { user: owner } = await createTestUser('test_owner5', 'owner5@example.com');
      const link = await createTestLink(owner.id, null, 'https://protected.com');

      const rule = await prisma.linkRule.create({
        data: {
          linkId: link.id,
          priority: 1,
          enabled: true,
          match: 'AND',
          actionType: 'redirect',
          actionSettings: { url: 'https://test.com' },
        },
      });

      const { token: otherToken } = await createTestUser('test_other4', 'other4@example.com');

      const response = await request(app)
        .delete(`/link/${link.shortUrl}/rules/${rule.id}`)
        .set('Cookie', `token=${otherToken}`)
        .expect(403);

      expect(response.body.code).toBe('LINK_ACCESS_DENIED');
    });

    it('should return 404 when deleting non-existent rule', async () => {
      const { token, user } = await createTestUser('test_delnoexist', 'delnoexist@example.com');
      const link = await createTestLink(user.id, null, 'https://example.com');

      const response = await request(app)
        .delete(`/link/${link.shortUrl}/rules/999999`)
        .set('Cookie', `token=${token}`)
        .expect(404);

      expect(response.body.code).toBe('RULE_NOT_FOUND');
    });
  });

  describe('Batch Operations', () => {
    it('should create multiple rules at once', async () => {
      const { token, user } = await createTestUser('test_batch', 'batch@example.com');
      const link = await createTestLink(user.id, null, 'https://example.com');

      const rulesData = {
        rules: [
          {
            priority: 1,
            conditions: [{ field: 'country', operator: 'in', value: ['ES'] }],
            action: { type: 'redirect', settings: { url: 'https://es.com' } },
          },
          {
            priority: 2,
            conditions: [{ field: 'country', operator: 'in', value: ['US'] }],
            action: { type: 'redirect', settings: { url: 'https://us.com' } },
          },
        ],
      };

      const response = await request(app)
        .post(`/link/${link.shortUrl}/rules/batch`)
        .set('Cookie', `token=${token}`)
        .send(rulesData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should not create more than 20 rules in batch', async () => {
      const { token, user } = await createTestUser('test_batchlimit', 'batchlimit@example.com');
      const link = await createTestLink(user.id, null, 'https://example.com');

      const rules = [];
      for (let i = 0; i < 21; i++) {
        rules.push({
          priority: i,
          conditions: [],
          action: { type: 'redirect', settings: { url: `https://test${i}.com` } },
        });
      }

      const response = await request(app)
        .post(`/link/${link.shortUrl}/rules/batch`)
        .set('Cookie', `token=${token}`)
        .send({ rules })
        .expect(400);

      expect(response.body.code).toBe('INVALID_DATA');
    });
  });
});
