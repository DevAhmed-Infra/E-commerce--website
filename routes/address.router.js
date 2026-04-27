const express = require('express');

const {
  addAddressToAddresses,
  removeAddressFromAddresses,
  getLoggedUserAddresses
} = require('../services/address.services');

const verifyToken = require('../middlewares/verifyToken');
const restrictedTo = require('../middlewares/restrictedTo');

const router = express.Router();

router.use(verifyToken, restrictedTo('user'));
router.route('/').post(addAddressToAddresses).get(getLoggedUserAddresses);

router.route('/:address').delete(removeAddressFromAddresses);

module.exports = router;
