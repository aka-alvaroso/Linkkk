module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/v2/validators/**/*.test.js',
    '**/v2/utils/**/*.test.js'
  ],
  verbose: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  testTimeout: 5000,
  // NO setupFilesAfterEnv for unit tests
};
