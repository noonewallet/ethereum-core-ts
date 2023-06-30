module.exports = {
  roots: ['<rootDir>/test'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  preset: 'ts-jest',
  moduleNameMapper: {
    '^@helpers/(.*)': '<rootDir>/src/helpers/$1',
    '^@coins/(.*)': '<rootDir>/src/coins/$1',
    '^@modules/(.*)': '<rootDir>/src/modules/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
}
