jest.mock('jsonwebtoken');
jest.mock('../../models/user.model.js');
jest.mock('../../utils/appError.js');

const jwt = require('jsonwebtoken');
const User = require('../../models/user.model.js');
const AppError = require('../../utils/appError.js');
const verifyToken = require('../../middlewares/verifyToken.js');

describe('Middleware: verifyToken', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      cookies: {},
      headers: {},
      user: null
    };
    res = {};
    next = jest.fn();
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('Token Extraction', () => {
    it('should extract token from cookies', async () => {
      const mockUser = {
        _id: 'user123',
        active: true,
        changedPasswordAfter: jest.fn().mockReturnValue(false)
      };

      req.cookies.token = 'test-token';
      jwt.verify = jest.fn().mockReturnValue({ id: 'user123', iat: Math.floor(Date.now() / 1000) });
      User.findById = jest.fn().mockResolvedValue(mockUser);

      await verifyToken(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith('test-token', 'test-secret');
      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(req.user).toBe(mockUser);
      expect(next).toHaveBeenCalled();
    });

    it('should extract token from Authorization Bearer header', async () => {
      const mockUser = {
        _id: 'user123',
        active: true,
        changedPasswordAfter: jest.fn().mockReturnValue(false)
      };

      req.headers.authorization = 'Bearer test-token';
      jwt.verify = jest.fn().mockReturnValue({ id: 'user123', iat: Math.floor(Date.now() / 1000) });
      User.findById = jest.fn().mockResolvedValue(mockUser);

      await verifyToken(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith('test-token', 'test-secret');
      expect(req.user).toBe(mockUser);
      expect(next).toHaveBeenCalled();
    });

    it('should prefer cookie over header', async () => {
      const mockUser = {
        _id: 'user123',
        active: true,
        changedPasswordAfter: jest.fn().mockReturnValue(false)
      };

      req.cookies.token = 'cookie-token';
      req.headers.authorization = 'Bearer header-token';
      jwt.verify = jest.fn().mockReturnValue({ id: 'user123', iat: Math.floor(Date.now() / 1000) });
      User.findById = jest.fn().mockResolvedValue(mockUser);

      await verifyToken(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith('cookie-token', 'test-secret');
    });
  });

  describe('Token Validation', () => {
    it('should return 401 if no token provided', async () => {
      req.cookies = {};
      req.headers = {};

      await verifyToken(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should return 401 if token is null string', async () => {
      req.cookies.token = 'null';

      await verifyToken(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should return 401 if token is undefined string', async () => {
      req.cookies.token = 'undefined';

      await verifyToken(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should return 401 if JWT verification fails', async () => {
      req.cookies.token = 'invalid-token';
      jwt.verify = jest.fn().mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await verifyToken(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should return 401 if user not found', async () => {
      req.cookies.token = 'valid-token';
      jwt.verify = jest.fn().mockReturnValue({ id: 'user123', iat: Math.floor(Date.now() / 1000) });
      User.findById = jest.fn().mockResolvedValue(null);

      await verifyToken(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should return 401 if user is inactive', async () => {
      const mockUser = {
        _id: 'user123',
        active: false
      };

      req.cookies.token = 'valid-token';
      jwt.verify = jest.fn().mockReturnValue({ id: 'user123', iat: Math.floor(Date.now() / 1000) });
      User.findById = jest.fn().mockResolvedValue(mockUser);

      await verifyToken(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe('Password Change Detection', () => {
    it('should return 401 if user changed password after token issued', async () => {
      const mockUser = {
        _id: 'user123',
        active: true,
        changedPasswordAfter: jest.fn().mockReturnValue(true)
      };

      req.cookies.token = 'valid-token';
      jwt.verify = jest.fn().mockReturnValue({ id: 'user123', iat: Math.floor(Date.now() / 1000) });
      User.findById = jest.fn().mockResolvedValue(mockUser);

      await verifyToken(req, res, next);

      expect(mockUser.changedPasswordAfter).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should proceed if user did not change password', async () => {
      const mockUser = {
        _id: 'user123',
        active: true,
        changedPasswordAfter: jest.fn().mockReturnValue(false)
      };

      req.cookies.token = 'valid-token';
      jwt.verify = jest.fn().mockReturnValue({ id: 'user123', iat: Math.floor(Date.now() / 1000) });
      User.findById = jest.fn().mockResolvedValue(mockUser);

      await verifyToken(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe('User Assignment', () => {
    it('should attach user to req.user', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        active: true,
        changedPasswordAfter: jest.fn().mockReturnValue(false)
      };

      req.cookies.token = 'valid-token';
      jwt.verify = jest.fn().mockReturnValue({ id: 'user123', iat: Math.floor(Date.now() / 1000) });
      User.findById = jest.fn().mockResolvedValue(mockUser);

      await verifyToken(req, res, next);

      expect(req.user).toBe(mockUser);
      expect(req.user._id).toBe('user123');
      expect(req.user.name).toBe('John Doe');
    });
  });
});
