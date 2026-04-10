const Category = require('../models/category.model');
const { getOne, getAll, updateOne, deleteOne, createOne } = require('./factory');
const { addSlugToBasicModel } = require('../utils/slugHelpers');

const getCategories = getAll(Category, {
  modelName: 'Category'
});

const getCategoryById = getOne(Category, {
  modelName: 'Category'
});

const createCategory = createOne(Category, {
  preProcess: addSlugToBasicModel
});

const updateCategory = updateOne(Category, {
  modelName: 'Category',
  preProcess: addSlugToBasicModel
});

const deleteCategory = deleteOne(Category, {
  modelName: 'Category'
});

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
};
