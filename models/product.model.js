const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, 'too short title'],
      maxlength: [100, 'too long description']
    },
    slug: {
      type: String,
      required: true,
      lowercase: true
    },
    description: {
      type: String,
      required: true,
      minlength: [20, 'too short description']
    },
    quantity: {
      type: Number,
      required: [true, 'product must be available']
    },
    sold: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'product must have a price'],
      trim: true,
      min: [0, 'price cannot be negative']
    },
    priceAfterDiscount: {
      type: Number
    },
    color: {
      type: [String]
    },
    imageCover: {
      type: String
    },
    images: {
      type: [String]
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: [true, 'Product must belong to a category']
    },
    subcategory: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Subcategory'
      }
    ],
    brand: {
      type: mongoose.Schema.ObjectId,
      ref: 'Brand'
    },
    ratingAverage: {
      type: Number,
      min: [1, 'Rating must be above 1'],
      max: [5, 'Rating must be below 5']
    },
    ratingQuantity: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

const setImageURL = (doc) => {
  if (doc.imageCover) {
    const imageURL = `${process.env.BASE_URL}/products/${doc.imageCover}`;
    doc.imageCover = imageURL;
  }
  if (doc.images) {
    const imageList = [];
    doc.images.forEach((image) => {
      const imageURL = `${process.env.BASE_URL}/products/${image}`;
      imageList.push(imageURL);
    });
    doc.images = imageList;
  }
};

productSchema.post('init', (doc) => {
  setImageURL(doc);
});

productSchema.post('save', (doc) => {
  setImageURL(doc);
});

const productModel = mongoose.model('Product', productSchema);

module.exports = productModel;
