const express = require('express');

const {
  createBrand,
  getBrandById,
  deleteBrand,
  getAllBrands,
  updateBrand,
  uploadBrandImage,
  resizeImage
} = require('../services/brand.services');

const {
  getBrandValidator,
  createBrandValidator,
  updateBrandValidator,
  deleteBrandValidator
} = require('../utils/validators/brandValidators');

const router = express.Router();

router
  .route('/')
  .post(uploadBrandImage, resizeImage, createBrandValidator, createBrand)
  .get(getAllBrands);

router
  .route('/:id')
  .get(getBrandValidator, getBrandById)
  .patch(uploadBrandImage, resizeImage, updateBrandValidator, updateBrand)
  .delete(deleteBrandValidator, deleteBrand);

module.exports = router;
