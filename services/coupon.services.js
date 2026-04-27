const Coupon = require('../models/coupon.model');

const { getOne, getAll, updateOne, deleteOne, createOne } = require('./factory');

const getAllCoupons = getAll(Coupon, {
  modelName: 'Coupon'
});

const getCouponById = getOne(Coupon, {
  modelName: 'Coupon'
});

const createCoupon = createOne(Coupon, {
  modelName: 'Coupon'
});

const updateCoupon = updateOne(Coupon, {
  modelName: 'Coupon'
});

const deleteCoupon = deleteOne(Coupon, {
  modelName: 'Coupon'
});

module.exports = {
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon
};
