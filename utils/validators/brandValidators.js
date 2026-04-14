const { check, body } = require('express-validator');
const slugify = require('slugify');

const validatorMiddleware = require('../../middlewares/validation');

const getBrandValidator = [
  check('id').isMongoId().withMessage('Invalid brand id format'),
  validatorMiddleware
];

const createBrandValidator = [
  check('name')
    .notEmpty()
    .withMessage('Brand required')
    .isLength({ min: 3 })
    .withMessage('Too short brand name')
    .isLength({ max: 32 })
    .withMessage('Too long brand name')
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware
];

const updateBrandValidator = [
  check('id').isMongoId().withMessage('Invalid brand id format'),
  body('name')
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleware
];

const deleteBrandValidator = [
  check('id').isMongoId().withMessage('Invalid brand id format'),
  validatorMiddleware
];

module.exports = {
  getBrandValidator,
  deleteBrandValidator,
  updateBrandValidator,
  createBrandValidator
};
