/**
 * Test Setup
 * Runs before all tests
 */

// Load environment variables for tests
require('dotenv').config();

// Mock external geolocation API (must be before any imports that use it).
// Keeps every other real export (e.g. getClientIp) so the mock doesn't
// silently drift out of sync as utils/access.js grows.
jest.mock('../v2/utils/access', () => ({
  ...jest.requireActual('../v2/utils/access'),
  defineCountry: async () => 'US',
  defineIsVPN: async () => false,
}));

const prisma = require('../v2/prisma/client');

// Increase timeout for database operations
jest.setTimeout(10000);

// Cleanup function
global.cleanupTestData = async () => {
  // Delete test data in correct order (respecting foreign keys)
  await prisma.access.deleteMany({});
  await prisma.link.deleteMany({});
  await prisma.guestSession.deleteMany({});
  await prisma.user.deleteMany({
    where: {
      username: {
        startsWith: 'test_'
      }
    }
  });
};

// Run before all test suites
beforeAll(async () => {
  await cleanupTestData();
});

// Run after each test to minimize cross-test pollution
afterEach(async () => {
  // Clean up access records and links created during tests
  // This helps prevent test interference
  await prisma.access.deleteMany({});
  // Note: Not deleting links or users here as they may be needed within the same test suite
});

// Run after all tests complete
afterAll(async () => {
  await cleanupTestData();
  await prisma.$disconnect();
});
