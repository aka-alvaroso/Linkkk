/**
 * Test Setup
 * Runs before all tests
 */

// Mock external geolocation API (must be before any imports that use it)
jest.mock('../v2/utils/access', () => ({
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
