const asyncHandler = require('express-async-handler');
const slugify = require('slugify');

const Product = require('../models/product.model');
const AppError = require('../utils/appError');
const httpStatus = require('../utils/httpStatus');
const logger = require('../utils/logger');
const ApiFeatures = require('../utils/apiFeatures');

const getAllProducts = asyncHandler(async (req, res, next) => {
  // const queryStringObj = { ...req.query };
  // const excludedFields = ['page', 'sort', 'limit', 'fields'];
  // excludedFields.forEach((excludedField) => {
  //   delete queryStringObj[excludedField];
  // });
  //
  // let queryStr = JSON.stringify(queryStringObj);
  // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  // const page = req.query.page * 1 || 1;
  // const limit = req.query.limit * 1 || 5;
  // const skip = (page - 1) * limit;
  //
  // let mongoQuery = Product.find(JSON.parse(queryStr))
  //   .skip(skip)
  //   .limit(limit)
  //   .populate('category')
  //   .populate('subcategory');

  // if (req.query.sort) {
  //   const sortBy = req.query.sort.split(',').join(' ');
  //   mongoQuery = mongoQuery.sort(sortBy);
  // } else {
  //   mongoQuery = mongoQuery.sort('-createdAt');
  // }

  // if (req.query.fields) {
  //   const fields = req.query.fields.split(',').join(' ');
  //   mongoQuery = mongoQuery.select(fields);
  // } else {
  //   mongoQuery = mongoQuery.select('-__v');
  // }

  //searching feature

  // if (req.query.keyword) {
  //   const query = {};
  //   query.$or = [
  //     { title: { $regex: req.query.keyword, $options: 'i' } },
  //     { description: { $regex: req.query.keyword, $options: 'i' } }
  //   ];
  //   mongoQuery = mongoQuery.find(query);
  // }

  // const products = await mongoQuery;

  const apiFeatures = new ApiFeatures(Product.find(), req.query)
    .filter()
    .search()
    .limitFields()
    .sort();

  await apiFeatures.paginate();

  const { mongoQuery, paginationResult } = apiFeatures;
  const products = await mongoQuery.populate('category').populate('subcategory');

  res.status(200).json({
    status: httpStatus.SUCCESS,
    paginationResult,
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
  // if (!title || !description || !price || !quantity || !categoryId || !subcategoryId) {
  //   return next(
  //     new AppError(
  //       'All fields must be provided : title, description, price, quantity, categoryId , subcategoryId ',
  //       400
  //     )
  //   );
  // }
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
  // const { title, description, price, quantity, categoryId, subcategoryId } = req.body;
  // if (!title || !description || !price || !quantity || !categoryId || !subcategoryId) {
  //   return next(
  //     new AppError(
  //       'All fields must be provided : title, description, price, quantity, categoryId , subcategoryId ',
  //       400
  //     )
  //   );
  // }

  const product = await Product.findByIdAndUpdate(
    id,
    {
      // title: title,
      // slug: slugify(title),
      // description: description,
      // price: price,
      // quantity: quantity,
      // category: categoryId,
      // subcategory: subcategoryId
      ...req.body
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
