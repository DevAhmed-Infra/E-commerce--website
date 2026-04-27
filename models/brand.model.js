const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Brand is required'],
      unique: [true, 'Brand is unique'],
      minlength: [3, 'Brand must be at least 3 characters'],
      maxlength: [32, 'Too long Brand']
    },
    slug: {
      type: String,
      lowercase: true
    },
    image: {
      type: String
    }
  },
  { timestamps: true }
);

const setImageURL = (doc) => {
  if (doc.image) {
    doc.image = `${process.env.BASE_URL}/brands/${doc.image}`;
  }
};

// findOne , findAll , update
brandSchema.post('init', (doc) => {
  setImageURL(doc);
});

// create
brandSchema.post('save', (doc) => {
  setImageURL(doc);
});

const brandModel = mongoose.model('Brand', brandSchema);

module.exports = brandModel;
