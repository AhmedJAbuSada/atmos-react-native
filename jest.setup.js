/* eslint-env jest */
/**
 * Native modules have no implementation in Node. These are the libraries' own Jest mocks, not
 * mocks of our code: our code is tested through injected fakes instead.
 */
jest.mock('react-native-localize', () =>
    require('react-native-localize/mock/jest'),
);
jest.mock(
    'react-native-safe-area-context',
    () => require('react-native-safe-area-context/jest/mock').default,
);
