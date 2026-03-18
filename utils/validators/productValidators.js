const { check, body } = require('express-validator');
const slugify = require('slugify');

const validatorMiddleware = require('../../middlewares/validationMiddleware');
const Category = require('../../models/category.model');
const Subcategory = require('../../models/subcategory.model');

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
    .withMessage('Description must be at least 20 characters')
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),

  check('price')
    .notEmpty()
    .withMessage('Product price is required')
    .isLength({ max: 32 })
    .withMessage('Price is too long')
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
    .withMessage('Invalid category id format')
    .custom((categoryId) =>
      Category.findById(categoryId).then((category) => {
        if (!category) {
          return Promise.reject(new Error(`No category found for this id: ${categoryId}`));
        }
      })
    ),

  body('subcategoryId')
    .optional()
    .isArray()
    .withMessage('Subcategories must be an array')
    .custom((subcategoryIds) => {
      if (!Array.isArray(subcategoryIds) || subcategoryIds.length === 0) return true;

      // Validate all items are valid MongoDB ObjectIds
      const invalidIds = subcategoryIds.filter((id) => !/^[0-9a-fA-F]{24}$/.test(id.toString()));
      if (invalidIds.length > 0) {
        throw new Error(`Invalid subcategory ID format: ${invalidIds.join(', ')}`);
      }

      // Check for duplicates
      const uniqueIds = new Set(subcategoryIds);
      if (uniqueIds.size !== subcategoryIds.length) {
        throw new Error('Subcategory IDs must be unique (no duplicates)');
      }

      return true;
    })
    .custom(async (subcategoryIds, { req }) => {
      if (!Array.isArray(subcategoryIds) || subcategoryIds.length === 0) return true;

      const categoryId = req.body.categoryId;
      if (!categoryId) return true; // Will be caught by categoryId validator

      // Single optimized query: Get subcategories that belong to the specified category
      const foundSubcategories = await Subcategory.find({
        _id: { $in: subcategoryIds },
        category: categoryId
      });

      // Check if all requested subcategories exist and belong to the category
      if (foundSubcategories.length !== subcategoryIds.length) {
        const foundIds = foundSubcategories.map((sub) => sub._id.toString());
        const notFound = subcategoryIds.filter((id) => !foundIds.includes(id.toString()));
        throw new Error(
          `Subcategories not found or do not belong to selected category: ${notFound.join(', ')}`
        );
      }
    }),

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
    .withMessage('Description must be at least 20 characters')
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),

  body('price')
    .optional()
    .isNumeric()
    .withMessage('Price must be a valid number')
    .isLength({ max: 32 })
    .withMessage('Price is too long')
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
