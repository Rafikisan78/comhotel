export const mockBcrypt = {
  hash: jest.fn().mockResolvedValue('$2b$10$mockedHashValue'),
  compare: jest.fn().mockResolvedValue(true),
  genSalt: jest.fn().mockResolvedValue('$2b$10$mockedSalt'),
};

jest.mock('bcrypt', () => mockBcrypt);
