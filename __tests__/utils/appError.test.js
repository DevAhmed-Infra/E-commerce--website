const AppError = require('../../utils/appError.js');

describe('AppError Utility', () => {
  describe('AppError class', () => {
    it('should create error with message and statusCode', () => {
      const error = new AppError('Test error', 400);

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
    });

    it('should set status to fail for 4xx errors', () => {
      const error = new AppError('Bad request', 400);

      expect(error.status).toBe('fail');
    });

    it('should set status to fail for all 4xx codes', () => {
      const error401 = new AppError('Unauthorized', 401);
      const error403 = new AppError('Forbidden', 403);
      const error404 = new AppError('Not found', 404);

      expect(error401.status).toBe('fail');
      expect(error403.status).toBe('fail');
      expect(error404.status).toBe('fail');
    });

    it('should set status to error for 5xx errors', () => {
      const error = new AppError('Server error', 500);

      expect(error.status).toBe('error');
    });

    it('should set isOperational to true', () => {
      const error = new AppError('Test error', 400);

      expect(error.isOperational).toBe(true);
    });

    it('should extend Error class', () => {
      const error = new AppError('Test error', 400);

      expect(error instanceof Error).toBe(true);
    });

    it('should capture stack trace', () => {
      const error = new AppError('Test error', 400);

      expect(error.stack).toBeDefined();
    });

    it('should handle different status codes', () => {
      const error200 = new AppError('Success', 200);
      const error301 = new AppError('Redirect', 301);
      const error502 = new AppError('Bad gateway', 502);

      expect(error200.status).toBe('error'); // starts with 2
      expect(error301.status).toBe('error'); // starts with 3
      expect(error502.status).toBe('error'); // starts with 5
    });
  });
});
