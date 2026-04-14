const slugify = require('slugify');
const { check, body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validation');

const getSubCategoryValidator = [
  check('id').isMongoId().withMessage('Invalid Subcategory id format'),
  validatorMiddleware
];

const createSubCategoryValidator = [
  check('name')
    .notEmpty()
    .withMessage('SubCategory required')
    .isLength({ min: 2 })
    .withMessage('Too short Subcategory name')
    .isLength({ max: 32 })
    .withMessage('Too long Subcategory name')
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check('categoryId')
    .notEmpty()
    .withMessage('subCategory must be belong to category')
    .isMongoId()
    .withMessage('Invalid Category id format'),
  validatorMiddleware
];

const updateSubCategoryValidator = [
  check('id').isMongoId().withMessage('Invalid Subcategory id format'),
  body('name').custom((val, { req }) => {
    req.body.slug = slugify(val);
    return true;
  }),
  body('category').isMongoId().withMessage('Invalid Category id format'),
  validatorMiddleware
];

const deleteSubCategoryValidator = [
  check('id').isMongoId().withMessage('Invalid SubCategory id format'),
  validatorMiddleware
];

module.exports = {
  deleteSubCategoryValidator,
  updateSubCategoryValidator,
  createSubCategoryValidator,
  getSubCategoryValidator
};
