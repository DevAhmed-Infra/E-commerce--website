const express = require('express');

const {
  getAllReviews,
  getReviewById,
  deleteReview,
  updateReview,
  createReview
} = require('../services/review.services');

const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

router.use(verifyToken);

router.route('/').get(getAllReviews).post(createReview);

router.route('/:id').get(getReviewById).patch(updateReview).delete(deleteReview);

module.exports = router;
