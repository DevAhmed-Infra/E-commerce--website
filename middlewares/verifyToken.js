const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const User = require('../models/user.model');
const asyncHandler = require('express-async-handler');

const verifyToken = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token || token === 'null' || token === 'undefined') {
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
