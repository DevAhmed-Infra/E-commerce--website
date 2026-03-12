const express = require('express');
const {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} = require('../services/category.services');
const router = express.Router();


router.route('/')
    .get(getCategories)
    .post(createCategory);


router.route('/:id')
    .get(getCategoryById)
    .patch(updateCategory)
    .delete(deleteCategory);


module.exports = router;