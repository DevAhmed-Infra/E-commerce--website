const { check, body } = require('express-validator');
const slugify = require('slugify');
const User = require('../../models/user.model');

const validatorMiddleware = require('../../middlewares/validation');

function passwordWithConfirmChain() {
  return [
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .custom((password, { req }) => {
        if (password !== req.body.passwordConfirm) {
          return Promise.reject(new Error('Passwords do not match'));
        }
        return true;
      }),
    body('passwordConfirm').notEmpty().withMessage('Password confirmation is required')
  ];
}

const getUserValidator = [
  check('id').isMongoId().withMessage('Invalid User id format'),
  validatorMiddleware
];

const createUserValidator = [
  check('name')
    .notEmpty()
    .withMessage('User required')
    .isLength({ min: 3 })
    .withMessage('Too short User name')
    .isLength({ max: 32 })
    .withMessage('Too long User name')
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address')
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error('E-mail already in user'));
        }
      })
    ),
  check('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .custom((password, { req }) => {
      if (password !== req.body.passwordConfirm) {
        return Promise.reject(new Error('Passwords do not match'));
      }
      return true;
    }),
  check('passwordConfirm').notEmpty().withMessage('Password confirmation is required'),
  check('role')
    .optional()
    .isIn(['user', 'admin', 'manager'])
    .withMessage('Role must be either user, admin or manager'),
  check('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  check('profileImg').optional().isString().withMessage('Profile image must be a string'),
  check('active').optional().isBoolean().withMessage('Active must be a boolean value'),
  validatorMiddleware
];

const updateUserValidator = [
  check('id').isMongoId().withMessage('Invalid User id format'),
  body('name')
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email address')
    .custom((val, { req }) =>
      User.findOne({ email: val }).then((user) => {
        if (user && user._id.toString() !== req.params.id) {
          return Promise.reject(new Error('E-mail already in use'));
        }
      })
    ),
  check('role')
    .optional()
    .isIn(['user', 'admin', 'manager'])
    .withMessage('Role must be either user, admin or manager'),
  check('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  check('profileImg').optional().isString().withMessage('Profile image must be a string'),
  check('active').optional().isBoolean().withMessage('Active must be a boolean value'),
  validatorMiddleware
];

const deleteUserValidator = [
  check('id').isMongoId().withMessage('Invalid User id format'),
  validatorMiddleware
];

const changeUserPasswordValidator = [...passwordWithConfirmChain(), validatorMiddleware];

const updateLoggedUserPasswordValidator = [...passwordWithConfirmChain(), validatorMiddleware];

const updateLoggedUserValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Too short name')
    .isLength({ max: 32 })
    .withMessage('Too long name'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email address')
    .custom((val, { req }) =>
      User.findOne({ email: val }).then((user) => {
        if (user && user._id.toString() !== req.user._id.toString()) {
          return Promise.reject(new Error('E-mail already in use'));
        }
      })
    ),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  validatorMiddleware
];

module.exports = {
  getUserValidator,
  deleteUserValidator,
  updateUserValidator,
  createUserValidator,
  changeUserPasswordValidator,
  updateLoggedUserPasswordValidator,
  updateLoggedUserValidator
};
