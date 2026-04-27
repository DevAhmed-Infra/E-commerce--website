jest.mock('jsonwebtoken');

const jwt = require('jsonwebtoken');
const generateToken = require('../../utils/generateToken.js');

describe('generateToken Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret-key';
    process.env.JWT_EXPIRES_IN = '15m';
  });

  describe('generateToken', () => {
    it('should generate token with user id payload', () => {
      jwt.sign = jest.fn().mockReturnValue('test-token');

      const token = generateToken('user123');

      expect(jwt.sign).toHaveBeenCalledWith({ id: 'user123' }, 'test-secret-key', {
        expiresIn: '15m'
      });
      expect(token).toBe('test-token');
    });

    it('should call jwt.sign with correct parameters', () => {
      jwt.sign = jest.fn().mockReturnValue('token');

      generateToken('user456');

      const callArgs = jwt.sign.mock.calls[0];
      expect(callArgs[0]).toEqual({ id: 'user456' });
      expect(callArgs[1]).toBe(process.env.JWT_SECRET);
      expect(callArgs[2]).toEqual({ expiresIn: process.env.JWT_EXPIRES_IN });
    });

    it('should use JWT_SECRET from environment', () => {
      process.env.JWT_SECRET = 'custom-secret';
      jwt.sign = jest.fn().mockReturnValue('token');

      generateToken('user123');

      expect(jwt.sign.mock.calls[0][1]).toBe('custom-secret');
    });

    it('should use JWT_EXPIRES_IN from environment', () => {
      process.env.JWT_EXPIRES_IN = '24h';
      jwt.sign = jest.fn().mockReturnValue('token');

      generateToken('user123');

      expect(jwt.sign.mock.calls[0][2].expiresIn).toBe('24h');
    });

    it('should return token string', () => {
      jwt.sign = jest.fn().mockReturnValue('generated-token-string');

      const token = generateToken('user123');

      expect(typeof token).toBe('string');
      expect(token).toBe('generated-token-string');
    });

    it('should handle different user id types', () => {
      jwt.sign = jest.fn().mockReturnValue('token');

      generateToken('userId123');
      generateToken('5f8c3b3c3c3c3c3c3c3c3c3c');

      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(jwt.sign.mock.calls[0][0]).toEqual({ id: 'userId123' });
      expect(jwt.sign.mock.calls[1][0]).toEqual({ id: '5f8c3b3c3c3c3c3c3c3c3c3c' });
    });
  });
});
