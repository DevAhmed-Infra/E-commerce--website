
const SubCategory = require('../models/subcategory.model');
const Category = require('../models/category.model');
const AppError = require('../utils/appError');
const { getOne, getAll, updateOne, deleteOne, createOne } = require('./factory');
const { addSlugToSubCategory } = require('../utils/slugHelpers');

// Middleware for nested route
const createFilterObj = (req, res, next) => {
  let filterObj = {};
  if (req.params.categoryId) {
    filterObj = { category: req.params.categoryId };
  }
  req.filterObj = filterObj;
  next();
};

const validateSubCategoryCreate = async (req, next) => {
  if (!req.body.categoryId) {
    req.body.categoryId = req.params.categoryId;
  }

  const { name, categoryId } = req.body;

  if (!name || !categoryId) {
    return next(new AppError('Both name and categoryId are required', 400));
  }

  const category = await Category.findById(categoryId);
  if (!category) {
    return next(new AppError('Category not found', 404));
  }
};

const prepareSubCategoryData = (data) => {
  return {
    name: data.name,
    slug: addSlugToSubCategory({ name: data.name }).slug,
    category: data.categoryId
  };
};

const createSubCategory = createOne(SubCategory, {
  preValidate: validateSubCategoryCreate,
  preProcess: prepareSubCategoryData,
  populate: 'category'
});

const getSubCategoryById = getOne(SubCategory, {
  modelName: 'Subcategory',
  populate: 'category'
});

const getAllSubCategories = getAll(SubCategory, {
  modelName: 'Subcategory',
  populate: 'category'
});

const updateSubCategory = updateOne(SubCategory, {
  modelName: 'Subcategory',
  preProcess: addSlugToSubCategory,
  populate: 'category'
});

const deleteSubCategory = deleteOne(SubCategory, {
  modelName: 'Subcategory'
});

module.exports = {
  createSubCategory,
  getSubCategoryById,
  getAllSubCategories,
  updateSubCategory,
  deleteSubCategory,
  createFilterObj
};
