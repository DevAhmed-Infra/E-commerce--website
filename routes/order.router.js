const express = require('express');

const {
  createCashOrder,
  filterOrderForLoggedUser,
  getSpecificOrder,
  getAllOrders,
  updateOrderPaidStatusToPaid,
  checkoutSession,
  webhookCheckout
} = require('../services/order.services');

const {
  createCashOrderValidator,
  checkoutSessionValidator,
  getSpecificOrderValidator,
  updateOrderPaidStatusValidator
} = require('../utils/validators/orderValidators');

const verifyToken = require('../middlewares/verifyToken');
const restrictedTo = require('../middlewares/restrictedTo');

const router = express.Router();

router.post('/webhook-checkout', webhookCheckout);

router.use(verifyToken);

router.post(
  '/checkout-session/:cartId',
  restrictedTo('user'),
  checkoutSessionValidator,
  checkoutSession
);

router
  .route('/')
  .get(restrictedTo('admin', 'manager', 'user'), filterOrderForLoggedUser, getAllOrders)
  .post(restrictedTo('user'), createCashOrderValidator, createCashOrder);

router
  .route('/:id')
  .get(restrictedTo('admin', 'manager', 'user'), getSpecificOrderValidator, getSpecificOrder);

router
  .route('/:id/pay')
  .patch(
    restrictedTo('admin', 'manager', 'user'),
    updateOrderPaidStatusValidator,
    updateOrderPaidStatusToPaid
  );

module.exports = router;
