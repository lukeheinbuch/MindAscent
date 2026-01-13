// Mock Firebase to prevent network calls during tests
jest.mock('./src/services/firebase', () => ({
  auth: null,
  db: null,
}));
