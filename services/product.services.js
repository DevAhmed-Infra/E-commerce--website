const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const asyncHandler = require('express-async-handler');

const Product = require('../models/product.model');
const { getOne, getAll, createOne, updateOne, deleteOne } = require('./factory');
const { addSlug } = require('../utils/slugHelper');
const { uploadMixOfImages } = require('../middlewares/uploadImage');

const processProductData = (data) => {
  if (!data) return data;
  if (data.categoryId) {
    data.category = data.categoryId;
  }
  if (data.subcategoryId) {
    data.subcategory = data.subcategoryId;
  }
  return addSlug(data, 'title');
};

// const multerMemoryStorage = multer.memoryStorage();
//
// const multerFilter = function (req, file, cb) {
//   if (file.mimetype.startsWith('image')) {
//     cb(null, true);
//   } else {
//     cb(new AppError('Only image types are allowed', 400), false);
//   }
// };
//
// const upload = multer({ storage: multerMemoryStorage, fileFilter: multerFilter });

const uploadProductImages = uploadMixOfImages([
  {
    name: 'imageCover',
    maxCount: 1
  },
  {
    name: 'images',
    maxCount: 5
  }
]);

const resizeProductImages = asyncHandler(async (req, res, next) => {
  if (req.files?.imageCover?.[0]) {
    const imageCoverName = `product-${uuidv4()}-${Date.now()}.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 80 })
      .toFile(`uploads/products/${imageCoverName}`);

    req.body.imageCover = imageCoverName;
  }

  if (req.files?.images) {
    req.body.images = [];

    await Promise.all(
      req.files.images.map(async (img, idx) => {
        const imageName = `product-${uuidv4()}-${Date.now()}-${idx + 1}.jpeg`;

        await sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 80 })
          .toFile(`uploads/products/${imageName}`);

        req.body.images.push(imageName);
      })
    );
  }

  next();
});

const getAllProducts = getAll(Product, {
  modelName: 'Products',
  populate: ['category', 'subcategory']
});

const getProductById = getOne(Product, {
  modelName: 'Product',
  populate: ['category', 'subcategory', 'reviews']
});

const createProduct = createOne(Product, {
  preProcess: processProductData,
  populate: ['category', 'subcategory']
});

const updateProduct = updateOne(Product, {
  modelName: 'Product',
  preProcess: processProductData,
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
  deleteProduct,
  uploadProductImages,
  resizeProductImages
};
