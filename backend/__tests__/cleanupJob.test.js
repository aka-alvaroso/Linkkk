/**
 * Cleanup Job Tests
 * Tests for the automatic cleanup of expired guest sessions and old access records
 */

require('./setup');
const prisma = require('../v2/prisma/client');
const { cleanupExpiredGuestLinks } = require('../v2/jobs/cleanupGuestLinks');
const planLimits = require('../v2/utils/limits');

describe('Cleanup Job', () => {
  let testUser;
  let guestSession1;
  let guestSession2;

  beforeEach(async () => {
    // Clean up before each test
    await prisma.access.deleteMany({});
    await prisma.link.deleteMany({});
    await prisma.guestSession.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        username: {
          startsWith: 'test_cleanup_'
        }
      }
    });

    // Create a test user
    testUser = await prisma.user.create({
      data: {
        username: 'test_cleanup_user',
        email: 'test_cleanup@test.com',
        password: 'hashedpassword123'
      }
    });

    // Create guest sessions
    guestSession1 = await prisma.guestSession.create({
      data: {
        createdAt: new Date()
      }
    });

    guestSession2 = await prisma.guestSession.create({
      data: {
        createdAt: new Date()
      }
    });
  });

  afterEach(async () => {
    // Clean up after each test
    await prisma.access.deleteMany({});
    await prisma.link.deleteMany({});
    await prisma.guestSession.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        username: {
          startsWith: 'test_cleanup_'
        }
      }
    });
  });

  describe('Guest Links and Sessions Cleanup', () => {
    it('should delete guest links older than 7 days', async () => {
      const EXPIRATION_DAYS = planLimits.guest.linkExpiration;
      const oldDate = new Date(Date.now() - (EXPIRATION_DAYS + 1) * 24 * 60 * 60 * 1000);
      const recentDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000); // 1 day ago

      // Create old guest link (should be deleted)
      const oldLink = await prisma.link.create({
        data: {
          guestSessionId: guestSession1.id,
          shortUrl: 'old123',
          longUrl: 'https://example.com/old',
          createdAt: oldDate
        }
      });

      // Create recent guest link (should NOT be deleted)
      const recentLink = await prisma.link.create({
        data: {
          guestSessionId: guestSession2.id,
          shortUrl: 'recent123',
          longUrl: 'https://example.com/recent',
          createdAt: recentDate
        }
      });

      // Run cleanup
      const result = await cleanupExpiredGuestLinks();

      // Verify old link was deleted
      const oldLinkAfter = await prisma.link.findUnique({
        where: { id: oldLink.id }
      });
      expect(oldLinkAfter).toBeNull();

      // Verify recent link still exists
      const recentLinkAfter = await prisma.link.findUnique({
        where: { id: recentLink.id }
      });
      expect(recentLinkAfter).not.toBeNull();

      // Verify result
      expect(result.links).toBe(1);
    });

    it('should delete guest sessions older than 7 days', async () => {
      const EXPIRATION_DAYS = planLimits.guest.linkExpiration;
      const oldDate = new Date(Date.now() - (EXPIRATION_DAYS + 1) * 24 * 60 * 60 * 1000);

      // Create old guest session
      const oldSession = await prisma.guestSession.create({
        data: {
          createdAt: oldDate
        }
      });

      // Run cleanup
      const result = await cleanupExpiredGuestLinks();

      // Verify old session was deleted
      const oldSessionAfter = await prisma.guestSession.findUnique({
        where: { id: oldSession.id }
      });
      expect(oldSessionAfter).toBeNull();

      // Verify recent sessions still exist
      const session1After = await prisma.guestSession.findUnique({
        where: { id: guestSession1.id }
      });
      const session2After = await prisma.guestSession.findUnique({
        where: { id: guestSession2.id }
      });
      expect(session1After).not.toBeNull();
      expect(session2After).not.toBeNull();

      expect(result.sessions).toBeGreaterThanOrEqual(1);
    });

    it('should cascade delete access records when deleting guest links', async () => {
      const EXPIRATION_DAYS = planLimits.guest.linkExpiration;
      const oldDate = new Date(Date.now() - (EXPIRATION_DAYS + 1) * 24 * 60 * 60 * 1000);

      // Create old guest link
      const oldLink = await prisma.link.create({
        data: {
          guestSessionId: guestSession1.id,
          shortUrl: 'old456',
          longUrl: 'https://example.com/old2',
          createdAt: oldDate
        }
      });

      // Create access records for old link
      await prisma.access.createMany({
        data: [
          {
            linkId: oldLink.id,
            userAgent: 'Test Agent',
            ip: '127.0.0.1',
            country: 'US',
            isVPN: false,
            isBot: false,
            createdAt: oldDate
          },
          {
            linkId: oldLink.id,
            userAgent: 'Test Agent 2',
            ip: '127.0.0.2',
            country: 'US',
            isVPN: false,
            isBot: false,
            createdAt: oldDate
          }
        ]
      });

      // Verify access records exist
      const accessBefore = await prisma.access.count({
        where: { linkId: oldLink.id }
      });
      expect(accessBefore).toBe(2);

      // Run cleanup
      await cleanupExpiredGuestLinks();

      // Verify access records were cascade deleted
      const accessAfter = await prisma.access.count({
        where: { linkId: oldLink.id }
      });
      expect(accessAfter).toBe(0);
    });

    it('should NOT delete links from registered users', async () => {
      const EXPIRATION_DAYS = planLimits.guest.linkExpiration;
      const oldDate = new Date(Date.now() - (EXPIRATION_DAYS + 1) * 24 * 60 * 60 * 1000);

      // Create old user link (should NOT be deleted)
      const userLink = await prisma.link.create({
        data: {
          userId: testUser.id,
          shortUrl: 'user789',
          longUrl: 'https://example.com/user',
          createdAt: oldDate
        }
      });

      // Run cleanup
      await cleanupExpiredGuestLinks();

      // Verify user link still exists
      const userLinkAfter = await prisma.link.findUnique({
        where: { id: userLink.id }
      });
      expect(userLinkAfter).not.toBeNull();
    });
  });

  describe('User Access Records Cleanup', () => {
    it('should delete user access records older than 30 days', async () => {
      const RETENTION_DAYS = planLimits.user.linkAnalytics.linkAccessesDuration;
      const oldDate = new Date(Date.now() - (RETENTION_DAYS + 1) * 24 * 60 * 60 * 1000);
      const recentDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000); // 5 days ago

      // Create user link
      const userLink = await prisma.link.create({
        data: {
          userId: testUser.id,
          shortUrl: 'userlink123',
          longUrl: 'https://example.com/userlink'
        }
      });

      // Create old access records (should be deleted)
      await prisma.access.createMany({
        data: [
          {
            linkId: userLink.id,
            userAgent: 'Old Agent 1',
            ip: '127.0.0.1',
            country: 'US',
            isVPN: false,
            isBot: false,
            createdAt: oldDate
          },
          {
            linkId: userLink.id,
            userAgent: 'Old Agent 2',
            ip: '127.0.0.2',
            country: 'US',
            isVPN: false,
            isBot: false,
            createdAt: oldDate
          }
        ]
      });

      // Create recent access records (should NOT be deleted)
      await prisma.access.createMany({
        data: [
          {
            linkId: userLink.id,
            userAgent: 'Recent Agent 1',
            ip: '127.0.0.3',
            country: 'US',
            isVPN: false,
            isBot: false,
            createdAt: recentDate
          },
          {
            linkId: userLink.id,
            userAgent: 'Recent Agent 2',
            ip: '127.0.0.4',
            country: 'US',
            isVPN: false,
            isBot: false,
            createdAt: recentDate
          }
        ]
      });

      // Verify all access records exist
      const accessBefore = await prisma.access.count({
        where: { linkId: userLink.id }
      });
      expect(accessBefore).toBe(4);

      // Run cleanup
      const result = await cleanupExpiredGuestLinks();

      // Verify old access records were deleted
      const accessAfter = await prisma.access.count({
        where: { linkId: userLink.id }
      });
      expect(accessAfter).toBe(2);

      // Verify only recent access records remain
      const recentAccessAfter = await prisma.access.findMany({
        where: {
          linkId: userLink.id
        }
      });
      expect(recentAccessAfter.every(a => a.createdAt >= recentDate)).toBe(true);

      // Verify result
      expect(result.userAccesses).toBe(2);
    });

    it('should NOT delete access records from guest links (handled by cascade)', async () => {
      const RETENTION_DAYS = planLimits.user.linkAnalytics.linkAccessesDuration;
      const oldDate = new Date(Date.now() - (RETENTION_DAYS + 1) * 24 * 60 * 60 * 1000);

      // Create guest link
      const guestLink = await prisma.link.create({
        data: {
          guestSessionId: guestSession1.id,
          shortUrl: 'guestlink456',
          longUrl: 'https://example.com/guestlink',
          createdAt: new Date() // Recent link
        }
      });

      // Create old access records for guest link
      await prisma.access.createMany({
        data: [
          {
            linkId: guestLink.id,
            userAgent: 'Guest Agent 1',
            ip: '127.0.0.5',
            country: 'US',
            isVPN: false,
            isBot: false,
            createdAt: oldDate
          }
        ]
      });

      const accessBefore = await prisma.access.count({
        where: { linkId: guestLink.id }
      });
      expect(accessBefore).toBe(1);

      // Run cleanup
      const result = await cleanupExpiredGuestLinks();

      // Guest link is recent, so access should remain
      // (Step 3 only processes user links, not guest links)
      const accessAfter = await prisma.access.count({
        where: { linkId: guestLink.id }
      });
      expect(accessAfter).toBe(1);
    });

    it('should handle users with no access records gracefully', async () => {
      // Create user link with no access records
      await prisma.link.create({
        data: {
          userId: testUser.id,
          shortUrl: 'noaccess123',
          longUrl: 'https://example.com/noaccess'
        }
      });

      // Run cleanup (should not throw error)
      const result = await cleanupExpiredGuestLinks();

      expect(result).toHaveProperty('userAccesses');
      expect(result.userAccesses).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty database gracefully', async () => {
      // Clean everything
      await prisma.access.deleteMany({});
      await prisma.link.deleteMany({});
      await prisma.guestSession.deleteMany({});

      // Run cleanup
      const result = await cleanupExpiredGuestLinks();

      expect(result.links).toBe(0);
      expect(result.sessions).toBe(0);
      expect(result.userAccesses).toBe(0);
    });

    it('should delete orphaned guest sessions (sessions without links)', async () => {
      const EXPIRATION_DAYS = planLimits.guest.linkExpiration;
      const oldDate = new Date(Date.now() - (EXPIRATION_DAYS + 1) * 24 * 60 * 60 * 1000);

      // Create old orphaned session (no links)
      const orphanedSession = await prisma.guestSession.create({
        data: {
          createdAt: oldDate
        }
      });

      // Run cleanup
      await cleanupExpiredGuestLinks();

      // Verify orphaned session was deleted
      const orphanedAfter = await prisma.guestSession.findUnique({
        where: { id: orphanedSession.id }
      });
      expect(orphanedAfter).toBeNull();
    });

    it('should respect exact 7-day and 30-day thresholds', async () => {
      const GUEST_DAYS = planLimits.guest.linkExpiration;
      const USER_DAYS = planLimits.user.linkAnalytics.linkAccessesDuration;

      // Just under 7 days old (6.9 days - should NOT be deleted)
      const almostExpiredGuest = new Date(Date.now() - (GUEST_DAYS - 0.1) * 24 * 60 * 60 * 1000);

      // Just over 7 days old (7.1 days - should be deleted)
      const expiredGuest = new Date(Date.now() - (GUEST_DAYS + 0.1) * 24 * 60 * 60 * 1000);

      // Just under 30 days old (29.9 days - should NOT be deleted)
      const almostExpiredUser = new Date(Date.now() - (USER_DAYS - 0.1) * 24 * 60 * 60 * 1000);

      // Just over 30 days old (30.1 days - should be deleted)
      const expiredUser = new Date(Date.now() - (USER_DAYS + 0.1) * 24 * 60 * 60 * 1000);

      // Create guest link just under 7 days (should survive)
      const recentGuestLink = await prisma.link.create({
        data: {
          guestSessionId: guestSession1.id,
          shortUrl: 'recent7days',
          longUrl: 'https://example.com/recent7',
          createdAt: almostExpiredGuest
        }
      });

      // Create guest link just over 7 days (should be deleted)
      const oldGuestLink = await prisma.link.create({
        data: {
          guestSessionId: guestSession2.id,
          shortUrl: 'old7days',
          longUrl: 'https://example.com/old7',
          createdAt: expiredGuest
        }
      });

      // Create user link with access just under 30 days (should survive)
      const userLink = await prisma.link.create({
        data: {
          userId: testUser.id,
          shortUrl: 'user30days',
          longUrl: 'https://example.com/user30'
        }
      });

      await prisma.access.createMany({
        data: [
          {
            linkId: userLink.id,
            userAgent: 'Recent',
            ip: '127.0.0.1',
            country: 'US',
            isVPN: false,
            isBot: false,
            createdAt: almostExpiredUser
          },
          {
            linkId: userLink.id,
            userAgent: 'Old',
            ip: '127.0.0.2',
            country: 'US',
            isVPN: false,
            isBot: false,
            createdAt: expiredUser
          }
        ]
      });

      // Run cleanup
      await cleanupExpiredGuestLinks();

      // Recent guest link should survive
      const recentGuestAfter = await prisma.link.findUnique({
        where: { id: recentGuestLink.id }
      });
      expect(recentGuestAfter).not.toBeNull();

      // Old guest link should be deleted
      const oldGuestAfter = await prisma.link.findUnique({
        where: { id: oldGuestLink.id }
      });
      expect(oldGuestAfter).toBeNull();

      // User link should still exist
      const userLinkAfter = await prisma.link.findUnique({
        where: { id: userLink.id }
      });
      expect(userLinkAfter).not.toBeNull();

      // Only recent access should remain (old access deleted)
      const accessAfter = await prisma.access.count({
        where: { linkId: userLink.id }
      });
      expect(accessAfter).toBe(1);

      // Verify it's the recent one
      const remainingAccess = await prisma.access.findFirst({
        where: { linkId: userLink.id }
      });
      expect(remainingAccess.userAgent).toBe('Recent');
    });
  });

  describe('Return Values', () => {
    it('should return correct counts of deleted items', async () => {
      const GUEST_EXPIRATION = planLimits.guest.linkExpiration;
      const USER_RETENTION = planLimits.user.linkAnalytics.linkAccessesDuration;

      const oldGuestDate = new Date(Date.now() - (GUEST_EXPIRATION + 1) * 24 * 60 * 60 * 1000);
      const oldUserAccessDate = new Date(Date.now() - (USER_RETENTION + 1) * 24 * 60 * 60 * 1000);

      // Create old guest session
      const oldSession = await prisma.guestSession.create({
        data: { createdAt: oldGuestDate }
      });

      // Create old guest links
      await prisma.link.createMany({
        data: [
          {
            guestSessionId: oldSession.id,
            shortUrl: 'old1',
            longUrl: 'https://example.com/1',
            createdAt: oldGuestDate
          },
          {
            guestSessionId: oldSession.id,
            shortUrl: 'old2',
            longUrl: 'https://example.com/2',
            createdAt: oldGuestDate
          }
        ]
      });

      // Create user link with old access records
      const userLink = await prisma.link.create({
        data: {
          userId: testUser.id,
          shortUrl: 'userold',
          longUrl: 'https://example.com/userold'
        }
      });

      await prisma.access.createMany({
        data: Array.from({ length: 5 }, (_, i) => ({
          linkId: userLink.id,
          userAgent: `Agent ${i}`,
          ip: `127.0.0.${i}`,
          country: 'US',
          isVPN: false,
          isBot: false,
          createdAt: oldUserAccessDate
        }))
      });

      // Run cleanup
      const result = await cleanupExpiredGuestLinks();

      // Verify counts
      expect(result.links).toBe(2);
      expect(result.sessions).toBeGreaterThanOrEqual(1);
      expect(result.userAccesses).toBe(5);
    });
  });
});
