const express = require('express');

const {
  getAllReviews,
  getReviewById,
  deleteReview,
  updateReview,
  createReview
} = require('../services/review.services');

const {
  createReviewValidator,
  getReviewValidator,
  updateReviewValidator,
  deleteReviewValidator
} = require('../utils/validators/reviewValidators');

const verifyToken = require('../middlewares/verifyToken');
const restrictedTo = require('../middlewares/restrictedTo');

const router = express.Router();

router.use(verifyToken);

router.route('/').get(getAllReviews).post(restrictedTo('user'), createReview);

router
  .route('/:id')
  .get(getReviewById)
  .patch(restrictedTo('user'), updateReview)
  .delete(restrictedTo('admin', 'manager', 'user'), deleteReview);

module.exports = router;
