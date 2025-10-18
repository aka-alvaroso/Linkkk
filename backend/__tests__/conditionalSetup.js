/**
 * Conditional Test Setup
 * Only loads Prisma setup for integration tests
 */

// Check if we're in the unit test directory
const isUnitTest = expect.getState().testPath?.includes('__tests__\\unit') ||
                   expect.getState().testPath?.includes('__tests__/unit');

if (!isUnitTest) {
  // Load full setup with Prisma for integration tests
  require('./setup.js');
} else {
  // For unit tests, just mock Prisma
  jest.mock('../v2/prisma/client');

  // Mock external geolocation API
  jest.mock('../v2/utils/access', () => ({
    defineCountry: async () => 'US',
    defineIsVPN: async () => false,
  }));
}
