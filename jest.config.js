module.exports = {
  testEnvironment: 'node',
  testEnvironmentOptions: {
    NODE_ENV: 'test',
  },
  restoreMocks: true,
  coveragePathIgnorePatterns: ['node_modules', 'src/config', 'src/app.js', 'tests', 'src/validations', 'src/utils', 'dev-data'],
  coverageReporters: ['text', 'lcov', 'clover', 'html'],
  testTimeout: 30000
};
