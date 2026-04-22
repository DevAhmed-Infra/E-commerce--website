const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'order must belong to a user']
    },
    cartItems: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: 'Product',
          required: [true, 'order must have at least one product']
        },
        quantity: {
          type: Number,
          required: [true, 'product quantity is required'],
          min: [1, 'quantity must be at least 1']
        },
        color: String,
        price: Number
      }
    ],
    taxPrice: {
      type: Number,
      default: 0
    },
    shippingAddress: {
      details: String,
      phone: String,
      city: String,
      postalCode: String
    },
    shippingPrice: {
      type: Number,
      default: 0
    },
    totalOrderPrice: {
      type: Number
    },
    paymentMethodType: {
      type: String,
      enum: ['card', 'cash'],
      default: 'cash'
    },
    isPaid: {
      type: Boolean,
      default: false
    },
    paidAt: Date,
    isDelivered: {
      type: Boolean,
      default: false
    },
    deliveredAt: Date
  },
  { timestamps: true }
);

const orderModel = mongoose.model('Order', orderSchema);

module.exports = orderModel;
