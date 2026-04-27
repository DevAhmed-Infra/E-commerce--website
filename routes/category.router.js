const express = require('express');

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

const verifyToken = require('../middlewares/verifyToken');
const restrictedTo = require('../middlewares/restrictedTo');

const subCategoryRouter = require('./subcategory.router');

const router = express.Router();

router.use('/:categoryId/subcategories', subCategoryRouter);

router
  .route('/')
  .get(getCategories)
  .post(
    verifyToken,
    restrictedTo('admin', 'manager'),
    uploadCategoryImage,
    resizeImage,
    createCategoryValidator,
    createCategory
  );

router
  .route('/:id')
  .get(getCategoryValidator, getCategoryById)
  .patch(
    verifyToken,
    restrictedTo('admin', 'manager'),
    uploadCategoryImage,
    resizeImage,
    updateCategoryValidator,
    updateCategory
  )
  .delete(verifyToken, restrictedTo('admin'), deleteCategoryValidator, deleteCategory);

module.exports = router;
