module.exports = {
  testEnvironment: 'node',
  testEnvironmentOptions: {
    NODE_ENV: 'test',
  },
  restoreMocks: true,
  coveragePathIgnorePatterns: ['node_modules', 'src/config', 'src/app.js', 'tests', 'src/utils', 'dev-data', 'src/validations/custom.validation.js', 'src/services/notification.service.js'],
  coverageReporters: ['text', 'lcov', 'clover', 'html'],
  testTimeout: 30000
};
