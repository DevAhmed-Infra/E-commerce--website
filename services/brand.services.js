const Brand = require('../models/brand.model');
const { getOne, getAll, updateOne, deleteOne, createOne } = require('./factory');
const { addSlugToBrand } = require('../utils/slugHelpers');

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
  getBrandById
};
