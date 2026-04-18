const express = require('express');

const {
  getAllUsers,
  getUserById,
  getLoggedUser,
  updateUser,
  deleteUser,
  createUser,
  changeUserPassword,
  updateLoggedUserPassword,
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

const verifyToken = require('../middlewares/verifyToken');
const restrictedTo = require('../middlewares/restrictedTo');

const router = express.Router();

router
  .route('/')
  .get(verifyToken, restrictedTo('admin', 'manager'), getAllUsers)
  .post(
    verifyToken,
    restrictedTo('admin', 'manager'),
    uploadProfileImage,
    resizeImage,
    createUserValidator,
    createUser
  );

router.route('/getMe').get(verifyToken, getLoggedUser);
router.route('/changeMyPassword').patch(verifyToken, updateLoggedUserPassword);

router
  .route('/changePassword/:id')
  .patch(
    verifyToken,
    restrictedTo('admin', 'manager'),
    changeUserPasswordValidator,
    changeUserPassword
  );

router
  .route('/:id')
  .get(verifyToken, restrictedTo('admin', 'manager'), getUserValidator, getUserById)
  .patch(
    verifyToken,
    restrictedTo('admin', 'manager'),
    uploadProfileImage,
    resizeImage,
    updateUserValidator,
    updateUser
  )
  .delete(verifyToken, restrictedTo('admin'), deleteUserValidator, deleteUser);

module.exports = router;
