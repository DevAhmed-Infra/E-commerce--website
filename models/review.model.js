const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String
    },
    rating: {
      type: Number,
      min: [1, 'min rating is 1'],
      max: [5, 'max rating is 5 '],
      required: [true, 'ratings is required']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'review must belong to a user']
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'review must belong to a user']
    }
  },
  { timestamps: true }
);


const reviewModel = mongoose.model('Review', reviewSchema);

module.exports = reviewModel;
