require('./setup');
const request = require('supertest');
const { app, createTestUser, prisma } = require('./helpers');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const DAY = 24 * 60 * 60 * 1000;

// Creates a PRO user with an active subscription and a session token.
const createProUser = async (name) => {
  const hashedPassword = await bcryptjs.hash('Test123!', 10);
  const proUser = await prisma.user.create({
    data: {
      username: name,
      email: `${name}@test.com`,
      password: hashedPassword,
      role: 'PRO',
      subscription: {
        create: {
          status: 'ACTIVE',
          currentPeriodEnd: new Date(Date.now() + 30 * DAY),
          cancelAtPeriodEnd: false,
        },
      },
    },
  });

  const token = jwt.sign({ id: proUser.id }, process.env.V2_AUTH_SECRET_KEY, {
    expiresIn: '7d',
    algorithm: 'HS256',
    issuer: 'linkkk-api',
    audience: 'linkkk-users',
  });

  return { proUser, token };
};

const downgrade = (token) =>
  request(app).post('/subscription/dev/simulate-cancel').set('Cookie', `token=${token}`);

describe('Subscription Downgrade - Comprehensive Tests', () => {
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

  // Downgrading must never delete what the user already has: a QR printed a
  // year ago has to keep working after they stop paying.
  describe('Links, rules and conditions are kept on downgrade', () => {
    it('keeps every link even when the user is over the 50 link limit', async () => {
      const { proUser, token } = await createProUser('test_pro_links');

      for (let i = 0; i < 60; i++) {
        await prisma.link.create({
          data: {
            userId: proUser.id,
            shortUrl: `link${i}`,
            longUrl: `https://example.com/${i}`,
            createdAt: new Date(Date.now() - (60 - i) * 60 * 1000),
          },
        });
      }

      const res = await downgrade(token);
      expect(res.status).toBe(200);

      expect(await prisma.link.count({ where: { userId: proUser.id } })).toBe(60);

      // Including the oldest ones, the most likely to be printed already
      for (let i = 0; i < 10; i++) {
        const exists = await prisma.link.findUnique({ where: { shortUrl: `link${i}` } });
        expect(exists).not.toBeNull();
      }
    });

    it('keeps every rule when a link has more than 3 rules', async () => {
      const { proUser, token } = await createProUser('test_pro_rules');

      const link = await prisma.link.create({
        data: { userId: proUser.id, shortUrl: 'rulelink', longUrl: 'https://example.com/rules' },
      });

      for (let i = 0; i < 5; i++) {
        await prisma.linkRule.create({
          data: {
            linkId: link.id,
            priority: i,
            actionType: 'redirect',
            actionSettings: { url: `https://example.com/${i}` },
          },
        });
      }

      await downgrade(token);

      const rules = await prisma.linkRule.findMany({
        where: { linkId: link.id },
        orderBy: { priority: 'asc' },
      });
      expect(rules).toHaveLength(5);
      expect(rules.map((r) => r.priority)).toEqual([0, 1, 2, 3, 4]);
    });

    it('keeps every condition when a rule has more than 2 conditions', async () => {
      const { proUser, token } = await createProUser('test_pro_conditions');

      const link = await prisma.link.create({
        data: { userId: proUser.id, shortUrl: 'condlink', longUrl: 'https://example.com/conditions' },
      });

      const rule = await prisma.linkRule.create({
        data: {
          linkId: link.id,
          priority: 0,
          actionType: 'redirect',
          actionSettings: { url: 'https://example.com/dest' },
        },
      });

      for (let i = 0; i < 4; i++) {
        await prisma.ruleCondition.create({
          data: { ruleId: rule.id, field: 'country', operator: 'in', value: ['US', 'ES'] },
        });
      }

      await downgrade(token);

      expect(await prisma.ruleCondition.count({ where: { ruleId: rule.id } })).toBe(4);
    });
  });

  describe('Access history on downgrade', () => {
    it('removes access records older than 30 days and keeps the recent ones', async () => {
      const { proUser, token } = await createProUser('test_pro_access');

      const link = await prisma.link.create({
        data: { userId: proUser.id, shortUrl: 'accesslink', longUrl: 'https://example.com/access' },
      });

      const makeAccess = (daysAgo) =>
        prisma.access.create({
          data: {
            linkId: link.id,
            userAgent: 'test-agent',
            ip: '1.1.1.1',
            country: 'US',
            isVPN: false,
            isBot: false,
            createdAt: new Date(Date.now() - daysAgo * DAY),
          },
        });

      for (let i = 0; i < 5; i++) await makeAccess(40);
      for (let i = 0; i < 5; i++) await makeAccess(10);

      await downgrade(token);

      const remaining = await prisma.access.findMany({ where: { linkId: link.id } });
      expect(remaining).toHaveLength(5);

      const thirtyDaysAgo = new Date(Date.now() - 30 * DAY);
      remaining.forEach((access) => {
        expect(access.createdAt.getTime()).toBeGreaterThan(thirtyDaysAgo.getTime());
      });
    });
  });

  describe('Complete Downgrade Scenario', () => {
    it('keeps links, rules and conditions, trims old accesses and updates the plan', async () => {
      const { proUser, token } = await createProUser('test_pro_complete');

      // 60 links (10 over the limit), each with 5 rules (2 over) of 4 conditions (2 over)
      for (let i = 0; i < 60; i++) {
        const link = await prisma.link.create({
          data: {
            userId: proUser.id,
            shortUrl: `complete${i}`,
            longUrl: `https://example.com/${i}`,
            createdAt: new Date(Date.now() - (60 - i) * 60 * 1000),
          },
        });

        for (let j = 0; j < 5; j++) {
          const rule = await prisma.linkRule.create({
            data: {
              linkId: link.id,
              priority: j,
              actionType: 'redirect',
              actionSettings: { url: `https://example.com/${i}/${j}` },
            },
          });

          for (let k = 0; k < 4; k++) {
            await prisma.ruleCondition.create({
              data: { ruleId: rule.id, field: 'country', operator: 'in', value: ['US'] },
            });
          }
        }

        // 3 old (>30 days) and 3 recent accesses per link
        for (const daysAgo of [40, 40, 40, 10, 10, 10]) {
          await prisma.access.create({
            data: {
              linkId: link.id,
              userAgent: 'test-agent',
              ip: '1.1.1.1',
              country: 'US',
              isVPN: false,
              isBot: false,
              createdAt: new Date(Date.now() - daysAgo * DAY),
            },
          });
        }
      }

      const res = await downgrade(token);
      expect(res.status).toBe(200);
      expect(res.body.data.role).toBe('STANDARD');

      const count = async () => ({
        links: await prisma.link.count({ where: { userId: proUser.id } }),
        rules: await prisma.linkRule.count({ where: { link: { userId: proUser.id } } }),
        conditions: await prisma.ruleCondition.count({ where: { rule: { link: { userId: proUser.id } } } }),
        accesses: await prisma.access.count({ where: { link: { userId: proUser.id } } }),
      });

      expect(await count()).toEqual({
        links: 60, // nothing deleted
        rules: 300, // nothing deleted
        conditions: 1200, // nothing deleted
        accesses: 180, // 60 links * 3 recent; the old ones are trimmed
      });

      const updatedUser = await prisma.user.findUnique({
        where: { id: proUser.id },
        include: { subscription: true },
      });

      expect(updatedUser.role).toBe('STANDARD');
      expect(updatedUser.subscription.status).toBe('CANCELED');
      expect(updatedUser.subscription.cancelAtPeriodEnd).toBe(false);
    });

    it('still blocks creating new links beyond the free limit after downgrading', async () => {
      const { proUser, token } = await createProUser('test_pro_blocked_create');

      for (let i = 0; i < 55; i++) {
        await prisma.link.create({
          data: { userId: proUser.id, shortUrl: `blocked${i}`, longUrl: `https://example.com/b${i}` },
        });
      }

      await downgrade(token);

      const res = await request(app)
        .post('/link')
        .set('Cookie', `token=${token}`)
        .send({ longUrl: 'https://example.com/new' });

      // Over the limit: creation is refused for the right reason, and nothing existing was touched
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('LINK_LIMIT_EXCEEDED');
      expect(await prisma.link.count({ where: { userId: proUser.id } })).toBe(55);
    });
  });

  // A rule kept over the free limit must stay editable (e.g. to change the
  // destination of a printed QR) as long as the edit does not add conditions.
  describe('Editing an over-limit rule after downgrade', () => {
    const threeConditions = [
      { field: 'device', operator: 'equals', value: 'tablet' },
      { field: 'device', operator: 'equals', value: 'mobile' },
      { field: 'device', operator: 'equals', value: 'desktop' },
    ];

    const setup = async (name, shortUrl) => {
      const { proUser, token } = await createProUser(name);
      const link = await prisma.link.create({
        data: { userId: proUser.id, shortUrl, longUrl: 'https://example.com/long' },
      });
      const rule = await prisma.linkRule.create({
        data: {
          linkId: link.id,
          priority: 0,
          actionType: 'redirect',
          actionSettings: { url: 'https://example.com/old' },
          conditions: { create: threeConditions },
        },
      });
      await downgrade(token);
      return { link, rule, token };
    };

    const putRule = (token, link, rule, body) =>
      request(app)
        .put(`/link/${link.shortUrl}/rules/${rule.id}`)
        .set('Cookie', `token=${token}`)
        .send(body);

    it('lets the owner change the destination while keeping the 3 conditions', async () => {
      const { link, rule, token } = await setup('test_over_edit_ok', 'overeditok');

      const res = await putRule(token, link, rule, {
        action: { type: 'redirect', settings: { url: 'https://example.com/new' } },
        conditions: threeConditions,
      });

      expect(res.status).toBe(200);
      const updated = await prisma.linkRule.findUnique({
        where: { id: rule.id },
        include: { conditions: true },
      });
      expect(updated.actionSettings.url).toBe('https://example.com/new');
      expect(updated.conditions).toHaveLength(3);
    });

    it('still refuses adding a 4th condition', async () => {
      const { link, rule, token } = await setup('test_over_edit_add', 'overeditadd');

      const res = await putRule(token, link, rule, {
        conditions: [...threeConditions, { field: 'country', operator: 'in', value: ['ES'] }],
      });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('CONDITION_LIMIT_EXCEEDED');
      expect(await prisma.ruleCondition.count({ where: { ruleId: rule.id } })).toBe(3);
    });

    it('allows reducing the rule to the free limit', async () => {
      const { link, rule, token } = await setup('test_over_edit_reduce', 'overeditreduce');

      const res = await putRule(token, link, rule, { conditions: threeConditions.slice(0, 2) });

      expect(res.status).toBe(200);
      expect(await prisma.ruleCondition.count({ where: { ruleId: rule.id } })).toBe(2);
    });
  });

  describe('Upgrade Tests', () => {
    it('should successfully upgrade STANDARD user to PRO', async () => {
      const standard = await createTestUser('test_upgrade_test', 'test_upgrade_test@test.com');

      // Verify user is STANDARD
      let user = await prisma.user.findUnique({
        where: { id: standard.user.id },
        include: { subscription: true }
      });
      expect(user.role).toBe('STANDARD');
      expect(user.subscription).toBeNull();

      // Upgrade
      const res = await request(app)
        .post('/subscription/dev/simulate-upgrade')
        .set('Cookie', `token=${standard.token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.role).toBe('PRO');

      // Verify upgrade
      user = await prisma.user.findUnique({
        where: { id: standard.user.id },
        include: { subscription: true }
      });

      expect(user.role).toBe('PRO');
      expect(user.subscription).not.toBeNull();
      expect(user.subscription.status).toBe('ACTIVE');
      expect(user.subscription.cancelAtPeriodEnd).toBe(false);
      expect(user.subscription.currentPeriodEnd).not.toBeNull();
    });

    it('should update existing subscription on upgrade', async () => {
      const hashedPassword = await bcryptjs.hash('Test123!', 10);
      const user = await prisma.user.create({
        data: {
          username: 'test_reupgrade_test',
          email: 'test_reupgrade_test@test.com',
          password: hashedPassword,
          role: 'STANDARD',
          subscription: {
            create: {
              status: 'CANCELED',
              currentPeriodEnd: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
              cancelAtPeriodEnd: false
            }
          }
        },
        include: { subscription: true }
      });

      const token = jwt.sign({ id: user.id }, process.env.V2_AUTH_SECRET_KEY, {
        expiresIn: '7d',
        algorithm: 'HS256',
        issuer: 'linkkk-api',
        audience: 'linkkk-users',
      });

      // Verify initial state
      expect(user.subscription.status).toBe('CANCELED');

      // Upgrade
      const res = await request(app)
        .post('/subscription/dev/simulate-upgrade')
        .set('Cookie', `token=${token}`);

      expect(res.status).toBe(200);

      // Verify subscription updated
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { subscription: true }
      });

      expect(updatedUser.role).toBe('PRO');
      expect(updatedUser.subscription.status).toBe('ACTIVE');
      expect(updatedUser.subscription.cancelAtPeriodEnd).toBe(false);
      expect(updatedUser.subscription.currentPeriodEnd.getTime()).toBeGreaterThan(Date.now());
    });
  });
});
