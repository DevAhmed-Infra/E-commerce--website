const express = require('express');

const {
  addProductToWishlist,
  removeProductFromWishlist,
  getLoggedUserWishlist
} = require('../services/wishlist.services');

const verifyToken = require('../middlewares/verifyToken');
const restrictedTo = require('../middlewares/restrictedTo');

const router = express.Router();

router.use(verifyToken, restrictedTo('user'));
router.route('/').post(addProductToWishlist).get(getLoggedUserWishlist);

router.route('/:product').delete(removeProductFromWishlist);

module.exports = router;
