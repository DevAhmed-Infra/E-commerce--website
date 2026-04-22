const asyncHandler = require('express-async-handler');

const Order = require('../models/order.model');
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');

const AppError = require('../utils/appError');
const httpStatus = require('../utils/httpStatus');
const factory = require('./factory');

const createCashOrder = asyncHandler(async (req, res, next) => {
  // 1) find cart
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(new AppError('No cart found for this user', 404));
  }

  // 2) validate stock
  for (const item of cart.cartItems) {
    const product = await Product.findById(item.product);

    if (!product || product.quantity < item.quantity) {
      return next(new AppError('Insufficient stock', 400));
    }
  }

  // 3) calculate total price
  const totalOrderPrice = cart.totalPriceAfterDiscount || cart.totalPrice;

  // 4) create Order
  const order = await Order.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    shippingPrice: req.body.shippingPrice || 0,
    totalOrderPrice,
    paymentMethodType: 'cash',
    isPaid: false,
    status: 'pending'
  });

  // 5) update product details
  const bulkOptions = cart.cartItems.map((item) => ({
    updateOne: {
      filter: { _id: item.product },
      update: {
        $inc: {
          quantity: -item.quantity,
          sold: item.quantity
        }
      }
    }
  }));

  await Product.bulkWrite(bulkOptions);

  // 6) clear cart
  await Cart.findByIdAndDelete(cart._id);

  res.status(201).json({
    status: httpStatus.SUCCESS,
    data: order
  });
});

module.exports = {
  createCashOrder
};
