const asyncHandler = require('express-async-handler');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

const { getOne, getAll, updateOne, deleteOne, createOne } = require('./factory');
const { addSlugToBrand } = require('../utils/slugHelpers');
const { uploadSingleImage } = require('../middlewares/uploadImage');
const Brand = require('../models/brand.model');

const resizeImage = asyncHandler(async (req, res, next) => {
  const fileName = `brand-${uuidv4()}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat('jpeg')
    .jpeg({ quality: 100 })
    .toFile(`uploads/brands/${fileName}`); // Removed leading slash

  req.body.image = fileName;
  next();
});

const uploadBrandImage = uploadSingleImage('image');

const getAllBrands = getAll(Brand, {
  modelName: 'Brand'
});

const getBrandById = getOne(Brand, {
  modelName: 'Brand'
});

const createBrand = createOne(Brand, {
  preProcess: addSlugToBrand
});

const updateBrand = updateOne(Brand, {
  modelName: 'Brand',
  preProcess: addSlugToBrand
});

const deleteBrand = deleteOne(Brand, {
  modelName: 'Brand'
});

module.exports = {
  getAllBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  getBrandById,
  resizeImage,
  uploadBrandImage
};
