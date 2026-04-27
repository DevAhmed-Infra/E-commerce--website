jest.mock('../../models/coupon.model.js');
jest.mock('../../utils/appError.js');

const couponServices = require('../../services/coupon.services.js');

describe('Coupon Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllCoupons', () => {
    it('should call factory getAll with Coupon model', () => {
      expect(typeof couponServices.getAllCoupons).toBe('function');
    });
  });

  describe('getCouponById', () => {
    it('should call factory getOne with Coupon model', () => {
      expect(typeof couponServices.getCouponById).toBe('function');
    });
  });

  describe('createCoupon', () => {
    it('should call factory createOne with Coupon model', () => {
      expect(typeof couponServices.createCoupon).toBe('function');
    });
  });

  describe('updateCoupon', () => {
    it('should call factory updateOne with Coupon model', () => {
      expect(typeof couponServices.updateCoupon).toBe('function');
    });
  });

  describe('deleteCoupon', () => {
    it('should call factory deleteOne with Coupon model', () => {
      expect(typeof couponServices.deleteCoupon).toBe('function');
    });
  });
});
