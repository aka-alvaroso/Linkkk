const cron = require("node-cron");
const prisma = require("../prisma/client");
const logger = require("../utils/logger");
const planLimits = require("../utils/limits");

/**
 * Cleanup job for expired guest links, sessions, and old access records
 * - Deletes guest links and sessions older than 7 days
 * - Deletes access records older than retention period (7 days for guests, 30 days for users)
 * Runs daily at 3:00 AM
 */

const GUEST_LINK_EXPIRATION_DAYS = planLimits.guest.linkExpiration;
const GUEST_ACCESS_RETENTION_DAYS = planLimits.guest.linkAnalytics.linkAccessesDuration;
const USER_ACCESS_RETENTION_DAYS = planLimits.user.linkAnalytics.linkAccessesDuration;

/**
 * Execute cleanup of expired guest links, sessions, and old access records
 * @returns {Promise<{links: number, sessions: number, guestAccesses: number, userAccesses: number}>} Number of deleted items
 */
const cleanupExpiredGuestLinks = async () => {
  try {
    const guestLinkExpirationDate = new Date(
      Date.now() - GUEST_LINK_EXPIRATION_DAYS * 24 * 60 * 60 * 1000
    );
    const userAccessExpirationDate = new Date(
      Date.now() - USER_ACCESS_RETENTION_DAYS * 24 * 60 * 60 * 1000
    );

    logger.info("[CLEANUP] Starting cleanup", {
      guestLinkExpiration: guestLinkExpirationDate.toISOString(),
      userAccessExpiration: userAccessExpirationDate.toISOString(),
      guestLinkThreshold: GUEST_LINK_EXPIRATION_DAYS,
      userAccessThreshold: USER_ACCESS_RETENTION_DAYS,
    });

    // Step 1: Delete guest links older than 7 days
    // This will cascade delete associated Access records and LinkRules
    const linksResult = await prisma.link.deleteMany({
      where: {
        guestSessionId: { not: null },
        createdAt: { lt: guestLinkExpirationDate },
      },
    });

    logger.info("[CLEANUP] Guest links deleted", {
      deletedCount: linksResult.count,
    });

    // Step 2: Delete guest sessions older than 7 days
    // This removes both sessions with remaining links and orphaned sessions
    const sessionsResult = await prisma.guestSession.deleteMany({
      where: {
        createdAt: { lt: guestLinkExpirationDate },
      },
    });

    logger.info("[CLEANUP] Guest sessions deleted", {
      deletedCount: sessionsResult.count,
    });

    // Step 3: Delete old access records from registered users' links
    // Get all links from registered users (userId is not null)
    const userLinks = await prisma.link.findMany({
      where: {
        userId: { not: null },
      },
      select: {
        id: true,
      },
    });

    const userLinkIds = userLinks.map((link) => link.id);

    // Delete access records older than 30 days for user links
    const userAccessesResult = await prisma.access.deleteMany({
      where: {
        linkId: { in: userLinkIds },
        createdAt: { lt: userAccessExpirationDate },
      },
    });

    logger.info("[CLEANUP] User access records deleted", {
      deletedCount: userAccessesResult.count,
    });

    logger.info("[CLEANUP] Cleanup completed", {
      deletedLinks: linksResult.count,
      deletedSessions: sessionsResult.count,
      deletedUserAccesses: userAccessesResult.count,
      guestLinkExpiration: guestLinkExpirationDate.toISOString(),
      userAccessExpiration: userAccessExpirationDate.toISOString(),
    });

    return {
      links: linksResult.count,
      sessions: sessionsResult.count,
      userAccesses: userAccessesResult.count,
    };
  } catch (error) {
    logger.error("[CLEANUP] Cleanup failed", {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

/**
 * Start the scheduled cleanup job
 * Runs daily at 3:00 AM (server time)
 */
const startCleanupJob = () => {
  // Schedule: "0 3 * * *" = Every day at 3:00 AM
  const schedule = "0 3 * * *";

  cron.schedule(schedule, async () => {
    logger.info("[CLEANUP] Running scheduled cleanup");
    await cleanupExpiredGuestLinks();
  });

  logger.info("[CLEANUP] Cleanup job scheduled", {
    schedule: "Daily at 3:00 AM",
    guestLinkExpiration: GUEST_LINK_EXPIRATION_DAYS,
    guestAccessRetention: GUEST_ACCESS_RETENTION_DAYS,
    userAccessRetention: USER_ACCESS_RETENTION_DAYS,
    scope: "guest links, guest sessions, old access records",
  });
};

module.exports = {
  startCleanupJob,
  cleanupExpiredGuestLinks,
};
