const { check, body } = require('express-validator');
const slugify = require('slugify');

const validatorMiddleware = require('../../middlewares/validation');

const getCategoryValidator = [
  check('id').isMongoId().withMessage('Invalid category id format'),
  validatorMiddleware
];

const createCategoryValidator = [
  check('name')
    .notEmpty()
    .withMessage('Category required')
    .isLength({ min: 3 })
    .withMessage('Too short category name')
    .isLength({ max: 32 })
    .withMessage('Too long category name')
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware
];

const updateCategoryValidator = [
  check('id').isMongoId().withMessage('Invalid category id format'),
  body('name')
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware
];

const deleteCategoryValidator = [
  check('id').isMongoId().withMessage('Invalid category id format'),
  validatorMiddleware
];

module.exports = {
  getCategoryValidator,
  deleteCategoryValidator,
  updateCategoryValidator,
  createCategoryValidator
};
