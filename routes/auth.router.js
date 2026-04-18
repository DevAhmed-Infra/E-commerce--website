const express = require('express');

const {
  signUp,
  login,
  logout,

  forgotPassword,
  verifyPasswordResetCode,
  resetPassword
} = require('../services/auth.services');

const {
  signUpValidator,
  loginValidator,
  forgotPasswordValidator,
  verifyPasswordResetCodeValidator,
  resetPasswordValidator
} = require('../utils/validators/authValidators');

const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

router.route('/signup').post(signUpValidator, signUp);

router.route('/login').post(loginValidator, login);
router.route('/logout').post(verifyToken, logout);

router.route('/forgotPassword').post(forgotPasswordValidator, forgotPassword);

router.route('/verifyResetCode').post(verifyPasswordResetCodeValidator, verifyPasswordResetCode);

router.route('/resetPassword').post(resetPasswordValidator, resetPassword);

module.exports = router;
