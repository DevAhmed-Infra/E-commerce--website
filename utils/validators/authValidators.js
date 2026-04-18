const { check } = require('express-validator');
const slugify = require('slugify');
const User = require('../../models/user.model');

const validatorMiddleware = require('../../middlewares/validation');

const resetCodeRules = check('resetCode')
  .notEmpty()
  .withMessage('Reset code is required')
  .isLength({ min: 6, max: 6 })
  .withMessage('Reset code must be 6 digits')
  .isNumeric()
  .withMessage('Reset code must be numeric');

const resetTokenRules = check('resetToken').notEmpty().withMessage('Reset token is required');

const signUpValidator = [
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
  check('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  check('profileImg').optional().isString().withMessage('Profile image must be a string'),
  check('active').optional().isBoolean().withMessage('Active must be a boolean value'),
  validatorMiddleware
];

const loginValidator = [
  check('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Enter a valid Email'),
  check('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  validatorMiddleware
];

const forgotPasswordValidator = [
  check('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address'),
  validatorMiddleware
];

const verifyPasswordResetCodeValidator = [resetCodeRules, validatorMiddleware];

const resetPasswordValidator = [
  resetTokenRules,
  check('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .custom((password, { req }) => {
      if (password !== req.body.passwordConfirm) {
        return Promise.reject(new Error('Passwords do not match'));
      }
      return true;
    }),
  check('passwordConfirm').notEmpty().withMessage('Password confirmation is required'),
  validatorMiddleware
];

module.exports = {
  signUpValidator,
  loginValidator,
  forgotPasswordValidator,
  verifyPasswordResetCodeValidator,
  resetPasswordValidator
};
