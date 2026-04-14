const Category = require('../models/category.model');
const { getOne, getAll, updateOne, deleteOne, createOne } = require('./factory');
const { addSlugToBasicModel } = require('../utils/slugHelpers');
const AppError = require('../utils/appError');

const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const asyncHandler = require('express-async-handler');

//Disk Storage Engine  → returns a file
// const multerDistkStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, './uploads/categories');
//   },
//   filename: function (req, file, cb) {
//     const ext = file.mimetype.split('/')[1];
//     const fileName = `category-${uuidv4()}-${Date.now()}.${ext}`;
//     cb(null, fileName);
//   }
// });
// const upload = multer({ storage: multerDistkStorage, fileFilter: multerFilter });

// Memory Storage → returns a buffer (sharp takes buffer files)

const multerMemoryStorage = multer.memoryStorage();

const multerFilter = function (req, file, cb) {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Only image types are allowed', 400), false);
  }
};

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

const upload = multer({ storage: multerMemoryStorage, fileFilter: multerFilter });

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
  uploadCategoryImage,
  resizeImage
};
