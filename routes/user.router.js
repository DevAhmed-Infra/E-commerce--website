const express = require('express');

const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  createUser,
  changeUserPassword,
  resizeImage,
  uploadProfileImage
} = require('../services/user.services');

const {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator
} = require('../utils/validators/userValidators');

const router = express.Router();

router.route('/changePassword/:id').patch(changeUserPasswordValidator, changeUserPassword);

router
  .route('/')
  .get(getAllUsers)
  .post(uploadProfileImage, resizeImage, createUserValidator, createUser);

router
  .route('/:id')
  .get(getUserValidator, getUserById)
  .patch(uploadProfileImage, resizeImage, updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser);

module.exports = router;
