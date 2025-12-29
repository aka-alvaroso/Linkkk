require('./setup');
const request = require('supertest');
const { app, createTestUser, prisma } = require('./helpers');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

  describe('Link Deletion on Downgrade', () => {
    it('should delete oldest links when user has more than 50 links', async () => {
      // Create PRO user
      const hashedPassword = await bcryptjs.hash('Test123!', 10);
      const proUser = await prisma.user.create({
        data: {
          username: 'test_pro_links',
          email: 'test_pro_links@test.com',
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

      const token = jwt.sign({ id: proUser.id }, process.env.V2_AUTH_SECRET_KEY, {
        expiresIn: '7d',
        algorithm: 'HS256',
        issuer: 'linkkk-api',
        audience: 'linkkk-users',
      });

      // Create 60 links (10 more than STANDARD limit)
      const links = [];
      for (let i = 0; i < 60; i++) {
        const link = await prisma.link.create({
          data: {
            userId: proUser.id,
            shortUrl: `link${i}`,
            longUrl: `https://example.com/${i}`,
            createdAt: new Date(Date.now() - (60 - i) * 60 * 1000) // Oldest first
          }
        });
        links.push(link);
      }

      // Verify we have 60 links
      const beforeCount = await prisma.link.count({ where: { userId: proUser.id } });
      expect(beforeCount).toBe(60);

      // Downgrade
      const res = await request(app)
        .post('/subscription/dev/simulate-cancel')
        .set('Cookie', `token=${token}`);

      expect(res.status).toBe(200);

      // Verify only 50 links remain
      const afterCount = await prisma.link.count({ where: { userId: proUser.id } });
      expect(afterCount).toBe(50);

      // Verify oldest 10 links were deleted
      for (let i = 0; i < 10; i++) {
        const exists = await prisma.link.findUnique({
          where: { shortUrl: `link${i}` }
        });
        expect(exists).toBeNull();
      }

      // Verify newest 50 links still exist
      for (let i = 10; i < 60; i++) {
        const exists = await prisma.link.findUnique({
          where: { shortUrl: `link${i}` }
        });
        expect(exists).not.toBeNull();
      }
    });

    it('should not delete links when user has less than 50 links', async () => {
      const hashedPassword = await bcryptjs.hash('Test123!', 10);
      const proUser = await prisma.user.create({
        data: {
          username: 'test_pro_few_links',
          email: 'test_pro_few_links@test.com',
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

      const token = jwt.sign({ id: proUser.id }, process.env.V2_AUTH_SECRET_KEY, {
        expiresIn: '7d',
        algorithm: 'HS256',
        issuer: 'linkkk-api',
        audience: 'linkkk-users',
      });

      // Create only 30 links
      for (let i = 0; i < 30; i++) {
        await prisma.link.create({
          data: {
            userId: proUser.id,
            shortUrl: `fewlink${i}`,
            longUrl: `https://example.com/${i}`
          }
        });
      }

      const beforeCount = await prisma.link.count({ where: { userId: proUser.id } });
      expect(beforeCount).toBe(30);

      // Downgrade
      await request(app)
        .post('/subscription/dev/simulate-cancel')
        .set('Cookie', `token=${token}`);

      // All 30 links should still exist
      const afterCount = await prisma.link.count({ where: { userId: proUser.id } });
      expect(afterCount).toBe(30);
    });
  });

  describe('Rule Deletion on Downgrade', () => {
    it('should delete excess rules when link has more than 3 rules', async () => {
      const hashedPassword = await bcryptjs.hash('Test123!', 10);
      const proUser = await prisma.user.create({
        data: {
          username: 'test_pro_rules',
          email: 'test_pro_rules@test.com',
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

      const token = jwt.sign({ id: proUser.id }, process.env.V2_AUTH_SECRET_KEY, {
        expiresIn: '7d',
        algorithm: 'HS256',
        issuer: 'linkkk-api',
        audience: 'linkkk-users',
      });

      // Create link
      const link = await prisma.link.create({
        data: {
          userId: proUser.id,
          shortUrl: 'rulelink',
          longUrl: 'https://example.com/rules'
        }
      });

      // Create 5 rules (2 more than STANDARD limit)
      for (let i = 0; i < 5; i++) {
        await prisma.linkRule.create({
          data: {
            linkId: link.id,
            priority: i,
            actionType: 'redirect',
            actionSettings: { url: `https://example.com/${i}` }
          }
        });
      }

      const beforeCount = await prisma.linkRule.count({ where: { linkId: link.id } });
      expect(beforeCount).toBe(5);

      // Downgrade
      await request(app)
        .post('/subscription/dev/simulate-cancel')
        .set('Cookie', `token=${token}`);

      // Should only have 3 rules left
      const afterCount = await prisma.linkRule.count({ where: { linkId: link.id } });
      expect(afterCount).toBe(3);

      // Verify the first 3 rules by priority remain
      const remainingRules = await prisma.linkRule.findMany({
        where: { linkId: link.id },
        orderBy: { priority: 'asc' }
      });

      expect(remainingRules).toHaveLength(3);
      expect(remainingRules[0].priority).toBe(0);
      expect(remainingRules[1].priority).toBe(1);
      expect(remainingRules[2].priority).toBe(2);
    });

    it('should delete excess rules across multiple links', async () => {
      const hashedPassword = await bcryptjs.hash('Test123!', 10);
      const proUser = await prisma.user.create({
        data: {
          username: 'test_pro_multi_rules',
          email: 'test_pro_multi_rules@test.com',
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

      const token = jwt.sign({ id: proUser.id }, process.env.V2_AUTH_SECRET_KEY, {
        expiresIn: '7d',
        algorithm: 'HS256',
        issuer: 'linkkk-api',
        audience: 'linkkk-users',
      });

      // Create 3 links with 5 rules each
      for (let linkIdx = 0; linkIdx < 3; linkIdx++) {
        const link = await prisma.link.create({
          data: {
            userId: proUser.id,
            shortUrl: `multilink${linkIdx}`,
            longUrl: `https://example.com/multi${linkIdx}`
          }
        });

        for (let ruleIdx = 0; ruleIdx < 5; ruleIdx++) {
          await prisma.linkRule.create({
            data: {
              linkId: link.id,
              priority: ruleIdx,
              actionType: 'redirect',
              actionSettings: { url: `https://example.com/${linkIdx}/${ruleIdx}` }
            }
          });
        }
      }

      const beforeCount = await prisma.linkRule.count({
        where: { link: { userId: proUser.id } }
      });
      expect(beforeCount).toBe(15); // 3 links * 5 rules

      // Downgrade
      await request(app)
        .post('/subscription/dev/simulate-cancel')
        .set('Cookie', `token=${token}`);

      // Should only have 9 rules left (3 links * 3 rules)
      const afterCount = await prisma.linkRule.count({
        where: { link: { userId: proUser.id } }
      });
      expect(afterCount).toBe(9);
    });
  });

  describe('Condition Deletion on Downgrade', () => {
    it('should delete excess conditions when rule has more than 2 conditions', async () => {
      const hashedPassword = await bcryptjs.hash('Test123!', 10);
      const proUser = await prisma.user.create({
        data: {
          username: 'test_pro_conditions',
          email: 'test_pro_conditions@test.com',
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

      const token = jwt.sign({ id: proUser.id }, process.env.V2_AUTH_SECRET_KEY, {
        expiresIn: '7d',
        algorithm: 'HS256',
        issuer: 'linkkk-api',
        audience: 'linkkk-users',
      });

      // Create link
      const link = await prisma.link.create({
        data: {
          userId: proUser.id,
          shortUrl: 'condlink',
          longUrl: 'https://example.com/conditions'
        }
      });

      // Create rule with 4 conditions (2 more than STANDARD limit)
      const rule = await prisma.linkRule.create({
        data: {
          linkId: link.id,
          priority: 0,
          actionType: 'redirect',
          actionSettings: { url: 'https://example.com/dest' }
        }
      });

      for (let i = 0; i < 4; i++) {
        await prisma.ruleCondition.create({
          data: {
            ruleId: rule.id,
            field: 'country',
            operator: 'in',
            value: ['US', 'ES']
          }
        });
      }

      const beforeCount = await prisma.ruleCondition.count({ where: { ruleId: rule.id } });
      expect(beforeCount).toBe(4);

      // Downgrade
      await request(app)
        .post('/subscription/dev/simulate-cancel')
        .set('Cookie', `token=${token}`);

      // Should only have 2 conditions left
      const afterCount = await prisma.ruleCondition.count({ where: { ruleId: rule.id } });
      expect(afterCount).toBe(2);
    });

    it('should handle conditions across multiple rules', async () => {
      const hashedPassword = await bcryptjs.hash('Test123!', 10);
      const proUser = await prisma.user.create({
        data: {
          username: 'test_pro_multi_cond',
          email: 'test_pro_multi_cond@test.com',
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

      const token = jwt.sign({ id: proUser.id }, process.env.V2_AUTH_SECRET_KEY, {
        expiresIn: '7d',
        algorithm: 'HS256',
        issuer: 'linkkk-api',
        audience: 'linkkk-users',
      });

      // Create link
      const link = await prisma.link.create({
        data: {
          userId: proUser.id,
          shortUrl: 'multicondlink',
          longUrl: 'https://example.com/multicond'
        }
      });

      // Create 3 rules, each with 4 conditions
      for (let ruleIdx = 0; ruleIdx < 3; ruleIdx++) {
        const rule = await prisma.linkRule.create({
          data: {
            linkId: link.id,
            priority: ruleIdx,
            actionType: 'redirect',
            actionSettings: { url: `https://example.com/${ruleIdx}` }
          }
        });

        for (let condIdx = 0; condIdx < 4; condIdx++) {
          await prisma.ruleCondition.create({
            data: {
              ruleId: rule.id,
              field: 'country',
              operator: 'in',
              value: ['US']
            }
          });
        }
      }

      const beforeCount = await prisma.ruleCondition.count({
        where: { rule: { linkId: link.id } }
      });
      expect(beforeCount).toBe(12); // 3 rules * 4 conditions

      // Downgrade
      await request(app)
        .post('/subscription/dev/simulate-cancel')
        .set('Cookie', `token=${token}`);

      // Should only have 6 conditions left (3 rules * 2 conditions)
      const afterCount = await prisma.ruleCondition.count({
        where: { rule: { linkId: link.id } }
      });
      expect(afterCount).toBe(6);
    });
  });

  describe('Access Records Deletion on Downgrade', () => {
    it('should delete access records older than 30 days', async () => {
      const hashedPassword = await bcryptjs.hash('Test123!', 10);
      const proUser = await prisma.user.create({
        data: {
          username: 'test_pro_access',
          email: 'test_pro_access@test.com',
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

      const token = jwt.sign({ id: proUser.id }, process.env.V2_AUTH_SECRET_KEY, {
        expiresIn: '7d',
        algorithm: 'HS256',
        issuer: 'linkkk-api',
        audience: 'linkkk-users',
      });

      // Create link
      const link = await prisma.link.create({
        data: {
          userId: proUser.id,
          shortUrl: 'accesslink',
          longUrl: 'https://example.com/access'
        }
      });

      // Create access records: 5 old (>30 days) and 5 recent (<30 days)
      for (let i = 0; i < 5; i++) {
        await prisma.access.create({
          data: {
            linkId: link.id,
            userAgent: 'test-agent',
            ip: '1.1.1.1',
            country: 'US',
            isVPN: false,
            isBot: false,
            createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000) // 40 days ago
          }
        });
      }

      for (let i = 0; i < 5; i++) {
        await prisma.access.create({
          data: {
            linkId: link.id,
            userAgent: 'test-agent',
            ip: '1.1.1.1',
            country: 'US',
            isVPN: false,
            isBot: false,
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
          }
        });
      }

      const beforeCount = await prisma.access.count({ where: { linkId: link.id } });
      expect(beforeCount).toBe(10);

      // Downgrade
      await request(app)
        .post('/subscription/dev/simulate-cancel')
        .set('Cookie', `token=${token}`);

      // Should only have 5 recent access records left
      const afterCount = await prisma.access.count({ where: { linkId: link.id } });
      expect(afterCount).toBe(5);

      // Verify all remaining records are within 30 days
      const remainingAccesses = await prisma.access.findMany({
        where: { linkId: link.id }
      });

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      remainingAccesses.forEach(access => {
        expect(access.createdAt.getTime()).toBeGreaterThan(thirtyDaysAgo.getTime());
      });
    });

    it('should delete old access records across multiple links', async () => {
      const hashedPassword = await bcryptjs.hash('Test123!', 10);
      const proUser = await prisma.user.create({
        data: {
          username: 'test_pro_multi_access',
          email: 'test_pro_multi_access@test.com',
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

      const token = jwt.sign({ id: proUser.id }, process.env.V2_AUTH_SECRET_KEY, {
        expiresIn: '7d',
        algorithm: 'HS256',
        issuer: 'linkkk-api',
        audience: 'linkkk-users',
      });

      // Create 3 links
      const links = [];
      for (let i = 0; i < 3; i++) {
        const link = await prisma.link.create({
          data: {
            userId: proUser.id,
            shortUrl: `multiaccesslink${i}`,
            longUrl: `https://example.com/access${i}`
          }
        });
        links.push(link);

        // Each link gets 3 old and 3 recent access records
        for (let j = 0; j < 3; j++) {
          await prisma.access.create({
            data: {
              linkId: link.id,
              userAgent: 'test-agent',
              ip: '1.1.1.1',
              country: 'US',
              isVPN: false,
              isBot: false,
              createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000)
            }
          });
        }

        for (let j = 0; j < 3; j++) {
          await prisma.access.create({
            data: {
              linkId: link.id,
              userAgent: 'test-agent',
              ip: '1.1.1.1',
              country: 'US',
              isVPN: false,
              isBot: false,
              createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
            }
          });
        }
      }

      const beforeCount = await prisma.access.count({
        where: { linkId: { in: links.map(l => l.id) } }
      });
      expect(beforeCount).toBe(18); // 3 links * 6 accesses

      // Downgrade
      await request(app)
        .post('/subscription/dev/simulate-cancel')
        .set('Cookie', `token=${token}`);

      // Should only have 9 recent access records left (3 links * 3 recent accesses)
      const afterCount = await prisma.access.count({
        where: { linkId: { in: links.map(l => l.id) } }
      });
      expect(afterCount).toBe(9);
    });
  });

  describe('Complete Downgrade Scenario', () => {
    it('should handle all cleanup operations together', async () => {
      const hashedPassword = await bcryptjs.hash('Test123!', 10);
      const proUser = await prisma.user.create({
        data: {
          username: 'test_pro_complete',
          email: 'test_pro_complete@test.com',
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

      const token = jwt.sign({ id: proUser.id }, process.env.V2_AUTH_SECRET_KEY, {
        expiresIn: '7d',
        algorithm: 'HS256',
        issuer: 'linkkk-api',
        audience: 'linkkk-users',
      });

      // Create 60 links (10 over limit)
      for (let i = 0; i < 60; i++) {
        const link = await prisma.link.create({
          data: {
            userId: proUser.id,
            shortUrl: `complete${i}`,
            longUrl: `https://example.com/${i}`,
            createdAt: new Date(Date.now() - (60 - i) * 60 * 1000)
          }
        });

        // Each link gets 5 rules (2 over limit)
        for (let j = 0; j < 5; j++) {
          const rule = await prisma.linkRule.create({
            data: {
              linkId: link.id,
              priority: j,
              actionType: 'redirect',
              actionSettings: { url: `https://example.com/${i}/${j}` }
            }
          });

          // Each rule gets 4 conditions (2 over limit)
          for (let k = 0; k < 4; k++) {
            await prisma.ruleCondition.create({
              data: {
                ruleId: rule.id,
                field: 'country',
                operator: 'in',
                value: ['US']
              }
            });
          }
        }

        // Each link gets access records (3 old, 3 recent)
        for (let j = 0; j < 3; j++) {
          await prisma.access.create({
            data: {
              linkId: link.id,
              userAgent: 'test-agent',
              ip: '1.1.1.1',
              country: 'US',
              isVPN: false,
              isBot: false,
              createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000)
            }
          });
        }

        for (let j = 0; j < 3; j++) {
          await prisma.access.create({
            data: {
              linkId: link.id,
              userAgent: 'test-agent',
              ip: '1.1.1.1',
              country: 'US',
              isVPN: false,
              isBot: false,
              createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
            }
          });
        }
      }

      // Verify initial state
      const initialLinks = await prisma.link.count({ where: { userId: proUser.id } });
      const initialRules = await prisma.linkRule.count({
        where: { link: { userId: proUser.id } }
      });
      const initialConditions = await prisma.ruleCondition.count({
        where: { rule: { link: { userId: proUser.id } } }
      });
      const initialAccesses = await prisma.access.count({
        where: { link: { userId: proUser.id } }
      });

      expect(initialLinks).toBe(60);
      expect(initialRules).toBe(300); // 60 links * 5 rules
      expect(initialConditions).toBe(1200); // 300 rules * 4 conditions
      expect(initialAccesses).toBe(360); // 60 links * 6 accesses

      // Downgrade
      const res = await request(app)
        .post('/subscription/dev/simulate-cancel')
        .set('Cookie', `token=${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.role).toBe('STANDARD');

      // Verify final state
      const finalLinks = await prisma.link.count({ where: { userId: proUser.id } });
      const finalRules = await prisma.linkRule.count({
        where: { link: { userId: proUser.id } }
      });
      const finalConditions = await prisma.ruleCondition.count({
        where: { rule: { link: { userId: proUser.id } } }
      });
      const finalAccesses = await prisma.access.count({
        where: { link: { userId: proUser.id } }
      });

      // Verify limits are enforced
      expect(finalLinks).toBe(50); // Max 50 links
      expect(finalRules).toBe(150); // 50 links * 3 rules max
      expect(finalConditions).toBe(300); // 150 rules * 2 conditions max
      expect(finalAccesses).toBe(150); // 50 links * 3 recent accesses (old ones deleted)

      // Verify user and subscription updated
      const updatedUser = await prisma.user.findUnique({
        where: { id: proUser.id },
        include: { subscription: true }
      });

      expect(updatedUser.role).toBe('STANDARD');
      expect(updatedUser.subscription.status).toBe('CANCELED');
      expect(updatedUser.subscription.cancelAtPeriodEnd).toBe(false);
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
