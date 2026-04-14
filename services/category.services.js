const Category = require('../models/category.model');
const { getOne, getAll, updateOne, deleteOne, createOne } = require('./factory');
const { addSlugToBasicModel } = require('../utils/slugHelpers');

const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const asyncHandler = require('express-async-handler');
const { uploadSingleImage } = require('../middlewares/uploadImage');

const resizeImage = asyncHandler(async (req, res, next) => {
  const fileName = `category-${uuidv4()}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat('jpeg')
    .jpeg({ quality: 100 })
    .toFile(`uploads/categories/${fileName}`); // Removed leading slash

  req.body.image = fileName;
  next();
});

// const upload = multer({ storage: multerMemoryStorage, fileFilter: multerFilter });

// const uploadCategoryImage = upload.single('image');

const uploadCategoryImage = uploadSingleImage('image');

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
  uploadCategoryImage,
  resizeImage
};
