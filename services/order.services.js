const stripe = require('stripe')(process.env.STRIPE_SECRET);

const asyncHandler = require('express-async-handler');

const Order = require('../models/order.model');
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');

const AppError = require('../utils/appError');
const httpStatus = require('../utils/httpStatus');

const factory = require('./factory');

const createCashOrder = asyncHandler(async (req, res, next) => {
  // 1) find cart
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(new AppError('No cart found for this user', 404));
  }

  if (cart.cartItems.length === 0) {
    return next(new AppError('Cart is empty', 400));
  }

  // 2) validate stock
  for (const item of cart.cartItems) {
    const product = await Product.findById(item.product);

    if (!product) {
      return next(new AppError(`Product ${item.product} no longer exists`, 404));
    }

    if (product.quantity < item.quantity) {
      return next(
        new AppError(
          `Insufficient stock for product "${product.title}". Available: ${product.quantity}`,
          400
        )
      );
    }
  }

  // 3) calculate total price
  const totalOrderPrice = cart.priceAfterDiscount || cart.totalCartPrice;

  // 4) create Order
  const order = await Order.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    shippingPrice: req.body.shippingPrice || 0,
    totalOrderPrice,
    paymentMethodType: 'cash',
    isPaid: false,
    isDelivered: false
  });

  // 5) update product stock & sold count
  const bulkOptions = cart.cartItems.map((item) => ({
    updateOne: {
      filter: { _id: item.product },
      update: {
        $inc: {
          quantity: -item.quantity,
          sold: +item.quantity
        }
      }
    }
  }));

  await Product.bulkWrite(bulkOptions);

  // 6) clear cart
  await Cart.findByIdAndDelete(cart._id);

  res.status(201).json({
    status: httpStatus.SUCCESS,
    data: order
  });
});

const filterOrderForLoggedUser = asyncHandler(async (req, res, next) => {
  if (req.user.role === 'user') req.filterObj = { user: req.user._id };
  next();
});

const getAllOrders = factory.getAll(Order, {
  modelName: 'Order'
});

const getSpecificOrder = factory.getOne(Order, {
  modelName: 'Order'
});

const updateOrderPaidStatusToPaid = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('no found order', 404));
  }

  order.isPaid = true;
  order.paidAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({
    status: httpStatus.SUCCESS,
    data: updatedOrder
  });
});

const checkoutSession = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({
    _id: req.params.cartId,
    user: req.user._id
  });
  const shippingAddress = req.body.shippingAddress || {};

  if (!cart) {
    return next(new AppError('No cart found for this user', 404));
  }

  if (cart.cartItems.length === 0) {
    return next(new AppError('Cart is empty', 400));
  }

  // 2) validate stock
  for (const item of cart.cartItems) {
    const product = await Product.findById(item.product);

    if (!product) {
      return next(new AppError(`Product ${item.product} no longer exists`, 404));
    }

    if (product.quantity < item.quantity) {
      return next(
        new AppError(
          `Insufficient stock for product "${product.title}". Available: ${product.quantity}`,
          400
        )
      );
    }
  }

  // 3) calculate total price
  const totalOrderPrice = cart.priceAfterDiscount || cart.totalCartPrice;

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'egp',
          unit_amount: totalOrderPrice * 100,
          product_data: {
            name: `Order for ${req.user.email}`
          }
        },
        quantity: 1
      }
    ],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/orders`,
    cancel_url: `${req.protocol}://${req.get('host')}/carts`,
    customer_email: req.user.email,
    client_reference_id: String(cart._id),
    metadata: {
      details: shippingAddress.details ? String(shippingAddress.details) : '',
      phone: shippingAddress.phone ? String(shippingAddress.phone) : '',
      city: shippingAddress.city ? String(shippingAddress.city) : '',
      postalCode: shippingAddress.postalCode ? String(shippingAddress.postalCode) : ''
    },
    shipping_address_collection: {
      allowed_countries: ['EG']
    }
  });

  res.status(200).json({
    status: httpStatus.SUCCESS,
    data: session
  });
});

const createCardOrder = async (session) => {
  const cartId = session.client_reference_id;
  const shippingAddress = session.metadata;
  const orderPrice = session.amount_total / 100;

  const cart = await Cart.findById(cartId);
  if (!cart) return;

  const user = await User.findOne({ email: session.customer_email });
  if (!user) return;

  const order = await Order.create({
    user: user._id,
    cartItems: cart.cartItems,
    shippingAddress,
    totalOrderPrice: orderPrice,
    isPaid: true,
    paidAt: Date.now(),
    paymentMethodType: 'card'
  });

  if (order) {
    const bulkOptions = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } }
      }
    }));

    await Product.bulkWrite(bulkOptions);
    await Cart.findByIdAndDelete(cartId);
  }
};

const webhookCheckout = asyncHandler(async (req, res) => {
  const signature = req.headers['stripe-signature'];
  const payload = req.rawBody || req.body;

  let event;

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET;
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    await createCardOrder(event.data.object);
  }

  res.status(200).json({ received: true });
});

module.exports = {
  createCashOrder,
  filterOrderForLoggedUser,
  getSpecificOrder,
  getAllOrders,
  updateOrderPaidStatusToPaid,
  checkoutSession,
  webhookCheckout
};
