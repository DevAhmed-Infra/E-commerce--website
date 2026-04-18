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
  deactiveLoggedUser,
  logout,
  resizeImage,
  uploadProfileImage,
  updateLoggedUser
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
const { verify } = require('node:crypto');

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
router.route('/updateMe').patch(verifyToken, updateLoggedUser);
router.route('/deleteMe').patch(verifyToken, deactiveLoggedUser);
router.route('/logout').post(verifyToken, logout);

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
