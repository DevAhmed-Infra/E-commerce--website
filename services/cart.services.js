const asyncHandler = require('express-async-handler');

const httpStatus = require('../utils/httpStatus');

const Cart = require('../models/cart.model');
const Coupon = require('../models/coupon.model');
const Product = require('../models/product.model');

const AppError = require('../utils/appError');
const calculateCartTotal = require('../utils/calculateCartTotal');

const addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity = 1, color } = req.body;
  const userId = req.user._id;

  const product = req.product || (await Product.findById(productId));

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = new Cart({
      user: userId,
      cartItems: [
        {
          product: productId,
          quantity,
          color,
          price: product.price
        }
      ]
    });
  } else {
    const existingItem = cart.cartItems.find(
      (item) => item.product.toString() === productId.toString() && item.color === color
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.cartItems.push({
        product: productId,
        quantity,
        color,
        price: product.price
      });
    }

    cart.set('priceAfterDiscount', undefined);
  }

  cart.totalCartPrice = calculateCartTotal(cart);
  await cart.save();

  res.status(200).json({
    status: httpStatus.SUCCESS,
    data: cart
  });
});

const getLoggedUserCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(new AppError(`There is no cart for this user id : ${req.user._id}`, 404));
  }

  res.status(200).json({
    status: 'success',
    numOfCartItems: cart.cartItems.length,
    data: cart
  });
});

const removeItemFromCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $pull: { cartItems: { _id: req.params.id } } },
    { new: true }
  );

  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  cart.totalCartPrice = calculateCartTotal(cart);
  await cart.save();

  res.status(200).json({
    status: httpStatus.SUCCESS,
    length: cart.cartItems.length,
    data: cart
  });
});

const clearCart = asyncHandler(async (req, res, next) => {
  await Cart.findOneAndDelete({ user: req.user._id });

  res.status(204).send();
});

const updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });

  const itemIndex = cart.cartItems.findIndex((item) => item._id.toString() === req.params.itemId);

  if (itemIndex > -1) {
    const cartItem = cart.cartItems[itemIndex];
    cartItem.quantity = quantity;
    cart.cartItems[itemIndex] = cartItem;
  } else {
    return next(new AppError('no item was found', 404));
  }

  cart.totalCartPrice = calculateCartTotal(cart);

  await cart.save();

  res.status(200).json({
    status: httpStatus.SUCCESS,
    data: cart
  });
});

const applyCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findOne({ name: req.body.coupon, expire: { $gt: Date.now() } });

  if (!coupon) {
    return next(new AppError('Coupon not found', 404));
  }

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }
  cart.totalCartPrice = calculateCartTotal(cart);

  const totalPrice = cart.totalCartPrice;

  const totalPriceAfterDiscount = Number(
    (totalPrice - (totalPrice * coupon.discount) / 100).toFixed(2)
  );
  cart.priceAfterDiscount = totalPriceAfterDiscount;

  await cart.save();
  res.status(200).json({
    status: 'success',
    numOfCartItems: cart.cartItems.length,
    data: cart
  });
});

module.exports = {
  addToCart,
  getLoggedUserCart,
  removeItemFromCart,
  clearCart,
  updateCartItemQuantity,
  applyCoupon
};
