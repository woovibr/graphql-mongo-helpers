module.exports = {
  // https://github.com/shelfio/jest-mongodb
  // If you have a custom jest.config.js make sure you remove
  // testEnvironment property, otherwise it will conflict with the preset.
  // testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', './dist'],
  coverageReporters: ['lcov', 'html'],
  resetModules: false,
  preset: '@shelf/jest-mongodb',
  setupFiles: ['dotenv/config'],
  reporters: ['default'],
  transform: {
    '^.+\\.(js|ts|tsx)?$': 'babel-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(js|ts|tsx)?$',
  moduleFileExtensions: ['ts', 'js', 'tsx', 'json'],
  watchPathIgnorePatterns: ['globalConfig'],
};
