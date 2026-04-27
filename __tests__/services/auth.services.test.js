const crypto = require('crypto');

jest.mock('../../models/user.model.js');
jest.mock('../../utils/appError.js', () => {
  class MockAppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
      this.isOperational = true;
    }
  }
  return MockAppError;
});
jest.mock('../../utils/httpStatus.js');
jest.mock('../../utils/generateToken.js');
jest.mock('../../utils/sendEmail.js');
jest.mock('../../utils/cookieAuth.js');

const User = require('../../models/user.model.js');
const AppError = require('../../utils/appError.js');
const httpStatus = require('../../utils/httpStatus.js');
const generateToken = require('../../utils/generateToken.js');
const { sendEmail } = require('../../utils/sendEmail.js');
const { setAuthCookies, clearAuthCookies } = require('../../utils/cookieAuth.js');
const authServices = require('../../services/auth.services.js');

describe('Auth Services', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, params: {}, cookies: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
    httpStatus.SUCCESS = 'success';
  });

  describe('signUp', () => {
    it('should create a new user and return user data with token', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        profileImg: 'profile.jpg'
      };

      User.create = jest.fn().mockResolvedValue(mockUser);
      generateToken.mockReturnValue('test-token');

      req.body = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        phone: '1234567890',
        profileImg: 'profile.jpg'
      };

      await authServices.signUp(req, res, next);

      expect(User.create).toHaveBeenCalledWith(req.body);
      expect(generateToken).toHaveBeenCalledWith('user123');
      expect(setAuthCookies).toHaveBeenCalledWith(res, 'test-token');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });

    it('should not return password in response', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed-password'
      };

      User.create = jest.fn().mockResolvedValue(mockUser);
      generateToken.mockReturnValue('test-token');

      req.body = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      await authServices.signUp(req, res, next);

      const callArgs = res.json.mock.calls[0][0];
      expect(callArgs.data.password).toBeUndefined();
    });
  });

  describe('login', () => {
    it('should login user and return user data with token', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        active: true,
        verifyPassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true)
      };

      User.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });
      generateToken.mockReturnValue('test-token');

      req.body = { email: 'john@example.com', password: 'password123' };

      await authServices.login(req, res, next);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
      expect(mockUser.verifyPassword).toHaveBeenCalledWith('password123');
      expect(generateToken).toHaveBeenCalledWith('user123');
      expect(setAuthCookies).toHaveBeenCalledWith(res, 'test-token');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 error if email or password missing', async () => {
      req.body = { email: 'john@example.com' }; // no password

      await authServices.login(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should return 401 error if user not found', async () => {
      User.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      req.body = { email: 'nonexistent@example.com', password: 'password123' };

      await authServices.login(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should return 401 error if password is invalid', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'john@example.com',
        verifyPassword: jest.fn().mockResolvedValue(false)
      };

      User.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      req.body = { email: 'john@example.com', password: 'wrongpassword' };

      await authServices.login(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should set user active to true if previously inactive', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'john@example.com',
        active: false,
        verifyPassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true)
      };

      User.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });
      generateToken.mockReturnValue('test-token');

      req.body = { email: 'john@example.com', password: 'password123' };

      await authServices.login(req, res, next);

      expect(mockUser.active).toBe(true);
      expect(mockUser.save).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should clear cookies and return success message', async () => {
      await authServices.logout(req, res, next);

      expect(clearAuthCookies).toHaveBeenCalledWith(res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: httpStatus.SUCCESS,
          message: 'Logged out successfully'
        })
      );
    });
  });

  describe('forgotPassword', () => {
    it('should generate reset code, hash it, and send email', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'john@example.com',
        save: jest.fn().mockResolvedValue(true)
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);
      sendEmail.mockResolvedValue({ messageId: 'msg123' });

      req.body = { email: 'john@example.com' };

      await authServices.forgotPassword(req, res, next);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
      expect(mockUser.passwordResetCode).toBeDefined();
      expect(mockUser.passwordResetExpires).toBeDefined();
      expect(mockUser.passwordResetVerified).toBe(false);
      expect(mockUser.save).toHaveBeenCalled();
      expect(sendEmail).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if user not found', async () => {
      User.findOne = jest.fn().mockResolvedValue(null);

      req.body = { email: 'nonexistent@example.com' };

      await authServices.forgotPassword(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should clear reset code if email sending fails', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'john@example.com',
        save: jest.fn().mockResolvedValue(true)
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);
      sendEmail.mockRejectedValue(new Error('Email failed'));

      req.body = { email: 'john@example.com' };

      await authServices.forgotPassword(req, res, next);

      expect(mockUser.passwordResetCode).toBeUndefined();
      expect(mockUser.passwordResetExpires).toBeUndefined();
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe('verifyPasswordResetCode', () => {
    it('should verify reset code and return reset token', async () => {
      const resetCode = '123456';
      const hashedResetCode = crypto.createHash('sha256').update(resetCode).digest('hex');

      const mockUser = {
        _id: 'user123',
        email: 'john@example.com',
        passwordResetCode: hashedResetCode,
        passwordResetExpires: Date.now() + 10 * 60 * 1000,
        passwordResetVerified: false,
        save: jest.fn().mockResolvedValue(true)
      };

      User.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      req.body = { resetCode };

      await authServices.verifyPasswordResetCode(req, res, next);

      expect(mockUser.tempResetToken).toBeDefined();
      expect(mockUser.tempResetTokenExpires).toBeDefined();
      expect(mockUser.passwordResetVerified).toBe(true);
      expect(mockUser.passwordResetCode).toBeUndefined();
      expect(mockUser.passwordResetExpires).toBeUndefined();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    it('should return 400 if reset code is invalid', async () => {
      User.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      req.body = { resetCode: 'invalid' };

      await authServices.verifyPasswordResetCode(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should return 400 if reset code is expired', async () => {
      User.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      req.body = { resetCode: '123456' };

      await authServices.verifyPasswordResetCode(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe('resetPassword', () => {
    it('should reset password and return new token', async () => {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      const mockUser = {
        _id: 'user123',
        email: 'john@example.com',
        tempResetToken: hashedToken,
        tempResetTokenExpires: Date.now() + 10 * 60 * 1000,
        passwordResetVerified: true,
        save: jest.fn().mockResolvedValue(true)
      };

      User.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });
      generateToken.mockReturnValue('new-auth-token');

      req.body = { resetToken, newPassword: 'newpassword123' };

      await authServices.resetPassword(req, res, next);

      expect(mockUser.password).toBe('newpassword123');
      expect(mockUser.tempResetToken).toBeUndefined();
      expect(mockUser.tempResetTokenExpires).toBeUndefined();
      expect(mockUser.passwordResetVerified).toBeUndefined();
      expect(mockUser.save).toHaveBeenCalled();
      expect(generateToken).toHaveBeenCalled();
      expect(setAuthCookies).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 if reset token is invalid', async () => {
      User.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      req.body = { resetToken: 'invalid', newPassword: 'newpass' };

      await authServices.resetPassword(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should return 400 if reset code not verified', async () => {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      const mockUser = {
        _id: 'user123',
        tempResetToken: hashedToken,
        tempResetTokenExpires: Date.now() + 10 * 60 * 1000,
        passwordResetVerified: false
      };

      User.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      req.body = { resetToken, newPassword: 'newpass' };

      await authServices.resetPassword(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });
});
