const { check, body } = require('express-validator');
const slugify = require('slugify');

const validatorMiddleware = require('../../middlewares/validationMiddleware');

const getProductValidator = [
  check('id').isMongoId().withMessage('Invalid product id format'),
  validatorMiddleware
];

const createProductValidator = [
  check('title')
    .notEmpty()
    .withMessage('Product title is required')
    .isLength({ min: 3 })
    .withMessage('Title must be at least 3 characters')
    .isLength({ max: 100 })
    .withMessage('Title must not exceed 100 characters')
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check('description')
    .notEmpty()
    .withMessage('Product description is required')
    .isLength({ min: 20 })
    .withMessage('Description must be at least 20 characters'),

  check('price')
    .notEmpty()
    .withMessage('Product price is required')
    .isNumeric()
    .withMessage('Price must be a valid number')
    .custom((val) => {
      if (parseFloat(val) <= 0) {
        throw new Error('Price must be greater than 0');
      }
      return true;
    }),

  check('quantity')
    .notEmpty()
    .withMessage('Product quantity is required')
    .isNumeric()
    .withMessage('Quantity must be a valid number')
    .custom((val) => {
      if (parseInt(val) < 0) {
        throw new Error('Quantity cannot be negative');
      }
      return true;
    }),

  check('categoryId')
    .notEmpty()
    .withMessage('Category ID is required')
    .isMongoId()
    .withMessage('Invalid category id format'),

  body('subcategoryId').optional().isMongoId().withMessage('Invalid subcategory id format'),

  body('brand').optional().isMongoId().withMessage('Invalid brand id format'),

  body('priceAfterDiscount')
    .optional()
    .isNumeric()
    .withMessage('Price after discount must be a valid number')
    .custom((val, { req }) => {
      if (req.body.price && parseFloat(val) >= parseFloat(req.body.price)) {
        throw new Error('Price after discount must be less than the original price');
      }
      return true;
    }),

  body('color')
    .optional()
    .isArray()
    .withMessage('Color must be an array')
    .custom((val) => {
      if (Array.isArray(val)) {
        const allStrings = val.every(
          (color) => typeof color === 'string' && color.trim().length > 0
        );
        if (!allStrings) {
          throw new Error('All colors must be non-empty strings');
        }
      }
      return true;
    }),

  body('imageCover').optional().isString().withMessage('Image cover must be a string'),

  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array')
    .custom((val) => {
      if (Array.isArray(val)) {
        const allStrings = val.every((img) => typeof img === 'string' && img.trim().length > 0);
        if (!allStrings) {
          throw new Error('All images must be non-empty strings');
        }
      }
      return true;
    }),

  body('ratingAverage')
    .optional()
    .isNumeric()
    .withMessage('Rating average must be a valid number')
    .custom((val) => {
      if (val) {
        const rating = parseFloat(val);
        if (rating < 1 || rating > 5) {
          throw new Error('Rating average must be between 1 and 5');
        }
      }
      return true;
    }),

  body('ratingQuantity')
    .optional()
    .isNumeric()
    .withMessage('Rating quantity must be a valid number')
    .custom((val) => {
      if (val && parseInt(val) < 0) {
        throw new Error('Rating quantity cannot be negative');
      }
      return true;
    }),

  body('sold')
    .optional()
    .isNumeric()
    .withMessage('Sold quantity must be a valid number')
    .custom((val) => {
      if (val && parseInt(val) < 0) {
        throw new Error('Sold quantity cannot be negative');
      }
      return true;
    }),

  validatorMiddleware
];

const updateProductValidator = [
  check('id').isMongoId().withMessage('Invalid product id format'),

  body('title')
    .optional()
    .isLength({ min: 3 })
    .withMessage('Title must be at least 3 characters')
    .isLength({ max: 100 })
    .withMessage('Title must not exceed 100 characters')
    .custom((val, { req }) => {
      if (val) {
        req.body.slug = slugify(val);
      }
      return true;
    }),

  body('description')
    .optional()
    .isLength({ min: 20 })
    .withMessage('Description must be at least 20 characters'),

  body('price')
    .optional()
    .isNumeric()
    .withMessage('Price must be a valid number')
    .custom((val) => {
      if (val && parseFloat(val) <= 0) {
        throw new Error('Price must be greater than 0');
      }
      return true;
    }),

  body('quantity')
    .optional()
    .isNumeric()
    .withMessage('Quantity must be a valid number')
    .custom((val) => {
      if (val && parseInt(val) < 0) {
        throw new Error('Quantity cannot be negative');
      }
      return true;
    }),

  body('categoryId').optional().isMongoId().withMessage('Invalid category id format'),

  body('subcategoryId').optional().isMongoId().withMessage('Invalid subcategory id format'),

  body('brand').optional().isMongoId().withMessage('Invalid brand id format'),

  body('priceAfterDiscount')
    .optional()
    .isNumeric()
    .withMessage('Price after discount must be a valid number')
    .custom((val, { req }) => {
      const price = req.body.price || req.params.price;
      if (val && price && parseFloat(val) >= parseFloat(price)) {
        throw new Error('Price after discount must be less than the original price');
      }
      return true;
    }),

  body('color')
    .optional()
    .isArray()
    .withMessage('Color must be an array')
    .custom((val) => {
      if (Array.isArray(val)) {
        const allStrings = val.every(
          (color) => typeof color === 'string' && color.trim().length > 0
        );
        if (!allStrings) {
          throw new Error('All colors must be non-empty strings');
        }
      }
      return true;
    }),

  body('imageCover').optional().isString().withMessage('Image cover must be a string'),

  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array')
    .custom((val) => {
      if (Array.isArray(val)) {
        const allStrings = val.every((img) => typeof img === 'string' && img.trim().length > 0);
        if (!allStrings) {
          throw new Error('All images must be non-empty strings');
        }
      }
      return true;
    }),

  body('ratingAverage')
    .optional()
    .isNumeric()
    .withMessage('Rating average must be a valid number')
    .custom((val) => {
      if (val) {
        const rating = parseFloat(val);
        if (rating < 1 || rating > 5) {
          throw new Error('Rating average must be between 1 and 5');
        }
      }
      return true;
    }),

  body('slug')
    .optional()
    .isString()
    .withMessage('Slug must be a string')
    .custom((val) => {
      if (val && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(val)) {
        throw new Error('Slug must contain only lowercase letters, numbers, and hyphens');
      }
      return true;
    }),

  body('ratingQuantity')
    .optional()
    .isNumeric()
    .withMessage('Rating quantity must be a valid number')
    .custom((val) => {
      if (val && parseInt(val) < 0) {
        throw new Error('Rating quantity cannot be negative');
      }
      return true;
    }),

  body('sold')
    .optional()
    .isNumeric()
    .withMessage('Sold quantity must be a valid number')
    .custom((val) => {
      if (val && parseInt(val) < 0) {
        throw new Error('Sold quantity cannot be negative');
      }
      return true;
    }),

  validatorMiddleware
];

const deleteProductValidator = [
  check('id').isMongoId().withMessage('Invalid product id format'),
  validatorMiddleware
];

module.exports = {
  getProductValidator,
  createProductValidator,
  updateProductValidator,
  deleteProductValidator
};
