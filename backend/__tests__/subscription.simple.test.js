require('./setup');
const request = require('supertest');
const { app, createTestUser, prisma } = require('./helpers');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Subscription System - Simple Tests', () => {
  beforeAll(async () => {
    // Clean ALL data at the start
    await prisma.ruleCondition.deleteMany({});
    await prisma.linkRule.deleteMany({});
    await prisma.access.deleteMany({});
    await prisma.link.deleteMany({});
    await prisma.subscription.deleteMany({});
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.ruleCondition.deleteMany({});
    await prisma.linkRule.deleteMany({});
    await prisma.access.deleteMany({});
    await prisma.link.deleteMany({});
    await prisma.subscription.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  describe('Endpoints Work', () => {
    let standardToken, proToken, standardUserId, proUserId;

    beforeAll(async () => {
      const standard = await createTestUser('test_standard_simple', 'test_standard_simple@test.com');
      standardToken = standard.token;
      standardUserId = standard.user.id;

      const hashedPassword = await bcryptjs.hash('Test123!', 10);
      const proUser = await prisma.user.create({
        data: {
          username: 'test_pro_simple',
          email: 'test_pro_simple@test.com',
          password: hashedPassword,
          role: 'PRO',
          subscription: {
            create: {
              status: 'ACTIVE',
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              cancelAtPeriodEnd: false
            }
          }
        }
      });

      proUserId = proUser.id;
      proUserToken = jwt.sign({ id: proUser.id }, process.env.V2_AUTH_SECRET_KEY, {
        expiresIn: '7d',
        algorithm: 'HS256',
        issuer: 'linkkk-api',
        audience: 'linkkk-users',
      });
    });

    it('GET /subscription/status returns correct limits for STANDARD', async () => {
      const res = await request(app)
        .get('/subscription/status')
        .set('Cookie', `token=${standardToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.plan).toBe('STANDARD');
      expect(res.body.data.limits.links.max).toBe(50);
      expect(res.body.data.limits.rulesPerLink).toBe(3);
      expect(res.body.data.limits.conditionsPerRule).toBe(2);
    });

    it('GET /subscription/status returns correct limits for PRO', async () => {
      const res = await request(app)
        .get('/subscription/status')
        .set('Cookie', `token=${proUserToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.plan).toBe('PRO');
      expect(res.body.data.limits.links.unlimited).toBe(true);
      expect(res.body.data.limits.rulesPerLink).toBe(null); // Unlimited for PRO
      expect(res.body.data.limits.conditionsPerRule).toBe(null); // Unlimited for PRO
    });

    it('POST /subscription/dev/simulate-upgrade upgrades user', async () => {
      const res = await request(app)
        .post('/subscription/dev/simulate-upgrade')
        .set('Cookie', `token=${standardToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.role).toBe('PRO');

      const user = await prisma.user.findUnique({
        where: { id: standardUserId },
        include: { subscription: true }
      });

      expect(user.role).toBe('PRO');
      expect(user.subscription.status).toBe('ACTIVE');
    });

    it('POST /subscription/dev/simulate-cancel downgrades user', async () => {
      const res = await request(app)
        .post('/subscription/dev/simulate-cancel')
        .set('Cookie', `token=${proUserToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.role).toBe('STANDARD');

      const user = await prisma.user.findUnique({
        where: { id: proUserId },
        include: { subscription: true }
      });

      expect(user.role).toBe('STANDARD');
      expect(user.subscription.status).toBe('CANCELED');
    });
  });

  describe('Limits Enforcement', () => {
    let standardToken, proToken;

    beforeAll(async () => {
      // Clean up rules and links
      await prisma.ruleCondition.deleteMany({});
      await prisma.linkRule.deleteMany({});
      await prisma.link.deleteMany({});

      const standard = await createTestUser('test_limits_std', 'test_limits_std@test.com');
      standardToken = standard.token;

      const hashedPassword = await bcryptjs.hash('Test123!', 10);
      const proUser = await prisma.user.create({
        data: {
          username: 'test_limits_pro',
          email: 'test_limits_pro@test.com',
          password: hashedPassword,
          role: 'PRO'
        }
      });

      proToken = jwt.sign({ id: proUser.id }, process.env.V2_AUTH_SECRET_KEY, {
        expiresIn: '7d',
        algorithm: 'HS256',
        issuer: 'linkkk-api',
        audience: 'linkkk-users',
      });
    });

    beforeEach(async () => {
      // Clean links between each test
      await prisma.ruleCondition.deleteMany({});
      await prisma.linkRule.deleteMany({});
      await prisma.link.deleteMany({});
    });

    it('STANDARD users respect rule limit (3)', async () => {
      // Create link
      const linkRes = await request(app)
        .post('/link')
        .set('Cookie', `token=${standardToken}`)
        .send({ longUrl: 'https://example.com/test' });

      expect(linkRes.status).toBe(201);
      const shortUrl = linkRes.body.data.shortUrl;

      // Create 3 rules (at limit)
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post(`/link/${shortUrl}/rules`)
          .set('Cookie', `token=${standardToken}`)
          .send({
            action: { type: 'redirect', settings: { url: `https://example.com/${i}` } },
            conditions: []
          })
          .expect(201);
      }

      // 4th rule should fail
      const res = await request(app)
        .post(`/link/${shortUrl}/rules`)
        .set('Cookie', `token=${standardToken}`)
        .send({
          action: { type: 'redirect', settings: { url: 'https://example.com/over' } },
          conditions: []
        });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('RULE_LIMIT_EXCEEDED');
    });

    it('PRO users have unlimited rules per link', async () => {
      // Create link
      const linkRes = await request(app)
        .post('/link')
        .set('Cookie', `token=${proToken}`)
        .send({ longUrl: 'https://example.com/pro-test' });

      expect(linkRes.status).toBe(201);
      const shortUrl = linkRes.body.data.shortUrl;

      // Create 15 rules (more than STANDARD limit of 3)
      for (let i = 0; i < 15; i++) {
        const res = await request(app)
          .post(`/link/${shortUrl}/rules`)
          .set('Cookie', `token=${proToken}`)
          .send({
            action: { type: 'redirect', settings: { url: `https://example.com/pro/${i}` } },
            conditions: []
          });
        expect(res.status).toBe(201);
      }

      // Verify all 15 rules were created
      const rules = await prisma.linkRule.findMany({
        where: { link: { shortUrl } }
      });
      expect(rules.length).toBe(15);
    });

    it('STANDARD users limited to 2 conditions per rule', async () => {
      const linkRes = await request(app)
        .post('/link')
        .set('Cookie', `token=${standardToken}`)
        .send({ longUrl: 'https://example.com/cond-test' });

      const shortUrl = linkRes.body.data.shortUrl;

      // 3 conditions should fail
      const res = await request(app)
        .post(`/link/${shortUrl}/rules`)
        .set('Cookie', `token=${standardToken}`)
        .send({
          action: { type: 'redirect', settings: { url: 'https://example.com/1' } },
          conditions: [
            { field: 'country', operator: 'in', value: ['US'] },
            { field: 'device', operator: 'equals', value: 'mobile' },
            { field: 'is_bot', operator: 'equals', value: false }
          ]
        });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('CONDITION_LIMIT_EXCEEDED');
    });

    it('PRO users have unlimited conditions per rule', async () => {
      const linkRes = await request(app)
        .post('/link')
        .set('Cookie', `token=${proToken}`)
        .send({ longUrl: 'https://example.com/pro-cond' });

      const shortUrl = linkRes.body.data.shortUrl;

      // Create rule with 5 conditions (more than STANDARD limit of 2)
      const res = await request(app)
        .post(`/link/${shortUrl}/rules`)
        .set('Cookie', `token=${proToken}`)
        .send({
          action: { type: 'redirect', settings: { url: 'https://example.com/1' } },
          conditions: [
            { field: 'country', operator: 'in', value: ['US', 'ES', 'FR'] },
            { field: 'device', operator: 'equals', value: 'mobile' },
            { field: 'is_bot', operator: 'equals', value: false },
            { field: 'is_vpn', operator: 'equals', value: false },
            { field: 'access_count', operator: 'less_than', value: 10 }
          ]
        });

      expect(res.status).toBe(201);

      // Verify all 5 conditions were created
      const rule = await prisma.linkRule.findFirst({
        where: { link: { shortUrl } },
        include: { conditions: true }
      });
      expect(rule.conditions.length).toBe(5);
    });
  });
});
