jest.mock('express-validator');

const { validationResult } = require('express-validator');
const validation = require('../../middlewares/validation.js');

describe('Middleware: validation', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('No Validation Errors', () => {
    it('should call next when no validation errors', () => {
      const mockErrors = { isEmpty: jest.fn().mockReturnValue(true) };
      validationResult.mockReturnValue(mockErrors);

      validation(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should not send response when no errors', () => {
      const mockErrors = { isEmpty: jest.fn().mockReturnValue(true) };
      validationResult.mockReturnValue(mockErrors);

      validation(req, res, next);

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 status when validation errors exist', () => {
      const mockErrors = {
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue([
          {
            msg: 'Email is required',
            param: 'email',
            location: 'body'
          }
        ])
      };
      validationResult.mockReturnValue(mockErrors);

      validation(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return errors array in JSON response', () => {
      const errorArray = [
        {
          msg: 'Email is required',
          param: 'email',
          location: 'body'
        },
        {
          msg: 'Password is required',
          param: 'password',
          location: 'body'
        }
      ];
      const mockErrors = {
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue(errorArray)
      };
      validationResult.mockReturnValue(mockErrors);

      validation(req, res, next);

      expect(res.json).toHaveBeenCalledWith({ errors: errorArray });
    });

    it('should not call next when validation errors exist', () => {
      const mockErrors = {
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue([{ msg: 'Error' }])
      };
      validationResult.mockReturnValue(mockErrors);

      validation(req, res, next);

      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Multiple Errors', () => {
    it('should handle multiple validation errors', () => {
      const errorArray = [
        { msg: 'Invalid email format', param: 'email' },
        { msg: 'Password too short', param: 'password' },
        { msg: 'Name is required', param: 'name' },
        { msg: 'Phone is invalid', param: 'phone' }
      ];
      const mockErrors = {
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue(errorArray)
      };
      validationResult.mockReturnValue(mockErrors);

      validation(req, res, next);

      expect(res.json).toHaveBeenCalledWith({ errors: errorArray });
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validationResult called correctly', () => {
    it('should call validationResult with req', () => {
      const mockErrors = { isEmpty: jest.fn().mockReturnValue(true) };
      validationResult.mockReturnValue(mockErrors);

      validation(req, res, next);

      expect(validationResult).toHaveBeenCalledWith(req);
    });
  });

  describe('Error Format', () => {
    it('should include error details in response', () => {
      const errorArray = [
        {
          value: 'invalid',
          msg: 'Invalid value',
          param: 'email',
          location: 'body'
        }
      ];
      const mockErrors = {
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue(errorArray)
      };
      validationResult.mockReturnValue(mockErrors);

      validation(req, res, next);

      const responseCall = res.json.mock.calls[0][0];
      expect(responseCall.errors).toEqual(errorArray);
      expect(responseCall.errors[0].msg).toBe('Invalid value');
      expect(responseCall.errors[0].param).toBe('email');
    });
  });
});
