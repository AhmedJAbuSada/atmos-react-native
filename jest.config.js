module.exports = {
  preset: '@react-native/jest-preset',
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/testing/**'],
  // The domain holds the business rules, so it has the highest bar (NF-05).
  coverageThreshold: {
    './src/domain/': {lines: 90},
  },
};
