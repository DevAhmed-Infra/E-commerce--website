const asyncHandler = require('express-async-handler');
const slugify = require('slugify');

const httpStatus = require('../utils/httpStatus');
const SubCategory = require('../models/subcategory.model');
const Category = require('../models/category.model');
const AppError = require('../utils/appError');

// for Nested Route
const createFilterObj = (req, res, next) => {
  let filterObj = {};
  if (req.params.categoryId) {
    filterObj = { category: req.params.categoryId };
  }
  req.filterObj = filterObj;
  next();
};

const createSubCategory = asyncHandler(async (req, res, next) => {
  // Nested Route
  if (!req.body.categoryId) req.body.categoryId = req.params.categoryId;
  const { name, categoryId } = req.body;

  if (!name || !categoryId) {
    return next(new AppError('Both name and categoryId are required', 400));
  }

  const category = await Category.findById(categoryId);

  if (!category) {
    return next(new AppError('Category not found', 404));
  }

  const subcategory = await SubCategory.create({
    name,
    slug: slugify(name),
    category: categoryId
  });

  await subcategory.populate('category');

  res.status(201).json({
    status: httpStatus.SUCCESS,
    data: subcategory
  });
});

const getSubCategoryById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const subcategory = await SubCategory.findById(id);

  if (!subcategory) {
    return next(new AppError('Subcategory not found', 404));
  }

  res.status(200).json({
    status: httpStatus.SUCCESS,
    data: subcategory
  });
});

const getAllSubCategories = asyncHandler(async (req, res, next) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 5;
  const skip = (page - 1) * limit;

  const subCategories = await SubCategory.find(req.filterObj)
    .skip(skip)
    .limit(limit)
    .populate('category');

  res.status(200).json({
    status: httpStatus.SUCCESS,
    results: subCategories.length,
    page: page,
    data: subCategories
  });
});

const updateSubCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const subCategory = await SubCategory.findByIdAndUpdate(
    id,
    {
      name: req.body.name,
      slug: slugify(req.body.name),
      category: req.body.category
    },
    {
      new: true,
      runValidators: true
    }
  );
  if (!subCategory) {
    return next(new AppError('Subcategory not found', 404));
  }

  await subCategory.populate('category');

  res.status(200).json({
    status: httpStatus.SUCCESS,
    data: subCategory
  });
});

const deleteSubCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const subCategory = await SubCategory.findByIdAndDelete(id);
  if (!subCategory) {
    return next(new AppError('Subcategory not found', 404));
  }

  res.status(204).json({
    status: httpStatus.SUCCESS,
    data: null
  });
});

// Nested Route
// GET /CategoryId/Subcategories // Category → Parent (Router.use)   // SubCategory → Child (mergeparam : true)

module.exports = {
  createSubCategory,
  getSubCategoryById,
  getAllSubCategories,
  updateSubCategory,
  deleteSubCategory,
  createFilterObj
};
