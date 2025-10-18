module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'v2/**/*.js',
    '!v2/prisma/**',
    '!**/node_modules/**',
  ],
  testMatch: [
    '**/__tests__/**/*.test.js',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
  ],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  testTimeout: 10000,
  setupFilesAfterEnv: ['<rootDir>/__tests__/conditionalSetup.js'],
  testEnvironmentOptions: {
    NODE_ENV: 'test'
  },
};
