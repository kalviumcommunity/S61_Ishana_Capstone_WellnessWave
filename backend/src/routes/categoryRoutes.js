const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategoryDetails
} = require('../controllers/categoryController');

// GET /api/categories & Retrieve all unique categories
router.get('/', getAllCategories);

// GET /api/categories/details & Retrieve category details with product count
router.get('/details', getCategoryDetails);

module.exports = router;
