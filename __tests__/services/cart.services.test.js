jest.mock('../../models/cart.model.js');
jest.mock('../../models/product.model.js');
jest.mock('../../models/coupon.model.js');
jest.mock('../../utils/appError.js');
jest.mock('../../utils/httpStatus.js');
jest.mock('../../utils/calculateCartTotal.js');

const Cart = require('../../models/cart.model.js');
const Product = require('../../models/product.model.js');
const Coupon = require('../../models/coupon.model.js');
const AppError = require('../../utils/appError.js');
const httpStatus = require('../../utils/httpStatus.js');
const calculateCartTotal = require('../../utils/calculateCartTotal.js');
const cartServices = require('../../services/cart.services.js');

describe('Cart Services', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { _id: 'user123' },
      body: {},
      params: {},
      product: null
    };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
    httpStatus.SUCCESS = 'success';
  });

  describe('addToCart', () => {
    it('should create new cart when user has no cart', async () => {
      const mockProduct = { _id: 'prod123', price: 100 };

      Product.findById = jest.fn().mockResolvedValue(mockProduct);
      Cart.findOne = jest.fn().mockResolvedValue(null);
      calculateCartTotal.mockReturnValue(100);

      req.body = { productId: 'prod123', quantity: 1, color: 'red' };

      await cartServices.addToCart(req, res, next);

      expect(Cart.findOne).toHaveBeenCalledWith({ user: 'user123' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    it('should increment quantity when product already in cart', async () => {
      const mockProduct = { _id: 'prod123', price: 100 };
      const mockCart = {
        _id: 'cart123',
        user: 'user123',
        cartItems: [{ product: 'prod123', quantity: 1, color: 'red', price: 100 }],
        totalCartPrice: 100,
        set: jest.fn().mockReturnThis(),
        save: jest.fn().mockResolvedValue(true)
      };

      Product.findById = jest.fn().mockResolvedValue(mockProduct);
      Cart.findOne = jest.fn().mockResolvedValue(mockCart);
      calculateCartTotal.mockReturnValue(200);

      req.body = { productId: 'prod123', quantity: 1, color: 'red' };

      await cartServices.addToCart(req, res, next);

      expect(mockCart.cartItems[0].quantity).toBe(2);
      expect(mockCart.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should add new item when product not in cart', async () => {
      const mockProduct = { _id: 'prod456', price: 50 };
      const mockCart = {
        _id: 'cart123',
        user: 'user123',
        cartItems: [{ product: 'prod123', quantity: 1, color: 'red', price: 100 }],
        totalCartPrice: 100,
        set: jest.fn().mockReturnThis(),
        save: jest.fn().mockResolvedValue(true)
      };

      Product.findById = jest.fn().mockResolvedValue(mockProduct);
      Cart.findOne = jest.fn().mockResolvedValue(mockCart);
      calculateCartTotal.mockReturnValue(150);

      req.body = { productId: 'prod456', quantity: 1, color: 'blue' };

      await cartServices.addToCart(req, res, next);

      expect(mockCart.cartItems.length).toBe(2);
      expect(mockCart.save).toHaveBeenCalled();
    });

    it('should use default quantity of 1', async () => {
      const mockProduct = { _id: 'prod123', price: 100 };
      const mockCart = {
        user: 'user123',
        cartItems: [],
        totalCartPrice: 0,
        save: jest.fn().mockResolvedValue(true)
      };

      Product.findById = jest.fn().mockResolvedValue(mockProduct);
      Cart.findOne = jest.fn().mockResolvedValue(mockCart);
      calculateCartTotal.mockReturnValue(100);

      req.body = { productId: 'prod123' }; // no quantity

      await cartServices.addToCart(req, res, next);

      expect(mockCart.cartItems[0].quantity).toBe(1);
    });
  });

  describe('removeItemFromCart', () => {
    it('should remove item from cart', async () => {
      const mockCart = {
        _id: 'cart123',
        user: 'user123',
        cartItems: [],
        totalCartPrice: 0,
        save: jest.fn().mockResolvedValue(true)
      };

      Cart.findOneAndUpdate = jest.fn().mockResolvedValue(mockCart);
      calculateCartTotal.mockReturnValue(0);

      req.user._id = 'user123';
      req.params.id = 'item123';

      await cartServices.removeItemFromCart(req, res, next);

      expect(Cart.findOneAndUpdate).toHaveBeenCalledWith(
        { user: 'user123' },
        { $pull: { cartItems: { _id: 'item123' } } },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if cart not found', async () => {
      Cart.findOneAndUpdate = jest.fn().mockResolvedValue(null);

      req.params.id = 'item123';

      await cartServices.removeItemFromCart(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', async () => {
      Cart.findOneAndDelete = jest.fn().mockResolvedValue({ _id: 'cart123' });

      req.user._id = 'user123';

      await cartServices.clearCart(req, res, next);

      expect(Cart.findOneAndDelete).toHaveBeenCalledWith({ user: 'user123' });
      expect(res.status).toHaveBeenCalledWith(204);
    });
  });

  describe('updateCartItemQuantity', () => {
    it('should update quantity of cart item', async () => {
      const mockCart = {
        _id: 'cart123',
        user: 'user123',
        cartItems: [{ _id: 'item123', product: 'prod123', quantity: 1, price: 100 }],
        totalCartPrice: 100,
        save: jest.fn().mockResolvedValue(true)
      };

      Cart.findOne = jest.fn().mockResolvedValue(mockCart);
      calculateCartTotal.mockReturnValue(200);

      req.user._id = 'user123';
      req.params.itemId = 'item123';
      req.body.quantity = 2;

      await cartServices.updateCartItemQuantity(req, res, next);

      expect(mockCart.cartItems[0].quantity).toBe(2);
      expect(mockCart.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if item not found in cart', async () => {
      const mockCart = {
        _id: 'cart123',
        user: 'user123',
        cartItems: []
      };

      Cart.findOne = jest.fn().mockResolvedValue(mockCart);

      req.user._id = 'user123';
      req.params.itemId = 'nonexistent';
      req.body.quantity = 2;

      await cartServices.updateCartItemQuantity(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe('applyCoupon', () => {
    it('should apply valid coupon and calculate discount', async () => {
      const mockCoupon = { _id: 'coupon123', discount: 20, expire: Date.now() + 10000 };
      const mockCart = {
        _id: 'cart123',
        user: 'user123',
        cartItems: [{ product: 'prod123', quantity: 1, price: 100 }],
        totalCartPrice: 100,
        priceAfterDiscount: 0,
        save: jest.fn().mockResolvedValue(true)
      };

      Coupon.findOne = jest.fn().mockResolvedValue(mockCoupon);
      Cart.findOne = jest.fn().mockResolvedValue(mockCart);
      calculateCartTotal.mockReturnValue(100);

      req.body.coupon = 'DISCOUNT20';
      req.user._id = 'user123';

      await cartServices.applyCoupon(req, res, next);

      expect(Coupon.findOne).toHaveBeenCalledWith({
        name: 'DISCOUNT20',
        expire: expect.objectContaining({ $gt: expect.any(Number) })
      });
      expect(mockCart.priceAfterDiscount).toBe(80); // 100 - (100 * 20 / 100)
      expect(mockCart.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if coupon not found', async () => {
      Coupon.findOne = jest.fn().mockResolvedValue(null);

      req.body.coupon = 'INVALID';

      await cartServices.applyCoupon(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should return 404 if coupon is expired', async () => {
      const expiredCoupon = null; // expired coupons return null

      Coupon.findOne = jest.fn().mockResolvedValue(expiredCoupon);

      req.body.coupon = 'EXPIRED20';

      await cartServices.applyCoupon(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should return 404 if cart not found', async () => {
      const mockCoupon = { _id: 'coupon123', discount: 20, expire: Date.now() + 10000 };

      Coupon.findOne = jest.fn().mockResolvedValue(mockCoupon);
      Cart.findOne = jest.fn().mockResolvedValue(null);

      req.body.coupon = 'DISCOUNT20';
      req.user._id = 'user123';

      await cartServices.applyCoupon(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe('getLoggedUserCart', () => {
    it('should return user cart', async () => {
      const mockCart = {
        _id: 'cart123',
        user: 'user123',
        cartItems: [{ product: 'prod123', quantity: 1, price: 100 }],
        totalCartPrice: 100
      };

      Cart.findOne = jest.fn().mockResolvedValue(mockCart);

      req.user._id = 'user123';

      await cartServices.getLoggedUserCart(req, res, next);

      expect(Cart.findOne).toHaveBeenCalledWith({ user: 'user123' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: mockCart
        })
      );
    });

    it('should return 404 if cart not found', async () => {
      Cart.findOne = jest.fn().mockResolvedValue(null);

      req.user._id = 'user123';

      await cartServices.getLoggedUserCart(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });
});
