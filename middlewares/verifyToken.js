const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const User = require('../models/user.model');
const asyncHandler = require('express-async-handler');

const verifyToken = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer')) {
    return next(new AppError('No token is provided', 401));
  }

  token = authHeader.split(' ')[1];

  if (!token) {
    return next(new AppError('Unauthorized user', 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);

  if (!user || user.active === false) {
    return next(new AppError('User not found or inactive', 401));
  }

  if (user.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('User changed the password', 401));
  }

  req.user = user;
  next();
});

module.exports = verifyToken;
