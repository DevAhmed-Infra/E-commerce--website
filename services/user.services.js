const asyncHandler = require('express-async-handler');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const slugify = require('slugify');

const User = require('../models/user.model');
const { getOne, getAll, deleteOne, createOne } = require('./factory');
const { addSlug } = require('../utils/slugHelper');
const { uploadSingleImage } = require('../middlewares/uploadImage');
const httpStatus = require('../utils/httpStatus');

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
  const user = await User.findById(req.user.id).select('-password -role -active -slug');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
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

  res.status(200).json({
    status: httpStatus.SUCCESS,
    data: user
  });
});

const changeUserPassword = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { password } = req.body;

  const user = await User.findById(id);

  user.password = password;
  await user.save();

  user.password = undefined;

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

module.exports = {
  getAllUsers,
  getUserById,
  getLoggedUser,
  updateUser,
  deleteUser,
  createUser,
  changeUserPassword,
  resizeImage,
  uploadProfileImage
};
