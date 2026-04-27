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

const AppError = require('../../utils/appError.js');
const restrictedTo = require('../../middlewares/restrictedTo.js');

describe('Middleware: restrictedTo', () => {
  let req, res, next;

  beforeEach(() => {
    req = { user: { role: 'user' } };
    res = {};
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('Role-based Access Control', () => {
    it('should allow user with authorized role', () => {
      req.user.role = 'admin';

      const middleware = restrictedTo('admin');
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(next).not.toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should deny user with unauthorized role', () => {
      req.user.role = 'user';

      const middleware = restrictedTo('admin');
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should allow user with one of multiple allowed roles', () => {
      req.user.role = 'manager';

      const middleware = restrictedTo('admin', 'manager');
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(next).not.toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should deny user not in multiple allowed roles', () => {
      req.user.role = 'user';

      const middleware = restrictedTo('admin', 'manager');
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should work with three roles', () => {
      req.user.role = 'admin';

      const middleware = restrictedTo('user', 'manager', 'admin');
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should deny when none of three roles match', () => {
      req.user.role = 'guest';

      const middleware = restrictedTo('user', 'manager', 'admin');
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe('Error Handling', () => {
    it('should return AppError with 403 status', () => {
      req.user.role = 'user';

      const middleware = restrictedTo('admin');
      middleware(req, res, next);

      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(403);
    });

    it('should return descriptive error message', () => {
      req.user.role = 'user';

      const middleware = restrictedTo('admin');
      middleware(req, res, next);

      const error = next.mock.calls[0][0];
      expect(error.message).toContain('not allowed');
    });
  });

  describe('Edge Cases', () => {
    it('should handle single role as argument', () => {
      req.user.role = 'admin';

      const middleware = restrictedTo('admin');
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should handle many roles', () => {
      req.user.role = 'manager';

      const middleware = restrictedTo('user', 'manager', 'admin', 'superadmin', 'moderator');
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should be case-sensitive for role matching', () => {
      req.user.role = 'Admin';

      const middleware = restrictedTo('admin');
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });
});
