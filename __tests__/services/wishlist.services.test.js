jest.mock('../../models/user.model.js');
jest.mock('../../utils/appError.js');
jest.mock('../../utils/httpStatus.js');

const User = require('../../models/user.model.js');
const AppError = require('../../utils/appError.js');
const httpStatus = require('../../utils/httpStatus.js');
const wishlistServices = require('../../services/wishlist.services.js');

describe('Wishlist Services', () => {
  let req, res, next;

  beforeEach(() => {
    req = { user: { _id: 'user123' }, body: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
    httpStatus.SUCCESS = 'success';
  });

  describe('addProductToWishlist', () => {
    it('should add product to user wishlist', async () => {
      const mockWishlist = ['prod1', 'prod2'];
      const mockUser = { wishlist: mockWishlist };

      User.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUser);

      req.body = { product: 'prod3' };

      await wishlistServices.addProductToWishlist(req, res, next);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        { $addToSet: { wishlist: 'prod3' } },
        expect.objectContaining({ new: true, runValidators: true })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: httpStatus.SUCCESS,
          data: mockWishlist
        })
      );
    });

    it('should return 404 if product not provided', async () => {
      req.body = {}; // no product

      await wishlistServices.addProductToWishlist(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should not add duplicate products (addToSet)', async () => {
      const mockWishlist = ['prod1', 'prod2'];
      const mockUser = { wishlist: mockWishlist };

      User.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUser);

      req.body = { product: 'prod1' }; // already in wishlist

      await wishlistServices.addProductToWishlist(req, res, next);

      // The $addToSet operator in MongoDB ensures no duplicates
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        { $addToSet: { wishlist: 'prod1' } },
        expect.any(Object)
      );
    });
  });

  describe('removeProductFromWishlist', () => {
    it('should remove product from user wishlist', async () => {
      const mockWishlist = ['prod1'];
      const mockUser = { wishlist: mockWishlist };

      User.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUser);

      req.params = { product: 'prod2' };

      await wishlistServices.removeProductFromWishlist(req, res, next);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        { $pull: { wishlist: 'prod2' } },
        expect.objectContaining({ new: true, runValidators: true })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: httpStatus.SUCCESS,
          data: mockWishlist
        })
      );
    });

    it('should return 400 if product not provided', async () => {
      req.params = {}; // no product

      await wishlistServices.removeProductFromWishlist(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe('getLoggedUserWishlist', () => {
    it('should return user wishlist', async () => {
      const mockWishlist = ['prod1', 'prod2', 'prod3'];
      const mockUser = { wishlist: mockWishlist };

      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await wishlistServices.getLoggedUserWishlist(req, res, next);

      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: httpStatus.SUCCESS,
          data: mockWishlist
        })
      );
    });

    it('should return empty array if wishlist is empty', async () => {
      const mockWishlist = [];
      const mockUser = { wishlist: mockWishlist };

      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await wishlistServices.getLoggedUserWishlist(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: httpStatus.SUCCESS,
          data: []
        })
      );
    });
  });
});
