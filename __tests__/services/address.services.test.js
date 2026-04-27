jest.mock('../../models/user.model.js');
jest.mock('../../utils/appError.js');
jest.mock('../../utils/httpStatus.js');

const User = require('../../models/user.model.js');
const AppError = require('../../utils/appError.js');
const httpStatus = require('../../utils/httpStatus.js');
const addressServices = require('../../services/address.services.js');

describe('Address Services', () => {
  let req, res, next;

  beforeEach(() => {
    req = { user: { _id: 'user123' }, body: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
    httpStatus.SUCCESS = 'success';
  });

  describe('addAddressToAddresses', () => {
    it('should add address to user addresses', async () => {
      const mockAddresses = [
        { _id: 'addr1', details: 'Old address', phone: '1111111111', city: 'Cairo' }
      ];
      const mockUser = { addresses: mockAddresses };

      User.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUser);

      req.body = {
        details: 'New address',
        phone: '2222222222',
        alias: 'Home',
        postalCode: '12345',
        city: 'Giza'
      };

      await addressServices.addAddressToAddresses(req, res, next);

      expect(User.findByIdAndUpdate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: httpStatus.SUCCESS,
          data: mockAddresses
        })
      );
    });

    it('should return 400 if required fields missing', async () => {
      req.body = { details: 'Address', phone: '1234567890' }; // no city

      await addressServices.addAddressToAddresses(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should return 400 if details missing', async () => {
      req.body = { phone: '1234567890', city: 'Cairo' }; // no details

      await addressServices.addAddressToAddresses(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should return 400 if phone missing', async () => {
      req.body = { details: 'Address', city: 'Cairo' }; // no phone

      await addressServices.addAddressToAddresses(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should allow optional fields like alias and postalCode', async () => {
      const mockUser = { addresses: [] };

      User.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUser);

      req.body = {
        details: 'Address',
        phone: '1234567890',
        city: 'Cairo'
        // alias and postalCode are optional
      };

      await addressServices.addAddressToAddresses(req, res, next);

      expect(User.findByIdAndUpdate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('removeAddressFromAddresses', () => {
    it('should remove address from user addresses', async () => {
      const mockAddresses = [
        { _id: 'addr1', details: 'Remaining address', phone: '1111111111', city: 'Cairo' }
      ];
      const mockUser = { addresses: mockAddresses };

      User.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUser);

      req.params = { address: 'addr2' };

      await addressServices.removeAddressFromAddresses(req, res, next);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        { $pull: { addresses: { _id: 'addr2' } } },
        expect.objectContaining({ new: true, runValidators: true })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: httpStatus.SUCCESS,
          data: mockAddresses
        })
      );
    });

    it('should return 400 if address id not provided', async () => {
      req.params = {}; // no address

      await addressServices.removeAddressFromAddresses(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe('getLoggedUserAddresses', () => {
    it('should return user addresses', async () => {
      const mockAddresses = [
        { _id: 'addr1', details: 'Home', phone: '1111111111', city: 'Cairo' },
        { _id: 'addr2', details: 'Work', phone: '2222222222', city: 'Giza' }
      ];
      const mockUser = { addresses: mockAddresses };

      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await addressServices.getLoggedUserAddresses(req, res, next);

      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: httpStatus.SUCCESS,
          data: mockAddresses
        })
      );
    });

    it('should return empty array if no addresses', async () => {
      const mockAddresses = [];
      const mockUser = { addresses: mockAddresses };

      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await addressServices.getLoggedUserAddresses(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: httpStatus.SUCCESS,
          data: []
        })
      );
    });
  });
});
