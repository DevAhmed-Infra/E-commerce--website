const crypto = require('node:crypto');

const asyncHandler = require('express-async-handler');

const User = require('../models/user.model');
const AppError = require('../utils/appError');
const httpStatus = require('../utils/httpStatus');
const generateToken = require('../utils/generateToken');
const { sendEmail } = require('../utils/sendEmail');
const { setAuthCookies, clearAuthCookies } = require('../utils/cookieAuth');

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

  setAuthCookies(res, token);

  res.status(201).json({
    status: httpStatus.SUCCESS,
    data: user
  });
});

const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Email and password are required', 400));
  }

  const user = await User.findOne({ email }).select('+password -role');

  if (!user || !(await user.verifyPassword(password))) {
    return next(new AppError('Invalid email or password', 401));
  }

  if (user.active === false) {
    user.active = true;
    await user.save();
  }

  const token = generateToken(user._id);

  user.password = undefined;

  setAuthCookies(res, token);

  res.status(200).json({
    status: httpStatus.SUCCESS,
    data: user
  });
});

const logout = asyncHandler(async (req, res, next) => {
  clearAuthCookies(res);

  res.status(200).json({
    status: httpStatus.SUCCESS,
    message: 'Logged out successfully'
  });
});

const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('User is not exist', 404));
  }
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString(); // convert it to string for hashing purposes
  const hashedResetCode = crypto.createHash('sha256').update(resetCode).digest('hex');

  user.passwordResetCode = hashedResetCode;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;

  await user.save();

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
});

const verifyPasswordResetCode = asyncHandler(async (req, res, next) => {
  const { resetCode } = req.body;
  const hashedResetCode = crypto.createHash('sha256').update(resetCode).digest('hex');

  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gte: Date.now() }
  }).select(
    '+passwordResetCode +passwordResetExpires +passwordResetVerified +tempResetToken +tempResetTokenExpires'
  );

  if (!user) {
    return next(new AppError('Reset code invalid or expired', 400));
  }

  const resetToken = crypto.randomBytes(32).toString('hex');

  user.tempResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.tempResetTokenExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = true;

  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // Do not put resetToken in the auth cookie: it is not a JWT and would break verifyToken.
  // Clients must send resetToken in the body of POST /resetPassword (httpOnly cookie cannot be read by JS).
  res.status(200).json({
    status: httpStatus.SUCCESS,
    resetToken
  });
});

const resetPassword = asyncHandler(async (req, res, next) => {
  const { resetToken, newPassword } = req.body;

  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  const user = await User.findOne({
    tempResetToken: hashedToken,
    tempResetTokenExpires: { $gte: Date.now() }
  }).select('+passwordResetVerified +tempResetToken +tempResetTokenExpires');

  if (!user) {
    return next(new AppError('Invalid or expired reset token', 400));
  }

  if (!user.passwordResetVerified) {
    return next(new AppError('Reset code has not been verified', 400));
  }

  user.password = newPassword;
  user.tempResetToken = undefined;
  user.tempResetTokenExpires = undefined;
  user.passwordResetVerified = undefined;
  user.passwordChangedAt = Date.now();

  await user.save();

  const authToken = generateToken(user._id);

  setAuthCookies(res, authToken);

  res.status(200).json({
    status: httpStatus.SUCCESS
  });
});

module.exports = {
  signUp,
  login,
  logout,
  forgotPassword,
  verifyPasswordResetCode,
  resetPassword
};