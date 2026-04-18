const express = require('express');

const { signUp, login, forgotPassword } = require('../services/auth.services');

const {
  signUpValidator,
  loginValidator,
  forgotPasswordValidator
} = require('../utils/validators/authValidators');

const router = express.Router();

router.route('/signup').post(signUpValidator, signUp);

router.route('/login').post(loginValidator, login);

router.route('/forgotPassword').post(forgotPasswordValidator, forgotPassword);

module.exports = router;
