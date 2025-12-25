/**
 * One-time cleanup script for old guest sessions
 * This script manually cleans up expired guest links and sessions
 * Run this script to clean up old data that accumulated before the cleanup job was implemented
 *
 * Usage: node v2/scripts/cleanupOldGuestSessions.js
 */

// Load environment variables
require('dotenv').config();

const prisma = require('../prisma/client');
const logger = require('../utils/logger');

const GUEST_LINK_EXPIRATION_DAYS = 7;

async function cleanupOldSessions() {
  try {
    const expirationDate = new Date(Date.now() - GUEST_LINK_EXPIRATION_DAYS * 24 * 60 * 60 * 1000);

    console.log('\n🧹 Starting one-time cleanup of old guest data...');
    console.log(`📅 Deleting data older than: ${expirationDate.toISOString()}`);
    console.log(`⏳ Expiration threshold: ${GUEST_LINK_EXPIRATION_DAYS} days\n`);

    // Step 1: Count what will be deleted
    const linksToDelete = await prisma.link.count({
      where: {
        guestSessionId: { not: null },
        createdAt: { lt: expirationDate }
      }
    });

    const sessionsToDelete = await prisma.guestSession.count({
      where: {
        createdAt: { lt: expirationDate }
      }
    });

    console.log(`📊 Found:`);
    console.log(`   - ${linksToDelete} guest links to delete`);
    console.log(`   - ${sessionsToDelete} guest sessions to delete\n`);

    if (linksToDelete === 0 && sessionsToDelete === 0) {
      console.log('✅ No old data found. Database is clean!');
      return { links: 0, sessions: 0 };
    }

    // Step 2: Delete guest links
    console.log('🗑️  Deleting expired guest links...');
    const linksResult = await prisma.link.deleteMany({
      where: {
        guestSessionId: { not: null },
        createdAt: { lt: expirationDate }
      }
    });

    console.log(`   ✓ Deleted ${linksResult.count} links`);

    // Step 3: Delete guest sessions
    console.log('🗑️  Deleting expired guest sessions...');
    const sessionsResult = await prisma.guestSession.deleteMany({
      where: {
        createdAt: { lt: expirationDate }
      }
    });

    console.log(`   ✓ Deleted ${sessionsResult.count} sessions\n`);

    console.log('✅ Cleanup completed successfully!');
    console.log(`📈 Summary:`);
    console.log(`   - Links deleted: ${linksResult.count}`);
    console.log(`   - Sessions deleted: ${sessionsResult.count}\n`);

    logger.info('[CLEANUP SCRIPT] One-time cleanup completed', {
      deletedLinks: linksResult.count,
      deletedSessions: sessionsResult.count,
      expirationDate: expirationDate.toISOString()
    });

    return {
      links: linksResult.count,
      sessions: sessionsResult.count
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
