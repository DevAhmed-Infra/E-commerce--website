const asyncHandler = require('express-async-handler');
const slugify = require('slugify');

const Product = require('../models/product.model');
const AppError = require('../utils/appError');
const httpStatus = require('../utils/httpStatus');

const getAllProducts = asyncHandler(async (req, res, next) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 5;
  const skip = (page - 1) * limit;

  const products = await Product.find({}).skip(skip).limit(limit);

  await products.populate(['category', 'subcategory']);

  res.status(200).json({
    status: httpStatus.SUCCESS,
    results: products.length,
    page: page,
    data: products
  });
});

const getProductById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  await product.populate(['category', 'subcategory']);

  res.status(200).json({
    status: httpStatus.SUCCESS,
    data: product
  });
});

const createProduct = asyncHandler(async (req, res, next) => {
  const { title, description, price, quantity, categoryId, subcategoryId } = req.body;
  if (!title || !description || !price || !quantity || !categoryId || !subcategoryId) {
    return next(
      new AppError(
        'All fields must be provided : title, description, price, quantity, categoryId , subcategoryId ',
        400
      )
    );
  }
  const product = await Product.create({
    title: title,
    slug: slugify(title),
    description: description,
    price: price,
    quantity: quantity,
    category: categoryId,
    subcategory: subcategoryId
  });

  if (!product) {
    return next(new AppError('Product not created', 400));
  }

  await product.populate(['category', 'subcategory']);
  res.status(201).json({
    status: httpStatus.SUCCESS,
    data: product
  });
});

const updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { title, description, price, quantity, categoryId, subcategoryId } = req.body;
  if (!title || !description || !price || !quantity || !categoryId || !subcategoryId) {
    return next(
      new AppError(
        'All fields must be provided : title, description, price, quantity, categoryId , subcategoryId ',
        400
      )
    );
  }

  const product = await Product.findByIdAndUpdate(
    id,
    {
      title: title,
      slug: slugify(title),
      description: description,
      price: price,
      quantity: quantity,
      category: categoryId,
      subcategory: subcategoryId
    },
    {
      new: true,
      runValidators: true
    }
  );

  if (!product) {
    return next(new AppError('Product not updated', 400));
  }

  await product.populate(['category', 'subcategory']);

  res.status(200).json({
    status: httpStatus.SUCCESS,
    data: product
  });
});

const deleteProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }
  res.status(204).json({
    status: httpStatus.SUCCESS,
    data: null
  });
});

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
