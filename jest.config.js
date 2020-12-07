module.exports = {
  testPathIgnorePatterns: ['/node_modules/', './dist'],
  coverageReporters: ['lcov', 'html'],
  resetModules: false,
  reporters: ['default'],
  transform: {
    '^.+\\.(js|ts|tsx)?$': '<rootDir>/babel-transformer',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(js|ts|tsx)?$',
  moduleFileExtensions: ['ts', 'js', 'tsx', 'json'],
};
