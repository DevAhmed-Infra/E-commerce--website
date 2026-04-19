const { getOne, getAll, updateOne, deleteOne, createOne } = require('./factory');
const Review = require('../models/review.model');
const { modelName } = require('../models/user.model');

const getAllReviews = getAll(Review, {
  modelName: 'Review'
});

const getReviewById = getOne(Review, {
  modelName: 'Review'
});

const createReview = createOne(Review, {
  modelName: 'Review'
});

const deleteReview = deleteOne(Review, {
  modelName: 'Review'
});

const updateReview = updateOne(Review, {
  modelName: 'Review'
});

module.exports = {
  getReviewById,
  getAllReviews,
  createReview,
  deleteReview,
  updateReview
};
