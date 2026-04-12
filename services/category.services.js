const Category = require('../models/category.model');
const { getOne, getAll, updateOne, deleteOne, createOne } = require('./factory');
const { addSlugToBasicModel } = require('../utils/slugHelpers');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const AppError = require('../utils/appError');
//Disk Storage Engine

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/categories');
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split('/')[1];
    const fileName = `category-${uuidv4()}-${Date.now()}.${ext}`;
    cb(null, fileName);
  }
});

const multerFilter = function (req, file, cb) {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Only image types are allowed', 400), false);
  }
};

const upload = multer({ storage: storage, fileFilter: multerFilter });

const uploadCategoryImage = upload.single('image');

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
  deleteCategory,
  uploadCategoryImage
};
