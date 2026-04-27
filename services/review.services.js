const { getOne, getAll, updateOne, deleteOne, createOne } = require('./factory');
const Review = require('../models/review.model');
const setIdToBody = require('../middlewares/setIdToBody');

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
  preValidate: setIdToBody({ paramName: 'productId', bodyField: 'product' })
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
