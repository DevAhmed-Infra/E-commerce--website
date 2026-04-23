const { body, param } = require('express-validator');
const mongoose = require('mongoose');
const validatorMiddleware = require('../../middlewares/validation');

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);
const mongoIdParam = (fieldName) =>
  param(fieldName).custom((value) => {
    if (!isValidObjectId(value)) {
      throw new Error(`Invalid ${fieldName} format`);
    }
    return true;
  });

const createCashOrderValidator = [
  body('shippingAddress')
    .notEmpty()
    .withMessage('Shipping address is required')
    .isObject()
    .withMessage('Shipping address must be an object'),

  body('shippingAddress.details')
    .notEmpty()
    .withMessage('Shipping address details are required')
    .isString()
    .withMessage('Shipping address details must be a string')
    .isLength({ min: 5 })
    .withMessage('Shipping address details must be at least 5 characters'),

  body('shippingAddress.phone')
    .notEmpty()
    .withMessage('Shipping phone number is required')
    .isMobilePhone()
    .withMessage('Invalid phone number'),

  body('shippingAddress.city')
    .notEmpty()
    .withMessage('Shipping city is required')
    .isString()
    .withMessage('Shipping city must be a string'),

  body('shippingAddress.postalCode')
    .optional()
    .isPostalCode('any')
    .withMessage('Invalid postal code'),

  body('shippingPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Shipping price must be a non-negative number'),

  validatorMiddleware
];

const getSpecificOrderValidator = [mongoIdParam('id'), validatorMiddleware];

const updateOrderPaidStatusValidator = [mongoIdParam('id'), validatorMiddleware];

const checkoutSessionValidator = [mongoIdParam('cartId'), validatorMiddleware];

module.exports = {
  createCashOrderValidator,
  getSpecificOrderValidator,
  updateOrderPaidStatusValidator,
  checkoutSessionValidator
};
