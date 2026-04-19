const { getOne, getAll, updateOne, deleteOne, createOne } = require('./factory');
const Review = require('../models/review.model');

const getAllReviews = getAll(Review, {
  modelName: 'Review',
  populate: 'user'
});

const getReviewById = getOne(Review, {
  modelName: 'Review',
  populate: 'user'
});

const createReview = createOne(Review, {
  modelName: 'Review',
  populate: 'user'
});

const deleteReview = deleteOne(Review, {
  modelName: 'Review',
});

const updateReview = updateOne(Review, {
  modelName: 'Review',
  populate: 'user'
});

module.exports = {
  getReviewById,
  getAllReviews,
  createReview,
  deleteReview,
  updateReview
};
