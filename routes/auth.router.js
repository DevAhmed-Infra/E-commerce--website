const express = require('express');

const {
  signUp,
  login,
  forgotPassword,
  verifyPasswordResetCode,
  resetPassword
} = require('../services/auth.services');

const {
  signUpValidator,
  loginValidator,
  forgotPasswordValidator
} = require('../utils/validators/authValidators');

const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

router.route('/signup').post(signUpValidator, signUp);

router.route('/login').post(loginValidator, login);

router.route('/forgotPassword').post(forgotPasswordValidator, forgotPassword);

router.route('/verifyResetCode').post(verifyPasswordResetCode);

router.route('/resetPassword').post(resetPassword);

module.exports = router;
