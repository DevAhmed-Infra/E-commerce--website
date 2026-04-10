const Product = require('../models/product.model');
const { getOne, getAll, createOne, updateOne, deleteOne } = require('./factory');
const { addSlugToProduct } = require('../utils/slugHelpers');

const getAllProducts = getAll(Product, {
  modelName: 'Products',
  populate: ['category', 'subcategory']
});

const getProductById = getOne(Product, {
  modelName: 'Product',
  populate: ['category', 'subcategory']
});

const createProduct = createOne(Product, {
  preProcess: addSlugToProduct,
  populate: ['category', 'subcategory']
});

const updateProduct = updateOne(Product, {
  modelName: 'Product',
  preProcess: addSlugToProduct,
  populate: ['category', 'subcategory']
});

const deleteProduct = deleteOne(Product, {
  modelName: 'Product'
});

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
