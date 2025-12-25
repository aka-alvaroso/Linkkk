const cron = require('node-cron');
const prisma = require('../prisma/client');
const logger = require('../utils/logger');

/**
 * Cleanup job for expired guest links and sessions
 * Deletes guest links and sessions that are older than 7 days
 * Runs daily at 3:00 AM
 */

const GUEST_LINK_EXPIRATION_DAYS = 7;

/**
 * Execute cleanup of expired guest links and sessions
 * @returns {Promise<{links: number, sessions: number}>} Number of deleted links and sessions
 */
const cleanupExpiredGuestLinks = async () => {
  try {
    const expirationDate = new Date(Date.now() - GUEST_LINK_EXPIRATION_DAYS * 24 * 60 * 60 * 1000);

    logger.info('[CLEANUP] Starting guest cleanup', {
      expirationDate: expirationDate.toISOString(),
      daysThreshold: GUEST_LINK_EXPIRATION_DAYS
    });

    // Step 1: Delete guest links older than 7 days
    // This will cascade delete associated Access records and LinkRules
    const linksResult = await prisma.link.deleteMany({
      where: {
        guestSessionId: { not: null },
        createdAt: { lt: expirationDate }
      }
    });

    logger.info('[CLEANUP] Guest links deleted', {
      deletedCount: linksResult.count
    });

    // Step 2: Delete guest sessions older than 7 days
    // This removes both sessions with remaining links and orphaned sessions
    const sessionsResult = await prisma.guestSession.deleteMany({
      where: {
        createdAt: { lt: expirationDate }
      }
    });

    logger.info('[CLEANUP] Guest cleanup completed', {
      deletedLinks: linksResult.count,
      deletedSessions: sessionsResult.count,
      expirationDate: expirationDate.toISOString()
    });

    return {
      links: linksResult.count,
      sessions: sessionsResult.count
    };
  } catch (error) {
    logger.error('[CLEANUP] Guest cleanup failed', {
      error: error.message,
      stack: error.stack
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
  const schedule = '0 3 * * *';
  
  cron.schedule(schedule, async () => {
    logger.info('[CLEANUP] Running scheduled guest link cleanup');
    await cleanupExpiredGuestLinks();
  });

  logger.info('[CLEANUP] Guest cleanup job scheduled', {
    schedule: 'Daily at 3:00 AM',
    expirationDays: GUEST_LINK_EXPIRATION_DAYS,
    scope: 'links and sessions'
  });
};

module.exports = {
  startCleanupJob,
  cleanupExpiredGuestLinks
};
