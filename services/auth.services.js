const crypto = require('node:crypto');

const asyncHandler = require('express-async-handler');

const User = require('../models/user.model');
const AppError = require('../utils/appError');
const httpStatus = require('../utils/httpStatus');
const generateToken = require('../utils/generateToken');
const { sendEmail } = require('../utils/sendEmail');

const signUp = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone, profileImg } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    phone,
    profileImg
  });

  const token = generateToken(user._id);

  user.password = undefined;

  res.status(201).json({
    status: httpStatus.SUCCESS,
    data: user,
    token: token
  });
});

const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Email and password are required', 400));
  }

  const user = await User.findOne({ email });

  if (!user || !(await user.verifyPassword(password))) {
    return next(new AppError('Invalid email or password', 404));
  }

  const token = generateToken(user._id);

  user.password = undefined;

  res.status(200).json({
    status: httpStatus.SUCCESS,
    data: user,
    token: token
  });
});


const forgotPassword = asyncHandler(async (req, res, next) => {
  // check if use exists
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('User is not exist', 404));
  }
  //generate random reset token/code
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString(); // convert it to string for hashing purposes
  const hashedResetCode = crypto.createHash('sha256').update(resetCode).digest('hex');

  user.passwordResetCode = hashedResetCode;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;

  await user.save();
  //send reset code via email
  try {
    await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      text: `Your password reset code is: ${resetCode}\n\nThis code expires in 10 minutes.`,
      html: `
        <h2>Password Reset</h2>
        <p>You requested a password reset.</p>
        <p>Your reset code is: <strong>${resetCode}</strong></p>
        <p>This code expires in 10 minutes.</p>
        <p>If you didn't request this, ignore this email.</p>
      `
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();
    return next(new AppError('An error at sending email', 500));
  }

  res.status(200).json({
    status: httpStatus.SUCCESS,
    message: 'Password reset code sent to email'
  });

  //verify reset code
  //reset password
});

module.exports = {
  signUp,
  login,
  forgotPassword
};
