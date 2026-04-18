const asyncHandler = require('express-async-handler');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const slugify = require('slugify');

const User = require('../models/user.model');
const { getOne, getAll, deleteOne, createOne } = require('./factory');
const { addSlug } = require('../utils/slugHelper');
const { uploadSingleImage } = require('../middlewares/uploadImage');
const httpStatus = require('../utils/httpStatus');
const generateToken = require('../utils/generateToken');
const { setAuthCookies} = require('../utils/cookieAuth');
const AppError = require('../utils/appError');

const resizeImage = asyncHandler(async (req, res, next) => {
  const fileName = `user-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat('jpeg')
      .jpeg({ quality: 100 })
      .toFile(`uploads/users/${fileName}`);

    req.body.profileImg = fileName;
  }

  next();
});

const uploadProfileImage = uploadSingleImage('profileImg');

const getAllUsers = getAll(User, {
  modelName: 'User'
});

const getUserById = getOne(User, {
  modelName: 'User'
});

const getLoggedUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('-password -role -active -slug');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: httpStatus.SUCCESS,
    data: user
  });
});

const updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const updateData = {};

  if (req.body.name) {
    updateData.name = req.body.name;
    updateData.slug = slugify(req.body.name);
  }

  if (req.body.email) updateData.email = req.body.email;
  if (req.body.phone) updateData.phone = req.body.phone;
  if (req.body.profileImg) updateData.profileImg = req.body.profileImg;
  if (req.body.role) updateData.role = req.body.role;

  const user = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  });

  if (!user) return next(new AppError('User not found', 404));

  res.status(200).json({
    status: httpStatus.SUCCESS,
    data: user
  });
});

const changeUserPassword = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { password } = req.body;

  const user = await User.findById(id);
  if (!user) return next(new AppError('User not found', 404));

  user.password = password;
  await user.save();

  user.password = undefined;

  res.status(200).json({
    status: httpStatus.SUCCESS,
    data: user
  });
});

const updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  const { password } = req.body;

  const user = await User.findById(req.user._id);

  user.password = password;
  await user.save();

  user.password = undefined;

  const token = generateToken(user._id);

  setAuthCookies(res, token);

  res.status(200).json({
    status: httpStatus.SUCCESS,
    data: user
  });
});

const updateLoggedUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone
    },
    { new: true, runValidators: true }
  ).select('-password -role -active -slug');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: httpStatus.SUCCESS,
    data: user
  });
});

const deleteUser = deleteOne(User, {
  modelName: 'User'
});

const createUser = createOne(User, {
  preProcess: addSlug
});

const deactiveLoggedUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false }, { new: true, runValidators: true });

  res.status(204).send();
});

module.exports = {
  getAllUsers,
  getUserById,
  getLoggedUser,
  updateUser,
  deleteUser,
  createUser,
  changeUserPassword,
  updateLoggedUserPassword,
  updateLoggedUser,
  deactiveLoggedUser,
  resizeImage,
  uploadProfileImage
};
