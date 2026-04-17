const { check } = require('express-validator');
const slugify = require('slugify');
const User = require('../../models/user.model');
const bcrypt = require('bcryptjs');

const validatorMiddleware = require('../../middlewares/validation');

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
  check('role').optional().isIn(['user', 'admin']).withMessage('Role must be either user or admin'),
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
    .withMessage('Password must be at least 6 characters long')
];

module.exports = {
  signUpValidator,
  loginValidator
};
