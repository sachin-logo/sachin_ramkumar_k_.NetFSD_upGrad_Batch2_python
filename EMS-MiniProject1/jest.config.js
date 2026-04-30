module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: ['js/**/*.js', '!js/app.js', '!js/uiService.js'],
  coverageDirectory: 'coverage',
  verbose: true,
};
