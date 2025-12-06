const cron = require('node-cron');
const prisma = require('../prisma/client');
const logger = require('../utils/logger');

/**
 * Cleanup job for expired guest links
 * Deletes guest links that are older than 7 days
 * Runs daily at 3:00 AM
 */

const GUEST_LINK_EXPIRATION_DAYS = 7;

/**
 * Execute cleanup of expired guest links
 * @returns {Promise<number>} Number of deleted links
 */
const cleanupExpiredGuestLinks = async () => {
  try {
    const expirationDate = new Date(Date.now() - GUEST_LINK_EXPIRATION_DAYS * 24 * 60 * 60 * 1000);
    
    logger.info('[CLEANUP] Starting guest link cleanup', {
      expirationDate: expirationDate.toISOString(),
      daysThreshold: GUEST_LINK_EXPIRATION_DAYS
    });

    // Delete guest links older than 7 days
    // This will cascade delete associated Access records and LinkRules
    const result = await prisma.link.deleteMany({
      where: {
        guestSessionId: { not: null },
        createdAt: { lt: expirationDate }
      }
    });

    logger.info('[CLEANUP] Guest link cleanup completed', {
      deletedCount: result.count,
      expirationDate: expirationDate.toISOString()
    });

    return result.count;
  } catch (error) {
    logger.error('[CLEANUP] Guest link cleanup failed', {
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

  logger.info('[CLEANUP] Guest link cleanup job scheduled', {
    schedule: 'Daily at 3:00 AM',
    expirationDays: GUEST_LINK_EXPIRATION_DAYS
  });
};

module.exports = {
  startCleanupJob,
  cleanupExpiredGuestLinks
};
