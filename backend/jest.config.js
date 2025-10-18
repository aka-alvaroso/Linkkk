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
    '/v2/', // Unit tests in v2/ should use jest.unit.config.js
  ],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  testTimeout: 10000,
  setupFilesAfterEnv: ['./__tests__/setup.js'],
  testEnvironmentOptions: {
    NODE_ENV: 'test'
  },
};
