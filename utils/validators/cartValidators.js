const { check } = require('express-validator');

const validatorMiddleware = require('../../middlewares/validation');
const Product = require('../../models/product.model');
const Cart = require('../../models/cart.model');

const addToCartValidator = [
  check('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID format')
    .custom(async (val, { req }) => {
      const product = await Product.findById(val);
      if (!product) throw new Error('Product not found');
      req.product = product;
      return true;
    }),

  check('color')
    .optional()
    .isString()
    .withMessage('Color must be a string')
    .trim()
    .custom((val, { req }) => {
      if (!val || !req.product) return true;
      const availableColors = req.product.color;
      if (
        Array.isArray(availableColors) &&
        availableColors.length > 0 &&
        !availableColors.includes(val)
      ) {
        throw new Error(`Invalid color "${val}". Available: ${availableColors.join(', ')}`);
      }
      return true;
    }),

  check('quantity')
    .optional()
    .custom(async (val, { req }) => {
      const quantity = val === undefined ? 1 : Number(val);
      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error('Quantity must be a positive integer');
      }
      req.body.quantity = quantity;
      if (!req.product) return true;

      const cart = await Cart.findOne({ user: req.user._id });
      const existingItem = cart?.cartItems?.find(
        (item) => item.product.toString() === req.body.productId && item.color === req.body.color
      );
      const totalRequested = (existingItem?.quantity ?? 0) + quantity;
      if (req.product.quantity < totalRequested) {
        throw new Error(
          `Only ${req.product.quantity} unit(s) in stock` +
            (existingItem ? ` (${existingItem.quantity} already in your cart)` : '')
        );
      }
      return true;
    }),

  validatorMiddleware
];

// ─── Remove Item From Cart ────────────────────────────────────────────────────

const removeItemFromCartValidator = [
  check('id')
    .notEmpty()
    .withMessage('Cart item ID is required')
    .isMongoId()
    .withMessage('Invalid cart item ID format')
    .custom(async (val, { req }) => {
      const cart = await Cart.findOne({ user: req.user._id });
      if (!cart) throw new Error('Cart not found');

      const itemExists = cart.cartItems.some((item) => item._id.toString() === val);
      if (!itemExists) throw new Error('Item not found in your cart');

      return true;
    }),

  validatorMiddleware
];

const updateCartItemQuantityValidator = [
  check('itemId')
    .notEmpty()
    .withMessage('Cart item ID is required')
    .isMongoId()
    .withMessage('Invalid cart item ID format')
    .custom(async (val, { req }) => {
      const cart = await Cart.findOne({ user: req.user._id });
      if (!cart) throw new Error('Cart not found');

      const item = cart.cartItems.find((cartItem) => cartItem._id.toString() === val);
      if (!item) throw new Error('Item not found in your cart');

      req.cartItem = item;
      return true;
    }),

  check('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .custom(async (val, { req }) => {
      const quantity = Number(val);
      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error('Quantity must be a positive integer');
      }

      // Check against product stock
      if (req.cartItem) {
        const product = await Product.findById(req.cartItem.product);
        if (product && product.quantity < quantity) {
          throw new Error(`Only ${product.quantity} unit(s) available in stock`);
        }
      }

      return true;
    }),

  validatorMiddleware
];

const applyCouponValidator = [
  check('coupon')
    .notEmpty()
    .withMessage('Coupon code is required')
    .isString()
    .withMessage('Coupon must be a string')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Coupon code must be between 3 and 50 characters'),

  validatorMiddleware
];

module.exports = {
  addToCartValidator,
  removeItemFromCartValidator,
  updateCartItemQuantityValidator,
  applyCouponValidator
};
