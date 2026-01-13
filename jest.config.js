/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  roots: ['<rootDir>/__tests__'],
  testTimeout: 30000, // Increase timeout to 30s for Firebase initialization
  setupFiles: ['<rootDir>/jest.setup.js'], // Mock Firebase for tests
};
