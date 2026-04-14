const express = require('express');
const multer = require('multer');

const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
  resizeImage
} = require('../services/category.services');
const {
  getCategoryValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator
} = require('../utils/validators/categoryValidators');

const subCategoryRouter = require('./subcategory.router');

const router = express.Router();

router.use('/:categoryId/subcategories', subCategoryRouter);

router
  .route('/')
  .get(getCategories)
  .post(uploadCategoryImage, resizeImage, createCategoryValidator, createCategory);

router
  .route('/:id')
  .get(getCategoryValidator, getCategoryById)
  .patch(uploadCategoryImage, resizeImage, updateCategoryValidator, updateCategory)
  .delete(deleteCategoryValidator, deleteCategory);

module.exports = router;
