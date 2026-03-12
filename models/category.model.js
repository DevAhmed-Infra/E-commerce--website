const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category is required'],
        unique: [true, 'Category is unique'],
        minlength: [3, 'Category must be at least 3 characters'],
        maxlength: [32, 'Too long Category']
    },
    // A and B => shoping.com/a-and-b
    slug: {
        type: String,
        lowercase: true,
    },
    image: {
        type: String,

    }

}, {timestamps: true}); // => creates createdAt , updatedAt

const categoryModel = mongoose.model("Category", categorySchema);


module.exports = categoryModel;
