module.exports = {
    preset: '@react-native/jest-preset',
    setupFiles: ['<rootDir>/jest.setup.js'],
    // The preset's list plus React Navigation, which ships modern JavaScript modules.
    transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation)/)',
    ],
    // Shared helpers for tests, not tests themselves.
    testPathIgnorePatterns: ['/node_modules/', '<rootDir>/__tests__/support/'],
    collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/testing/**'],
    // The domain holds the business rules, so it has the highest bar (NF-05).
    coverageThreshold: {
        './src/domain/': { lines: 90 },
        // The data layer: everything but the thin native glue is unit-tested.
        './src/data/': { lines: 85 },
    },
};
