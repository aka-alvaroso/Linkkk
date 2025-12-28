/**
 * One-time cleanup script for old guest sessions and access records
 * This script manually cleans up:
 * - Expired guest links and sessions (7 days)
 * - Old access records from user links (30 days)
 *
 * Usage: node v2/scripts/cleanupOldGuestSessions.js
 */

// Load environment variables
require('dotenv').config();

const prisma = require('../prisma/client');
const logger = require('../utils/logger');
const planLimits = require('../utils/limits');

const GUEST_LINK_EXPIRATION_DAYS = planLimits.guest.linkExpiration;
const USER_ACCESS_RETENTION_DAYS = planLimits.user.linkAnalytics.linkAccessesDuration;

async function cleanupOldSessions() {
  try {
    const guestExpirationDate = new Date(Date.now() - GUEST_LINK_EXPIRATION_DAYS * 24 * 60 * 60 * 1000);
    const userAccessExpirationDate = new Date(Date.now() - USER_ACCESS_RETENTION_DAYS * 24 * 60 * 60 * 1000);

    console.log('\n🧹 Starting one-time cleanup of old data...');
    console.log(`📅 Guest links/sessions older than: ${guestExpirationDate.toISOString()}`);
    console.log(`📅 User access records older than: ${userAccessExpirationDate.toISOString()}`);
    console.log(`⏳ Guest expiration: ${GUEST_LINK_EXPIRATION_DAYS} days`);
    console.log(`⏳ User access retention: ${USER_ACCESS_RETENTION_DAYS} days\n`);

    // Step 1: Count what will be deleted
    const linksToDelete = await prisma.link.count({
      where: {
        guestSessionId: { not: null },
        createdAt: { lt: guestExpirationDate }
      }
    });

    const sessionsToDelete = await prisma.guestSession.count({
      where: {
        createdAt: { lt: guestExpirationDate }
      }
    });

    // Count user access records to delete
    const userLinks = await prisma.link.findMany({
      where: {
        userId: { not: null },
      },
      select: {
        id: true,
      },
    });

    const userLinkIds = userLinks.map((link) => link.id);

    const userAccessesToDelete = await prisma.access.count({
      where: {
        linkId: { in: userLinkIds },
        createdAt: { lt: userAccessExpirationDate }
      }
    });

    console.log(`📊 Found:`);
    console.log(`   - ${linksToDelete} guest links to delete`);
    console.log(`   - ${sessionsToDelete} guest sessions to delete`);
    console.log(`   - ${userAccessesToDelete} user access records to delete\n`);

    if (linksToDelete === 0 && sessionsToDelete === 0 && userAccessesToDelete === 0) {
      console.log('✅ No old data found. Database is clean!');
      return { links: 0, sessions: 0, userAccesses: 0 };
    }

    // Step 2: Delete guest links
    console.log('🗑️  Deleting expired guest links...');
    const linksResult = await prisma.link.deleteMany({
      where: {
        guestSessionId: { not: null },
        createdAt: { lt: guestExpirationDate }
      }
    });

    console.log(`   ✓ Deleted ${linksResult.count} links`);

    // Step 3: Delete guest sessions
    console.log('🗑️  Deleting expired guest sessions...');
    const sessionsResult = await prisma.guestSession.deleteMany({
      where: {
        createdAt: { lt: guestExpirationDate }
      }
    });

    console.log(`   ✓ Deleted ${sessionsResult.count} sessions`);

    // Step 4: Delete old user access records
    console.log('🗑️  Deleting old user access records...');
    const userAccessesResult = await prisma.access.deleteMany({
      where: {
        linkId: { in: userLinkIds },
        createdAt: { lt: userAccessExpirationDate }
      }
    });

    console.log(`   ✓ Deleted ${userAccessesResult.count} user accesses\n`);

    console.log('✅ Cleanup completed successfully!');
    console.log(`📈 Summary:`);
    console.log(`   - Guest links deleted: ${linksResult.count}`);
    console.log(`   - Guest sessions deleted: ${sessionsResult.count}`);
    console.log(`   - User access records deleted: ${userAccessesResult.count}\n`);

    logger.info('[CLEANUP SCRIPT] One-time cleanup completed', {
      deletedLinks: linksResult.count,
      deletedSessions: sessionsResult.count,
      deletedUserAccesses: userAccessesResult.count,
      guestExpirationDate: guestExpirationDate.toISOString(),
      userAccessExpirationDate: userAccessExpirationDate.toISOString()
    });

    return {
      links: linksResult.count,
      sessions: sessionsResult.count,
      userAccesses: userAccessesResult.count
    };

  } catch (error) {
    console.error('\n❌ Cleanup failed:', error.message);
    logger.error('[CLEANUP SCRIPT] One-time cleanup failed', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute if run directly
if (require.main === module) {
  cleanupOldSessions()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { cleanupOldSessions };
